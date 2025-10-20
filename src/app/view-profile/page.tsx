"use server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ViewProfileClient from './ViewProfileClient';

export default async function Page() {
  return <ViewProfileClient />;
}