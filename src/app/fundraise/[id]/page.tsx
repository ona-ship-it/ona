export const dynamic = 'force-dynamic';
export const revalidate = 0;

import FundraiserDetailClient from './FundraiserDetailClient';

export default async function FundraisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FundraiserDetailClient fundraiserId={id} />;
}
