import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Bir sohbet seçin
            </h3>
            <p className="max-w-sm">
                Sol taraftaki listeden bir grup seçerek mesajlaşmaya başlayabilirsiniz.
            </p>
        </div>
    );
}
