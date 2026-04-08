'use client';

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { tr } from "date-fns/locale";
import { format, isSameDay, parseISO } from "date-fns";
import { EventSummaryCard } from "./event-summary-card";
import { cn } from "@/lib/utils"; // Assuming cn utility exists, usually does in these projects. If not will remove.

export default function EventsClient({ initialEvents, userId, userRole }: { initialEvents: any[], userId?: string, userRole?: string }) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

    // Convert string dates to Date objects for easier comparison
    const events = initialEvents.map(e => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null
    }));

    // Update selected events when date changes
    useEffect(() => {
        if (selectedDate) {
            const matches = events.filter(e => isSameDay(e.startDate, selectedDate));
            setSelectedEvents(matches);
        } else {
            setSelectedEvents([]);
        }
    }, [selectedDate, initialEvents]); // eslint-disable-line

    // Modifiers for the calendar
    const eventDays = events.map(e => e.startDate);

    // Custom Day Content to show Black Dot
    // In v9 we can use components or just modifiers. 
    // Let's use modifiersClassNames for simplicity first, or a custom class.

    // Check if we can use simple CSS via modifiers
    const modifiers = {
        hasEvent: eventDays
    };

    const modifiersStyles = {
        hasEvent: {
            fontWeight: 'bold',
            color: 'black',
            // textDecoration: 'underline'
        }
    };

    return (
        <div className="flex flex-col gap-8 md:flex-row md:items-start h-full">
            {/* Calendar Section */}
            <div className="bg-white dark:bg-zinc-900 p-2 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 flex justify-center md:justify-start w-full max-w-full overflow-x-auto">
                <style>{`
                 .rdp-day_selected { 
                    background-color: #2563eb !important; 
                    color: white !important; 
                 }
                 .rdp-day_today {
                    color: #2563eb;
                    font-weight: bold;
                 }
               `}</style>
                <DayPicker
                    mode="single"
                    required
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={tr}
                    modifiers={modifiers}
                    modifiersClassNames={{
                        hasEvent: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-black dark:after:bg-white after:rounded-full"
                    }}
                />
            </div>

            {/* Event Summary / Details Section */}
            <div className="flex-1 w-full">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {selectedDate ? format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr }) : "Tarih Seçiniz"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {selectedEvents.length} etkinlik bulundu.
                    </p>
                </div>

                <div className="space-y-6">
                    {selectedEvents.length > 0 ? (
                        selectedEvents.map(event => (
                            <EventSummaryCard key={event.id} event={event} userId={userId} userRole={userRole} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                            <p className="text-gray-500 dark:text-gray-400">Bu tarihte planlanmış bir etkinlik bulunmuyor.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
