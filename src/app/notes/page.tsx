import { redirect } from 'next/navigation';

// /notes redirects to notes-converter until a dedicated notes page is built
export default function NotesPage() {
  redirect('/notes-converter');
}
