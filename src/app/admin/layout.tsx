import type { Metadata } from 'next';
import AdminLayoutClient from '@/pages/Admin';

export const metadata: Metadata = {
    title: 'Admin | Glak Apart',
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
