'use client'

import { useState, useTransition } from "react";
import { toggleCommitteeMember } from "@/lib/actions/organization"; // We might need a separate 'updateMemberTitle' action or update toggle to accept title
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface MemberAssignmentRowProps {
    organizationId: string;
    user: any; // Type strictly if possible
    tenantUserRole: string;
    isAssigned: boolean;
    currentTitle: string;
    currentRole: string; // 'president' | 'member' etc.
    readOnly?: boolean;
}

export default function MemberAssignmentRow({
    organizationId,
    user,
    tenantUserRole,
    isAssigned: initialAssigned,
    currentTitle: initialTitle,
    currentRole: initialRole,
    readOnly = false
}: MemberAssignmentRowProps) {
    const [isAssigned, setIsAssigned] = useState(initialAssigned);
    const [role, setRole] = useState(initialRole || 'member');
    const [title, setTitle] = useState(initialTitle || "");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleMemberToggle = (checked: boolean) => {
        if (readOnly) return;

        // If unchecking member, we must also uncheck President (since president implies member)
        // If checking member, we default to 'member' role unless it was already president (but logic simplifies to: checking member -> just active, role stays what it was or 'member')
        // Actually, let's keep it simple: Switching member ON sets role to 'member' (default) if it was null/undefined? No, we have state.

        setIsAssigned(checked);
        // If we represent "President" toggle separately, let's say checking Member just sets isActive. Role remains. 
        // BUT if unchecking Member, ensure we are not "active" anymore.

        startTransition(async () => {
            // If turning OFF, role doesn't strictly matter as isActive=false.
            // If turning ON, use current role state.
            const result = await toggleCommitteeMember(organizationId, user.id, checked, title, checked ? role as any : 'member');
            if (result.error) {
                alert("Hata: " + result.error);
                setIsAssigned(!checked);
            } else {
                router.refresh();
            }
        });
    };

    const handlePresidentToggle = (checked: boolean) => {
        if (readOnly) return;

        // If checking President, we MUST also be a Member
        const newRole = checked ? 'president' : 'member';
        const newIsAssigned = checked ? true : isAssigned; // If becoming president, must be assigned. If un-becoming, stay assigned (just member).

        setRole(newRole);
        setIsAssigned(newIsAssigned);
        if (checked) setTitle("Başkan"); // Auto-set title for convenience? User said "toggle like member".

        startTransition(async () => {
            const result = await toggleCommitteeMember(organizationId, user.id, newIsAssigned, checked ? "Başkan" : title, newRole);
            if (result.error) {
                alert("Hata: " + result.error);
                setRole(role); // Revert
                setIsAssigned(isAssigned);
            } else {
                router.refresh();
            }
        });
    };

    const handleTitleBlur = () => {
        if (readOnly) return;
        if (!isAssigned) return;

        if (title === initialTitle) return;

        startTransition(async () => {
            const result = await toggleCommitteeMember(organizationId, user.id, true, title, role as any);
            if (result.error) {
                alert("Unvan güncellenemedi: " + result.error);
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
        }
    }

    const isPresident = role === 'president' && isAssigned;

    return (
        <tr className={`group transition-colors ${isAssigned ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <td className="py-3 px-6">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold 
                        ${isAssigned ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-gray-400'}`}>
                        {user.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 flex gap-2">
                            <span>{user.phoneNumber}</span>
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[10px] uppercase">
                                {tenantUserRole === 'admin' ? 'Yönetici' : tenantUserRole === 'manager' ? 'Yönetici Yrd.' : 'Üye'}
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            {/* President Toggle */}
            <td className="py-3 px-6 text-center">
                <div className="flex justify-center flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Başkan</span>
                    <label className={`relative inline-flex items-center ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isPresident}
                            onChange={(e) => handlePresidentToggle(e.target.checked)}
                            disabled={isPending || readOnly}
                        />
                        <div className={`
                            w-9 h-5 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 
                            peer-checked:bg-amber-500
                            bg-gray-200 dark:bg-gray-700
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                            after:bg-white after:border-gray-300 after:border after:rounded-full 
                            after:h-4 after:w-4 after:transition-all 
                            peer-checked:after:translate-x-full peer-checked:after:border-white
                        `}></div>
                    </label>
                </div>
            </td>

            {/* Member Toggle */}
            <td className="py-3 px-6 text-center">
                <div className="flex justify-center flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Üye</span>
                    <label className={`relative inline-flex items-center ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isAssigned}
                            onChange={(e) => handleMemberToggle(e.target.checked)}
                            disabled={isPending || readOnly}
                        />
                        <div className={`
                            w-9 h-5 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                            peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500
                            bg-gray-200 dark:bg-gray-700
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                            after:bg-white after:border-gray-300 after:border after:rounded-full 
                            after:h-4 after:w-4 after:transition-all 
                            peer-checked:after:translate-x-full peer-checked:after:border-white
                        `}></div>
                    </label>
                </div>
            </td>

            <td className="py-3 px-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleKeyDown}
                    disabled={!isAssigned || isPending || readOnly}
                    placeholder={isAssigned ? "Görevi (Örn: Başkan)" : "-"}
                    className={`
                        w-full px-3 py-2 rounded-lg text-sm border transition-colors outline-none
                        ${isAssigned
                            ? "bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            : "bg-gray-50 dark:bg-zinc-800 border-transparent text-gray-400 cursor-not-allowed"
                        }
                    `}
                />
            </td>
        </tr>
    );
}
