'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

interface DropdownProject {
    id: string;
    committeeId: string;
    title: string;
    reason: string;
}

interface MyTasksDropdownProps {
    count: number;
    projects: DropdownProject[];
}

export function MyTasksDropdown({ count, projects }: MyTasksDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Also close on ESC key
    useEffect(() => {
        function handleEscKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen]);

    if (count === 0 && projects.length === 0) {
        return null; // Don't render anything if there's no actionable tasks
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors focus:outline-none"
                title="Görevlerim ve Projelerim"
            >
                <ClipboardCheck className="w-6 h-6" />
                {count > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Açık Görevlerim</h3>
                        <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-2">
                        {projects.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                Şu an bekleyen işiniz yok.
                            </div>
                        ) : (
                            <ul className="space-y-1 mt-1">
                                {projects.map((project) => (
                                    <li key={project.id}>
                                        <Link
                                            href={`/dashboard/organization/${project.committeeId}/projects/${project.id}`}
                                            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-zinc-700"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                {project.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                                                {project.reason}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
