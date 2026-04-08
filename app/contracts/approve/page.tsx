"use client";

import { useEffect, useState } from "react";
import { getPendingContracts, acceptContract } from "@/lib/actions/contract";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export default function ContractApprovalPage() {
    const router = useRouter();
    const [pendingContracts, setPendingContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentContractIndex, setCurrentContractIndex] = useState(0);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const contracts = await getPendingContracts();
                setPendingContracts(contracts);
                if (contracts.length === 0) {
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Failed to load contracts", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [router]);

    const handleAccept = async () => {
        if (!pendingContracts[currentContractIndex]) return;

        setAccepting(true);
        try {
            const contractId = pendingContracts[currentContractIndex].id;
            await acceptContract(contractId);

            // Move to next contract or finish
            if (currentContractIndex < pendingContracts.length - 1) {
                setCurrentContractIndex(prev => prev + 1);
            } else {
                // All done
                router.refresh(); // Refresh to update server state/middleware
                router.push("/dashboard");
            }
        } catch (error) {
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (pendingContracts.length === 0) {
        return null; // Will redirect in useEffect
    }

    const currentContract = pendingContracts[currentContractIndex];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currentContract.title}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Sürüm: {currentContract.version} • Onaylanması Zorunlu Sözleşme ({currentContractIndex + 1}/{pendingContracts.length})
                        </p>
                    </div>
                    <button
                        onClick={async () => await logoutAction()}
                        className="text-gray-500 hover:text-red-600 transition-colors p-2"
                        title="Çıkış Yap"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-zinc-900/50">
                    <div
                        className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: currentContract.content }}
                    />
                </div>

                {/* Footer (Actions) */}
                <div className="p-6 border-t border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0 flex justify-end gap-3">
                    <button
                        onClick={handleAccept}
                        disabled={accepting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {accepting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                İşleniyor...
                            </>
                        ) : (
                            "Okudum, Anladım ve Onaylıyorum"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
