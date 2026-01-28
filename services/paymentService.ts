// Payment service for Multas Zero
// Handles Stripe checkout and local storage of unlocked analyses

const STORAGE_KEY = 'multasZeroUnlocked';

export interface UnlockedAnalysis {
  unlockedAt: number;
  sessionId: string;
}

export interface UnlockedStore {
  [analysisId: string]: UnlockedAnalysis;
}

// Check if an analysis is unlocked
export const isAnalysisUnlocked = (analysisId: string): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const unlocked: UnlockedStore = JSON.parse(stored);
    return !!unlocked[analysisId];
  } catch {
    return false;
  }
};

// Mark an analysis as unlocked
export const unlockAnalysis = (analysisId: string, sessionId: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const unlocked: UnlockedStore = stored ? JSON.parse(stored) : {};

    unlocked[analysisId] = {
      unlockedAt: Date.now(),
      sessionId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  } catch (error) {
    console.error('Failed to save unlock status:', error);
  }
};

// Get all unlocked analyses
export const getUnlockedAnalyses = (): UnlockedStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Create Stripe checkout session and redirect
export const createCheckoutSession = async (analysisId: string): Promise<void> => {
  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysisId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();

    if (url) {
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

// Verify payment after returning from Stripe
export const verifyPayment = async (sessionId: string): Promise<{
  paid: boolean;
  analysisId?: string;
}> => {
  try {
    const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    return { paid: false };
  }
};

// Handle successful payment (call after redirect back from Stripe)
export const handlePaymentSuccess = async (sessionId: string, analysisId: string): Promise<boolean> => {
  try {
    // Verify with backend
    const result = await verifyPayment(sessionId);

    if (result.paid) {
      // Mark as unlocked in localStorage
      unlockAnalysis(analysisId, sessionId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Handle payment success error:', error);
    return false;
  }
};
