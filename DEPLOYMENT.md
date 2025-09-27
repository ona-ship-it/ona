# Deploying to Vercel

This document provides instructions for deploying the Onagui application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your GitHub repository connected to Vercel
- Your domain (www.onagui.com) ready to be configured

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure your code is pushed to a GitHub repository.

### 2. Import Your Project in Vercel

1. Log in to your Vercel account
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: (leave as default)
   - Output Directory: (leave as default)

### 3. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

| Name | Value | Description |
|------|-------|-------------|
| `NEXTAUTH_SECRET` | [your-secret-value] | The secret used to encrypt tokens (you already have this) |
| `NEXTAUTH_URL` | https://www.onagui.com | Your production URL |

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Configure Custom Domain

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your domain (www.onagui.com)
4. Follow Vercel's instructions to configure DNS settings

## Production Considerations

For a production-ready authentication system, consider implementing:

1. **Database Integration**: Replace the demo credentials with a real database connection
2. **Additional Auth Providers**: Add OAuth providers like Google, GitHub, etc.
3. **Email Verification**: Implement email verification for new sign-ups
4. **Password Reset**: Add password reset functionality

## Troubleshooting

If you encounter issues with authentication after deployment:

1. Verify environment variables are correctly set
2. Check that `NEXTAUTH_URL` matches your actual domain
3. Ensure `NEXTAUTH_SECRET` is properly set and not exposed in code
4. Review Vercel build logs for any errors

## Monitoring

After deployment, monitor your application using Vercel Analytics to track performance and errors.