import { redirect } from "next/navigation";

export default function ProfileRedirectPage() {
  // Server-side redirect from legacy /profile to current profile view
  redirect("/view-profile");
}