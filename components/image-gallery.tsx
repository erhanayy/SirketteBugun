'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
    images: { url: string; alt?: string }[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export function ImageGallery({ images, initialIndex = 0, isOpen, onClose }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, initialIndex]);

    const handlePrevious = useCallback(() => {
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
    }, [isOpen, onClose, handlePrevious, handleNext]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Header / Controls */}
            <div className="absolute top-0 inset-x-0 h-20 px-6 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent z-10">
                <div className="text-white/90 text-sm font-medium">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsZoomed(!isZoomed)}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                    >
                        {isZoomed ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>
            </div>

            {/* Main Image Area */}
            <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-12 overflow-hidden">
                <div
                    className={cn(
                        "relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center",
                        isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                    )}
                    onClick={() => images.length > 1 && !isZoomed ? null : setIsZoomed(!isZoomed)}
                >
                    <Image
                        src={images[currentIndex].url}
                        alt={images[currentIndex].alt || 'Gallery image'}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Navigation Buttons (Desktop/Mobile) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                            className="absolute left-4 lg:left-8 p-3 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all transform hover:scale-110 z-20"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 lg:right-8 p-3 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all transform hover:scale-110 z-20"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
