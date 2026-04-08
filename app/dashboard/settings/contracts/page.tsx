import { getSignedContracts } from "@/lib/actions/contract";
import { getCurrentTenant } from "@/lib/data/tenant";
import { RedirectToLogin } from "@/components/redirect-to-login";

export default async function MyContractsPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return <RedirectToLogin />;

    const signedContracts = await getSignedContracts();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Sözleşmelerim
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Onayladığınız sözleşmelerin son sürümlerini buradan inceleyebilirsiniz.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden divide-y divide-gray-200 dark:divide-zinc-700">
                {signedContracts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Henüz onaylanmış bir sözleşmeniz bulunmamaktadır.
                    </div>
                ) : (
                    signedContracts.map((contract: any) => (
                        <details
                            key={contract.id}
                            className="group bg-white dark:bg-zinc-800"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors list-none">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 group-open:text-blue-600 dark:group-open:text-blue-400">
                                            {contract.title}
                                        </h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Sürüm: {contract.version}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-gray-400 group-open:rotate-180 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </summary>
                            <div className="px-6 pb-6 pt-0 border-t border-gray-100 dark:border-zinc-700/50 group-open:border-t-0">
                                <div className="mt-4 prose dark:prose-invert max-w-none bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-lg">
                                    <div dangerouslySetInnerHTML={{ __html: contract.content }} />
                                </div>
                            </div>
                        </details>
                    ))
                )}
            </div>
        </div>
    );
}
