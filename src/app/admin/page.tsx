'use client';
import React from 'react';
import AdminStats from '@/components/admin/stats/AdminStats';

export default function AdminPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group col-span-1 md:col-span-2 lg:col-span-3">
                <AdminStats />
            </div>
        </div>
    );
}
