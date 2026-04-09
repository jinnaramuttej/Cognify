import { redirect } from 'next/navigation';

// Redirect legacy analytics route to the new canonical route
export default function ProgressAnalyticsRedirect() {
  redirect('/analytics');
}
