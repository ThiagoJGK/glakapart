import type { Metadata } from 'next';
import Admin from '@/pages/Admin';

export const metadata: Metadata = {
    title: 'Admin | Glak Apart',
    robots: { index: false, follow: false },
};

export default function AdminPage() {
    return <Admin />;
}
