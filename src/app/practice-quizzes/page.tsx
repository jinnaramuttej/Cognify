import { redirect } from 'next/navigation';

// Redirect legacy quizzes route to the modern tests experience
export default function PracticeQuizzesRedirect() {
  redirect('/tests?mode=practice');
}
