'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createGroup } from '@/lib/actions/chat';
import { getMembers } from '@/lib/actions/member'; // Need to fetch potential members
import { Users, Search, Check, X } from 'lucide-react';

export default function NewGroupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Info, 2: Members
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch all members to select from
        async function loadMembers() {
            const data = await getMembers();
            setMembers(data);
        }
        loadMembers();
    }, []);

    const filteredMembers = members.filter(m => 
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleMember = (id: string) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(prev => prev.filter(m => m !== id));
        } else {
            setSelectedMembers(prev => [...prev, id]);
        }
    };

    const handleCreate = async () => {
        if (!name) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('participants', JSON.stringify(selectedMembers));

        const result = await createGroup(null, formData);

        if (result.success) {
            router.push(`/dashboard/messages/${result.chatId}`);
        } else {
            alert(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Yeni Grup Oluştur</h1>

            {step === 1 && (
                <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <div>
                        <label className="block text-sm font-medium mb-1">Grup Adı</label>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="Örn: Yönetim Kurulu"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Açıklama (İsteğe bağlı)</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="Grup hakkında kısa bilgi..."
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                         <button 
                            onClick={() => setStep(2)}
                            disabled={!name}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            İleri
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col h-[600px]">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">Katılımcı Seç ({selectedMembers.length})</h2>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 p-2 border rounded-lg text-sm dark:bg-zinc-800 dark:border-zinc-700 w-64"
                                placeholder="Üye ara..."
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto border rounded-lg dark:border-zinc-700 divide-y dark:divide-zinc-700">
                        {filteredMembers.map(member => (
                            <div 
                                key={member.id}
                                onClick={() => toggleMember(member.id)}
                                className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-gray-500"/>
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.fullName}</p>
                                        <p className="text-xs text-gray-500">{member.role} • {member.status}</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selectedMembers.includes(member.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                    {selectedMembers.includes(member.id) && <Check className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t dark:border-zinc-800">
                        <button 
                            onClick={() => setStep(1)}
                            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                        >
                            Geri
                        </button>
                        <button 
                            onClick={handleCreate}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            {isSubmitting ? 'Oluşturuluyor...' : 'Grubu Oluştur'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
