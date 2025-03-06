import { Euro, LucideCalendarArrowUp } from 'lucide-react';
import { formatDateToDDMMYYYY, getTimeAgo } from '../../../services/formattedDateService';

interface ContactCardProps {
    name: string;
    address: string;
    date: string;
    budget: string;
}

export default function ContactCard({ name, address, date, budget }: ContactCardProps) {
    // Générer les initiales pour l'avatar
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    // Formater la date
    const formattedDate = formatDateToDDMMYYYY(date);
    const timeAgo = getTimeAgo(date);

    return (
        <div className="bg-white rounded-md border border-gray-400 overflow-hidden flex flex-col items-center">
            <div className="p-3 w-full">
                <div className="flex items-start justify-start gap-3 mb-2 w-full">
                    <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center font-semibold text-xs">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" title={name}>
                            {name}
                        </div>
                        <div className="text-gray-600 text-xs truncate" title={address}>
                            {address}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-[70%] border-b border-gray-400"></div>

            <div className="flex justify-between items-center px-3 py-3">
                <div className="flex gap-2">
                    <div
                        className="flex items-center gap-1 text-[.5rem] bg-gray-200 text-black px-2 py-1 rounded-md"
                        title={formattedDate}
                    >
                        <LucideCalendarArrowUp size={12} />
                        <span>{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[.5rem] bg-gray-200 text-black px-2 py-1 rounded-md">
                        <Euro size={12} />
                        <span>{budget}€</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
