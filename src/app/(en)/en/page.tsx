import { UluxPage } from '@/components/UluxPage';
import { ulux } from '@/content/ulux';
export const metadata = { title: ulux.en.title, description: ulux.en.description, icons: { icon: '/ulux-mark.svg' }, robots: { index: false, follow: false } };

export default function Page() {
  return <UluxPage locale="en" />;
}
