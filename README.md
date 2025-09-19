This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🚀 CI/CD Pipeline Test

This section was added to test our GitHub Actions CI/CD pipeline! The following workflows should trigger:

- **CI Workflow**: Code quality checks, linting, testing, and security audits
- **Deployment Workflow**: Automated deployment to Vercel (on master branch)
- **Maintenance Workflow**: Weekly dependency updates and health checks

### Pipeline Features:
- ✅ ESLint and Prettier code quality checks
- ✅ Multi-version Node.js testing (18.x, 20.x, 21.x)
- ✅ Security auditing with npm audit and TruffleHog
- ✅ Bundle size analysis for pull requests
- ✅ Automated Vercel deployments
- ✅ Performance monitoring with Lighthouse
- ✅ Dependabot for dependency updates

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
