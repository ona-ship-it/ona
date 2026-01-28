export const dynamic = 'force-dynamic';
export const revalidate = 0;

import FundraiserDetailClient from './FundraiserDetailClient';

export default function FundraisePage({ params }: { params: { id: string } }) {
  return <FundraiserDetailClient fundraiserId={params.id} />;
}
