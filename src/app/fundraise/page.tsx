'use server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import FundraiseClient from './FundraiseClient';

export default async function Page() {
  return <FundraiseClient />;
}