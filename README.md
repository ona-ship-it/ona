# Onagui - Web3 Giveaway & Raffle Platform

A provably fair, blockchain-enabled platform for creating and participating in giveaways, raffles, and community fundraisers. Built with Next.js, Supabase, and multi-chain Web3 support.

## 🎯 Features

### Core Functionality
- **Giveaways** - Free and paid ticket giveaway campaigns
- **Raffles** - Randomized winner selection with blockchain verification
- **Marketplace** - Buy and sell items within the platform
- **Fundraisers** - Community-driven fundraising campaigns
- **User Profiles** - Customizable user profiles with activity tracking

### Web3 Integration
- **Multi-Chain Wallet Support**
  - Solana (Phantom wallet)
  - Bitcoin (Sats Connect)
  - EVM chains (Ethers.js)
- **Crypto Payments** - Direct payment processing via crypto wallets
- **Blockchain Verification** - Transparent, verifiable winner drawing

### User Features
- Email authentication with verification
- User account management
- Ticket and raffle tracking
- Like & save functionality
- Share on social media
- Dark/light theme support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (https://supabase.com)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ona-ship-it/ona.git
cd ona
git checkout onagui-test
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials (see [Configuration](#configuration) section below).

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Cron Jobs
CRON_SECRET=your_custom_cron_secret

# Sentry Error Logging (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Local Env Check During Build

`npm run build` now runs a prebuild env checker that prints:

- vars missing in your local shell/.env files
- which vars are truly required in production
- which vars are only recommended

Local builds will warn (not fail) when required production vars are only missing locally.
CI/runtime builds fail if required production vars are missing.

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Run the database migrations (SQL schema files in `/supabase/migrations` - if migrating from existing DB)
3. Set up Auth as described below
4. Create storage buckets for images

### Authentication Setup

Supabase Auth is pre-configured. To enable email verification:

1. Go to your Supabase project settings
2. Navigate to Auth → Email Templates
3. Customize email templates as needed
4. Enable "Confirm email" requirement in Auth Policies

## 📦 Project Structure

```
src/
├── app/                      # Next.js 13+ App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── cron/           # Scheduled jobs
│   │   └── raffles/        # Raffle operations
│   ├── account/            # User account pages
│   ├── giveaways/          # Giveaway pages
│   ├── raffles/            # Raffle pages
│   ├── marketplace/        # Marketplace pages
│   ├── profiles/           # Profile pages
│   ├── signin/login/       # Auth pages
│   └── layout.tsx          # Root layout
├── components/             # React components
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts         # Auth state management
│   ├── useRequireAuth.ts  # Protected route hook
│   └── useWallet.tsx      # Wallet integration
├── lib/                    # Utilities and helpers
│   ├── supabase.ts        # Supabase client (browser)
│   ├── supabaseServer.ts  # Supabase client (server)
│   ├── wallet.ts          # Wallet utilities
│   └── email.ts           # Email helpers
├── styles/                # Global styles
├── utils/                 # Helper functions
└── middleware.ts          # Next.js middleware

public/                    # Static assets
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/send-verification` - Send email verification
- `POST /api/auth/verify-email` - Verify email token

### Raffles
- `GET /api/raffles` - List raffles (with search/filter)
- `POST /api/raffles/:id/buy` - Purchase raffle ticket

### System
- `POST /api/cron/draw-winners` - Automated winner drawing
  - Secured with `Authorization: Bearer <CRON_SECRET>`
- `POST /api/cron/send-emails` - Process pending winner notifications
  - Secured with `Authorization: Bearer <CRON_SECRET>`

See [API Documentation](./docs/API.md) for detailed endpoint specifications.

## 🧪 Testing

### Run Tests
```bash
npm run test:e2e           # Run Playwright E2E tests
npm run test:unit         # Run unit tests (when implemented)
npm run test              # Run all tests
```

### Test Files Structure
```
tests/
├── e2e/                  # End-to-end tests
├── unit/                 # Unit tests
└── integration/          # Integration tests
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

Vercel is the recommended platform for Next.js apps.

1. **Connect your GitHub repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Follow the setup wizard

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.example`

3. **Deploy**
   ```bash
   # Automatic: Every push to main branch deploys
   # Manual: Use Vercel CLI
   npm i -g vercel
   vercel deploy --prod
   ```

### Scheduled Jobs (Cron)

Cron scheduling is handled by GitHub Actions workflows:

- `.github/workflows/draw-winners-cron.yml` runs hourly
- `.github/workflows/send-emails-cron.yml` runs every 15 minutes

Both call production endpoints with:

`Authorization: Bearer ${{ secrets.CRON_SECRET }}`

Vercel hosts the API routes; GitHub Actions is the scheduler of record.

## 💳 Crypto Payment Integration

The platform supports crypto payments for raffle tickets and fundraisers.

### Supported Networks
- **Solana**: Via Phantom Wallet
- **Bitcoin**: Via Sats Connect
- **EVM Chains**: Via Ethers.js (Ethereum, Polygon, etc.)

### Accepting Payments

To enable crypto payments in your UI:

```tsx
import { useWallet } from '@/hooks/useWallet'

export function PaymentButton() {
  const { connected, publicKey, disconnect } = useWallet()
  
  if (!connected) {
    return <button onClick={connectWallet}>Connect Wallet</button>
  }
  
  return (
    <button onClick={() => processCryptoPayment(publicKey)}>
      Pay with Crypto
    </button>
  )
}
```

See [Crypto Payments Guide](./docs/CRYPTO_PAYMENTS.md) for implementation details.

## 🐛 Error Handling & Logging

The application includes global error handling and optional error logging:

### Client-Side Errors
- Global error boundary catches React errors
- User-friendly error messages displayed
- Errors logged to Sentry (if configured)

### Server-Side Errors
- API errors logged with context
- Database errors sanitized for client
- Cron job errors reported

### Configure Sentry (Optional)

1. Create a Sentry account at https://sentry.io
2. Create a Next.js project
3. Add `NEXT_PUBLIC_SENTRY_DSN` to environment variables
4. Errors will be automatically reported

## 🔍 Search & Filtering

### Search Functionality

Search raffles and giveaways by title and description:

```
GET /api/raffles?search=bitcoin&filter=active&sort=newest
```

**Query Parameters:**
- `search` - Full-text search term
- `filter` - Status filter (active, completed, cancelled, all)
- `sort` - Sort order (newest, popular, ending-soon)
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **Format**: ESLint + Prettier
- **Language**: TypeScript (strict mode)
- **Testing**: All features should have tests

Run linting:
```bash
npm run lint              # Check for errors
npm run lint -- --fix    # Auto-fix issues
```

## 📋 Roadmap

- [x] Core giveaway & raffle functionality
- [x] Multi-chain wallet support
- [x] Email authentication
- [ ] Enhanced search & filtering
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] Stripe payment integration
- [ ] Two-factor authentication
- [ ] Streaming/live events
- [ ] NFT integration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues ([https://github.com/ona-ship-it/ona/issues](https://github.com/ona-ship-it/ona/issues))
- **Discussions**: GitHub Discussions
- **Email**: support@onagui.com

## 🙏 Acknowledgments

- Supabase for authentication and database
- Solana for Web3 infrastructure
- Next.js community for framework excellence

---

**Happy building! 🚀**
