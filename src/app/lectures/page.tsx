import { redirect } from 'next/navigation';

// Redirect legacy lectures route to the modern library experience
export default function LecturesRedirect() {
  redirect('/library');
}
