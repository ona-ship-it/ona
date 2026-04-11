import { Suspense } from 'react'
import ProfilePageClient from '@/app/profiles/ProfilePageClient'

type ProfileByIdPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProfileByIdPage({ params }: ProfileByIdPageProps) {
  const { id } = await params

  return (
    <Suspense>
      <ProfilePageClient profileIdOverride={id} />
    </Suspense>
  )
}
