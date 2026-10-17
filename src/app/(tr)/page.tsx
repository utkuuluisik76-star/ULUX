import { UluxPage } from '@/components/UluxPage';
import { ulux } from '@/content/ulux';
export const metadata = { title: ulux.tr.title, description: ulux.tr.description, icons: { icon: '/ulux-mark.svg' }, robots: { index: false, follow: false } };

export default function Page() {
  return <UluxPage locale="tr" />;
}
