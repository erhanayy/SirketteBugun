'use client';

import { useRouter } from 'next/navigation';

export function HeaderLogo({ logoUrl, tenantName }: { logoUrl: string | null, tenantName: string }) {
    const router = useRouter();

    return (
        <button
            onClick={() => router && typeof router.refresh === 'function' && router.refresh()}
            className="w-8 h-8 relative rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-white/20 transition-all active:scale-90"
            title="Sayıları ve verileri yenilemek için tıklayın"
        >
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt={tenantName}
                    className="w-full h-full object-cover bg-white"
                />
            ) : (
                <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold">
                    LOGO
                </div>
            )}
        </button>
    );
}

export function HeaderTenantName({ name, websiteUrl }: { name: string, websiteUrl?: string | null }) {
    if (websiteUrl) {
        return (
            <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base lg:text-xl font-bold truncate hover:underline hover:text-blue-100 transition-colors"
                title={`${name} İnternet Sitesi`}
            >
                {name}
            </a>
        );
    }

    return <h1 className="text-base lg:text-xl font-bold truncate">{name}</h1>;
}
