import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect to the default subpage (consultations)
  redirect('/user-panel/consultations');
}
