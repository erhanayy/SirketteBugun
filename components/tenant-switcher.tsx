'use client';

import { useState } from 'react';
import { switchTenant } from '@/lib/actions/tenant';
import { ChevronsUpDown, Check } from 'lucide-react';

type Tenant = {
    id: string;
    shortName: string;
    longName: string;
};

export function TenantSwitcher({
    currentTenant,
    availableTenants
}: {
    currentTenant: Tenant,
    availableTenants: Tenant[]
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (availableTenants.length <= 1) {
        return null;
    }

    const handleSwitch = async (tenantId: string) => {
        try {
            await switchTenant(tenantId);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to switch tenant:", error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400 transition-colors"
                title="Şirket Değiştir"
            >
                <ChevronsUpDown className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 z-20 py-1">
                        {availableTenants.map((tenant) => (
                            <button
                                key={tenant.id}
                                onClick={() => handleSwitch(tenant.id)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-between text-gray-900 dark:text-gray-100"
                            >
                                <span>{tenant.shortName}</span>
                                {currentTenant.id === tenant.id && (
                                    <Check className="w-4 h-4 text-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
