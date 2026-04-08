'use client';

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

export function MobileMenuButton({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on route change
    useEffect(() => {
        setIsOpen(false);
    }, []);

    return (
        <>
            {/* Hamburger button — only on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg flex items-center justify-center shadow-sm"
                aria-label="Menüyü Aç"
            >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Overlay backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Desktop: normal sidebar | Mobile: off-canvas drawer */}
            <div
                ref={drawerRef}
                className={`
                    fixed md:static top-0 left-0 h-full z-50
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:flex
                `}
                style={{ width: "256px" }}
            >
                {/* Close button inside drawer on mobile */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
                    aria-label="Menüyü Kapat"
                >
                    <X className="w-5 h-5" />
                </button>

                {children}
            </div>
        </>
    );
}
