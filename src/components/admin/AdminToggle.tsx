import React from 'react';
import { useAdmin } from '@/context/AdminContext';

const AdminToggle: React.FC = () => {
    const { isAdminMode, toggleAdmin } = useAdmin();

    return (
        <button
            onClick={toggleAdmin}
            className={`fixed bottom-8 left-8 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 font-ui text-xs tracking-widest ${isAdminMode
                ? 'bg-forest text-white ring-4 ring-sage/50 translate-y-0'
                : 'bg-white text-forest border border-forest/10 hover:translate-y-[-4px]'
                }`}
        >
            <span className={`w-3 h-3 rounded-full ${isAdminMode ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
            {isAdminMode ? 'ADMIN MODE: ON' : 'ADMIN MODE'}
        </button>
    );
};

export default AdminToggle;





