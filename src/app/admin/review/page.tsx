import { redirect } from 'next/navigation';

export default function AdminReviewRedirect() {
  // Redirect legacy /admin/review to the giveaways review page
  redirect('/admin/giveaways/review');
}