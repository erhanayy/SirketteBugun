"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useTransition } from "react";
import { createEvent, EventInput } from "@/lib/actions/event";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const eventSchema = z.object({
    title: z.string().min(2, "Başlık en az 2 karakter olmalıdır."),
    description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır."),
    rules: z.string().min(10, "Kurallar en az 10 karakter olmalıdır."),
    location: z.string().optional(),
    startDate: z.date(),
    endDate: z.date().optional(),
    lcvDeadline: z.date(),
    isPaid: z.boolean().default(false),
    price: z.coerce.number().optional(), // Coerce input string to number
    ibanId: z.string().optional(),
    quota: z.coerce.number().optional(),
    isPublished: z.boolean().default(true),
}).superRefine((data, ctx) => {
    if (data.isPaid) {
        if (!data.price || data.price <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ücret bilgisi giriniz.",
                path: ["price"],
            });
        }
        if (!data.ibanId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "IBAN seçiniz.",
                path: ["ibanId"],
            });
        }
    }
});

type EventFormValues = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
    ibans: { id: string; name: string; ibanNumber: string }[];
}

export function CreateEventForm({ ibans }: CreateEventFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            description: "",
            rules: "",
            location: "",
            isPaid: false,
            isPublished: true,
            price: 0,
            quota: 0,
        },
    });

    const isPaid = form.watch("isPaid");

    function onSubmit(data: EventFormValues) {
        startTransition(async () => {
            const formData: EventInput = {
                ...data,
                location: data.location || undefined,
                price: data.price ? Number(data.price) : undefined,
                quota: data.quota ? Number(data.quota) : undefined,
                ibanId: data.ibanId || undefined,
            };

            const result = await createEvent(formData);

            if (result.success) {
                toast.success(result.message);
                router.push("/dashboard/events");
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Etkinlik Başlığı</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: Bahar Şenliği" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Location */}
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Konum</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: Merkez Ofis veya Online" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Start Date */}
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Başlangıç Tarihi</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP HH:mm", { locale: tr })
                                                ) : (
                                                    <span>Tarih seçiniz</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                        <div className="p-3 border-t">
                                            <Input
                                                type="time"
                                                className="w-full"
                                                onChange={(e) => {
                                                    const date = field.value || new Date();
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    if (hours && minutes) {
                                                        const newDate = new Date(date);
                                                        newDate.setHours(parseInt(hours));
                                                        newDate.setMinutes(parseInt(minutes));
                                                        field.onChange(newDate);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* End Date */}
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Bitiş Tarihi (Opsiyonel)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP HH:mm", { locale: tr })
                                                ) : (
                                                    <span>Tarih seçiniz</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                        <div className="p-3 border-t">
                                            <Input
                                                type="time"
                                                className="w-full"
                                                onChange={(e) => {
                                                    const date = field.value || new Date();
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    if (hours && minutes) {
                                                        const newDate = new Date(date);
                                                        newDate.setHours(parseInt(hours));
                                                        newDate.setMinutes(parseInt(minutes));
                                                        field.onChange(newDate);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* LCV Deadline */}
                    <FormField
                        control={form.control}
                        name="lcvDeadline"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Son Katılım (LCV) Tarihi</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP HH:mm", { locale: tr })
                                                ) : (
                                                    <span>Tarih seçiniz</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                        <div className="p-3 border-t">
                                            <Input
                                                type="time"
                                                className="w-full"
                                                onChange={(e) => {
                                                    const date = field.value || new Date();
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    if (hours && minutes) {
                                                        const newDate = new Date(date);
                                                        newDate.setHours(parseInt(hours));
                                                        newDate.setMinutes(parseInt(minutes));
                                                        field.onChange(newDate);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Description and Rules */}
                <div className="grid grid-cols-1 gap-6">
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Etkinlik Açıklaması</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Etkinlik hakkında detaylar..." className="min-h-[100px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rules"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Katılım Kuralları</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="İptal şartları, kıyafet kodu vb." className="min-h-[100px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Quota and Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20">
                    <FormField
                        control={form.control}
                        name="quota"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kontenjan (Boş bırakılabilir)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Sınırsız için boş bırakın" {...field} value={(field.value as number | string | undefined) ?? ''} />
                                </FormControl>
                                <FormDescription>Maksimum katılımcı sayısı.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isPaid"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                                <div className="space-y-0.5">
                                    <FormLabel>Ücretli Etkinlik</FormLabel>
                                    <FormDescription>
                                        Etkinlik için ödeme alınacak mı?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {isPaid && (
                        <>
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Katılım Ücreti (₺)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} value={(field.value as number | string | undefined) ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ibanId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ödeme Yapılacak IBAN</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="IBAN seçiniz" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ibans.map((iban) => (
                                                    <SelectItem key={iban.id} value={iban.id}>
                                                        {iban.name} ({iban.ibanNumber})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Yayınla</FormLabel>
                                <FormDescription>
                                    Etkinlik hemen üyeler tarafından görülebilir olsun mu?
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Etkinliği Oluştur
                </Button>
            </form>
        </Form>
    );
}
