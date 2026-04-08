'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { createChildCommittee, updateCommitteeNode, softDeleteCommitteeTree } from '@/lib/actions/organization';
import { Building2, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Check, X, Users, UserCog, AlertTriangle, Loader2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type CommitteeNode = {
    id: string;
    name: string;
    type: string;
    description: string | null;
    parentCommitteeId: string | null;
    tenantId: string;
    members: { userId: string; role: string; title: string; fullName: string }[];
    children: CommitteeNode[];
};

type User = { id: string; fullName: string };

// ─── Build tree from flat list ───────────────────────────────────────────────

function buildTree(flat: Omit<CommitteeNode, 'children'>[]): CommitteeNode[] {
    const map = new Map<string, CommitteeNode>();
    for (const c of flat) map.set(c.id, { ...c, children: [] });
    const roots: CommitteeNode[] = [];
    for (const [, node] of map) {
        if (node.parentCommitteeId && map.has(node.parentCommitteeId)) {
            map.get(node.parentCommitteeId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }
    // Sort children alphabetically
    const sortChildren = (node: CommitteeNode) => {
        node.children.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        node.children.forEach(sortChildren);
    };
    roots.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    roots.forEach(sortChildren);
    return roots;
}

// ─── Main client component ───────────────────────────────────────────────────

export default function OrgTreeClient({
    committees: initialCommittees,
    allUsers,
    tenantId,
    tenantName,
    isAdmin,
}: {
    committees: Omit<CommitteeNode, 'children'>[];
    allUsers: User[];
    tenantId: string;
    tenantName: string;
    isAdmin: boolean;
}) {
    const [committees, setCommittees] = useState(initialCommittees);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(
        () => new Set(initialCommittees.map(c => c.id))
    );
    const [editingId, setEditingId] = useState<string | null>(null);
    const [addingChildOf, setAddingChildOf] = useState<string | null>(null); // null = root
    const [addingRoot, setAddingRoot] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const tree = buildTree(committees);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const expandAll = () => setExpandedIds(new Set(committees.map(c => c.id)));
    const collapseAll = () => setExpandedIds(new Set());

    const handleSaveNode = async (formData: FormData) => {
        setErrorMsg(null);
        startTransition(async () => {
            const result = await updateCommitteeNode(null, formData);
            if (result?.error) { setErrorMsg(result.error); return; }
            // Refresh from server by re-fetching (simple: reload)
            window.location.reload();
        });
    };

    const handleCreateChild = async (formData: FormData) => {
        setErrorMsg(null);
        startTransition(async () => {
            const result = await createChildCommittee(null, formData);
            if (result?.error) { setErrorMsg(result.error); return; }
            window.location.reload();
        });
    };

    const handleDelete = async (id: string) => {
        setErrorMsg(null);
        startTransition(async () => {
            const result = await softDeleteCommitteeTree(id);
            if (result?.error) { setErrorMsg(result.error); return; }
            window.location.reload();
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-500" />
                        Şirket Organizasyonu
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Departmanları hiyerarşik olarak görüntüleyin ve yönetin.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={expandAll} className="text-xs px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-400">
                        Tümünü Aç
                    </button>
                    <button onClick={collapseAll} className="text-xs px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-400">
                        Tümünü Kapat
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => { setAddingRoot(true); setAddingChildOf(null); }}
                            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Departman Ekle
                        </button>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg border border-red-100 dark:border-red-900/50 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
                </div>
            )}

            {/* Tree container */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                {/* Root: Company name */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{tenantName}</p>
                        <p className="text-xs text-gray-500">{committees.length} departman · {committees.reduce((s, c) => s + c.members.length, 0)} çalışan</p>
                    </div>
                </div>

                {/* Tree body */}
                <div className="p-4">
                    {tree.length === 0 && !addingRoot ? (
                        <div className="text-center py-12 text-gray-400">
                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">Henüz departman eklenmemiş.</p>
                            {isAdmin && (
                                <button onClick={() => setAddingRoot(true)} className="mt-3 text-blue-500 hover:underline text-sm">
                                    + İlk departmanı ekle
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="relative">
                            {/* SVG connector lines - drawn as relative layout */}
                            {tree.map((node, idx) => (
                                <TreeNode
                                    key={node.id}
                                    node={node}
                                    allUsers={allUsers}
                                    isAdmin={isAdmin}
                                    expandedIds={expandedIds}
                                    onToggle={toggleExpand}
                                    editingId={editingId}
                                    onEdit={setEditingId}
                                    onSave={handleSaveNode}
                                    addingChildOf={addingChildOf}
                                    onAddChild={(parentId) => { setAddingChildOf(parentId); setAddingRoot(false); }}
                                    onCreateChild={handleCreateChild}
                                    deleteConfirmId={deleteConfirmId}
                                    onDeleteConfirm={setDeleteConfirmId}
                                    onDeleteExecute={handleDelete}
                                    isPending={isPending}
                                    depth={0}
                                    isLast={idx === tree.length - 1}
                                />
                            ))}
                        </div>
                    )}

                    {/* Root-level add form */}
                    {addingRoot && (
                        <AddNodeForm
                            parentCommitteeId={null}
                            onSubmit={handleCreateChild}
                            onCancel={() => setAddingRoot(false)}
                            isPending={isPending}
                            depth={0}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Recursive Tree Node ─────────────────────────────────────────────────────

function TreeNode({
    node, allUsers, isAdmin, expandedIds, onToggle,
    editingId, onEdit, onSave,
    addingChildOf, onAddChild, onCreateChild,
    deleteConfirmId, onDeleteConfirm, onDeleteExecute,
    isPending, depth, isLast
}: {
    node: CommitteeNode;
    allUsers: User[];
    isAdmin: boolean;
    expandedIds: Set<string>;
    onToggle: (id: string) => void;
    editingId: string | null;
    onEdit: (id: string | null) => void;
    onSave: (fd: FormData) => void;
    addingChildOf: string | null;
    onAddChild: (parentId: string) => void;
    onCreateChild: (fd: FormData) => void;
    deleteConfirmId: string | null;
    onDeleteConfirm: (id: string | null) => void;
    onDeleteExecute: (id: string) => void;
    isPending: boolean;
    depth: number;
    isLast: boolean;
}) {
    const isExpanded = expandedIds.has(node.id);
    const isEditing = editingId === node.id;
    const isDeleteConfirm = deleteConfirmId === node.id;
    const isAddingChild = addingChildOf === node.id;
    const hasChildren = node.children.length > 0;
    const manager = node.members.find(m => m.role === 'president');
    const employees = node.members.filter(m => m.role !== 'president');
    const INDENT = 28;

    return (
        <div className="relative" style={{ marginLeft: depth > 0 ? INDENT : 0 }}>
            {/* Vertical line from parent */}
            {depth > 0 && (
                <svg className="absolute left-0 top-0 overflow-visible pointer-events-none" width="28" height="100%" style={{ left: -INDENT }}>
                    {/* vertical line */}
                    <line x1="14" y1="0" x2="14" y2={isLast ? "22" : "100%"} stroke="currentColor" strokeWidth="1.5" className="text-gray-200 dark:text-zinc-700" />
                    {/* horizontal connector */}
                    <line x1="14" y1="22" x2="28" y2="22" stroke="currentColor" strokeWidth="1.5" className="text-gray-200 dark:text-zinc-700" />
                </svg>
            )}

            {/* Node card */}
            <div className={`mb-2 rounded-xl border transition-all duration-150 ${isEditing
                ? 'border-blue-300 dark:border-blue-700 shadow-md'
                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                } bg-white dark:bg-zinc-800`}>

                {/* Node header */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                    {/* Expand toggle */}
                    <button
                        onClick={() => onToggle(node.id)}
                        className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors ${hasChildren || isAddingChild
                            ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            : 'text-gray-300 cursor-default'
                            }`}
                        disabled={!hasChildren && !isAddingChild}
                    >
                        {isExpanded || isAddingChild
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                        }
                    </button>

                    {/* Type color dot */}
                    <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${node.type === 'management_board'
                        ? 'bg-purple-500'
                        : node.type === 'sub_committee'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`} />

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{node.name}</p>
                        <p className="text-xs text-gray-500">
                            {manager ? `Yön: ${manager.fullName}` : 'Yönetici yok'}
                            {employees.length > 0 && ` · ${employees.length} çalışan`}
                        </p>
                    </div>

                    {/* Actions */}
                    {isAdmin && !isEditing && !isDeleteConfirm && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                                onClick={() => { onEdit(node.id); onToggle(node.id); expandedIds.has(node.id) ? null : onToggle(node.id); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Düzenle"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => { onAddChild(node.id); if (!expandedIds.has(node.id)) onToggle(node.id); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                title="Alt birim ekle"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onDeleteConfirm(node.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Sil"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Delete confirm */}
                    {isDeleteConfirm && (
                        <div className="flex items-center gap-2 text-xs">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-gray-600 dark:text-gray-300">
                                {node.children.length > 0
                                    ? `Bu ve ${node.children.length} alt birim silinecek. Emin misiniz?`
                                    : 'Silinecek. Emin misiniz?'
                                }
                            </span>
                            <button
                                onClick={() => onDeleteExecute(node.id)}
                                disabled={isPending}
                                className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Evet, Sil'}
                            </button>
                            <button onClick={() => onDeleteConfirm(null)} className="px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700">
                                İptal
                            </button>
                        </div>
                    )}
                </div>

                {/* Inline Edit Form */}
                {isEditing && (
                    <EditNodeForm
                        node={node}
                        allUsers={allUsers}
                        onSave={(fd) => { onSave(fd); onEdit(null); }}
                        onCancel={() => onEdit(null)}
                        isPending={isPending}
                    />
                )}
            </div>

            {/* Children */}
            {(isExpanded || isAddingChild) && (
                <div className="relative">
                    {node.children.map((child, idx) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            allUsers={allUsers}
                            isAdmin={isAdmin}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            editingId={editingId}
                            onEdit={onEdit}
                            onSave={onSave}
                            addingChildOf={addingChildOf}
                            onAddChild={onAddChild}
                            onCreateChild={onCreateChild}
                            deleteConfirmId={deleteConfirmId}
                            onDeleteConfirm={onDeleteConfirm}
                            onDeleteExecute={onDeleteExecute}
                            isPending={isPending}
                            depth={depth + 1}
                            isLast={idx === node.children.length - 1 && !isAddingChild}
                        />
                    ))}

                    {/* Add child form */}
                    {isAddingChild && (
                        <AddNodeForm
                            parentCommitteeId={node.id}
                            onSubmit={(fd) => { onCreateChild(fd); }}
                            onCancel={() => onAddChild('')}
                            isPending={isPending}
                            depth={depth + 1}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Inline Edit Form ────────────────────────────────────────────────────────

function EditNodeForm({ node, allUsers, onSave, onCancel, isPending }: {
    node: CommitteeNode;
    allUsers: User[];
    onSave: (fd: FormData) => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    const currentMemberIds = node.members.map(m => m.userId);
    const currentManagerId = node.members.find(m => m.role === 'president')?.userId ?? '';
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(currentMemberIds));
    const [managerId, setManagerId] = useState(currentManagerId);

    const toggleMember = (userId: string) => {
        setSelectedMembers(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
                if (managerId === userId) setManagerId('');
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set('memberIds', JSON.stringify(Array.from(selectedMembers)));
        fd.set('managerId', managerId);
        onSave(fd);
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-zinc-700 px-4 py-4 space-y-4">
            <input type="hidden" name="id" value={node.id} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Departman Adı *</label>
                    <input name="name" required defaultValue={node.name}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                {/* Type */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tip</label>
                    <select name="type" defaultValue={node.type}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                        <option value="management_board">Yönetim Kurulu</option>
                        <option value="executive_committee">Departman / İcra Kurulu</option>
                        <option value="sub_committee">Alt Birim / Ekip</option>
                        <option value="other">Diğer</option>
                    </select>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Açıklama</label>
                <textarea name="description" rows={2} defaultValue={node.description ?? ''}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>

            {/* Employee selection */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Çalışanlar
                </label>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 dark:border-zinc-700 divide-y divide-gray-100 dark:divide-zinc-700">
                    {allUsers.map(u => {
                        const isSelected = selectedMembers.has(u.id);
                        const isManager = managerId === u.id;
                        return (
                            <div key={u.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50'}`}
                                onClick={() => toggleMember(u.id)}>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-zinc-600'}`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white flex-1">{u.fullName}</span>
                                {isSelected && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setManagerId(isManager ? '' : u.id); }}
                                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${isManager
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'
                                            }`}
                                        title="Departman yöneticisi olarak ata"
                                    >
                                        <UserCog className="w-3 h-3" />
                                        {isManager ? 'Yönetici' : 'Yönetici yap'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {allUsers.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">Eklenecek çalışan bulunamadı.</p>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{selectedMembers.size} çalışan seçildi{managerId ? ` · 1 yönetici` : ''}</p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel}
                    className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                    İptal
                </button>
                <button type="submit" disabled={isPending}
                    className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors">
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Kaydet
                </button>
            </div>
        </form>
    );
}

// ─── Add Node Form ────────────────────────────────────────────────────────────

function AddNodeForm({ parentCommitteeId, onSubmit, onCancel, isPending, depth }: {
    parentCommitteeId: string | null;
    onSubmit: (fd: FormData) => void;
    onCancel: () => void;
    isPending: boolean;
    depth: number;
}) {
    const INDENT = 28;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
    };

    return (
        <div className="relative" style={{ marginLeft: depth > 0 ? INDENT : 0 }}>
            {depth > 0 && (
                <svg className="absolute overflow-visible pointer-events-none" width="28" height="44" style={{ left: -INDENT, top: 0 }}>
                    <line x1="14" y1="0" x2="14" y2="22" stroke="currentColor" strokeWidth="1.5" className="text-gray-200 dark:text-zinc-700" />
                    <line x1="14" y1="22" x2="28" y2="22" stroke="currentColor" strokeWidth="1.5" className="text-gray-200 dark:text-zinc-700" />
                </svg>
            )}
            <form onSubmit={handleSubmit}
                className="mb-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5">
                <input type="hidden" name="parentCommitteeId" value={parentCommitteeId ?? ''} />
                <input type="hidden" name="type" value="executive_committee" />
                <Plus className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <input
                    name="name"
                    required
                    autoFocus
                    placeholder="Yeni departman adı..."
                    className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
                <button type="submit" disabled={isPending}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors">
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button type="button" onClick={onCancel}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </form>
        </div>
    );
}
