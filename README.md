# Multas Zero

Analisa multas de trânsito em Portugal com IA e gera cartas de defesa profissionais.

## Funcionalidades

- **Análise com IA**: Upload de imagem da multa para análise automática
- **Deteção de erros**: Identifica falhas técnicas e jurídicas na notificação
- **Geração de defesa**: Cria carta de contestação formal para a ANSR
- **Modelo Pay-per-use**: Análise gratuita, desbloqueio pago (2,45€)

## Tech Stack

- React 19 + TypeScript
- Vite
- Google Gemini AI
- Stripe (pagamentos)
- Tailwind CSS
- Vercel (deploy)

## Setup Local

**Pré-requisitos:** Node.js 18+

1. Instala dependências:
   ```bash
   npm install
   ```

2. Copia `.env.example` para `.env.local` e preenche as chaves:
   ```bash
   cp .env.example .env.local
   ```

3. Configura as variáveis de ambiente:
   - `GEMINI_API_KEY` - [Google AI Studio](https://aistudio.google.com/)
   - `STRIPE_SECRET_KEY` - [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - `STRIPE_PUBLISHABLE_KEY` - Stripe Dashboard
   - `STRIPE_WEBHOOK_SECRET` - Stripe Webhooks

4. Corre a app:
   ```bash
   npm run dev
   ```

## Deploy no Vercel

1. Importa o repositório no Vercel
2. Configura as variáveis de ambiente no dashboard
3. Deploy automático

## Estrutura

```
├── api/                 # Serverless functions (Stripe)
├── components/          # React components
├── services/            # Business logic (Gemini, pagamentos)
├── types.ts             # TypeScript types
├── App.tsx              # Main component
└── vercel.json          # Vercel config
```

## Licença

MIT
