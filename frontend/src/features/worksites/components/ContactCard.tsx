import { Euro, LucideCalendarArrowUp } from 'lucide-react';
 
interface ContactCardProps {
    name: string;
    email: string;
    date: string;
}
 
export default function ContactCard({ name, email, date }: ContactCardProps) {
    // Générer les initiales pour l'avatar
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
 
    return (
        <div className="bg-white rounded-md border border-gray-400 overflow-hidden flex flex-col items-center">
            <div className="p-3 w-full">
                <div className="flex items-start justify-start gap-3 mb-2 w-full">
                    <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center font-semibold text-xs">
                        {initials}
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-sm">{name}</div>
                        <div className="text-gray-600 text-xs">{email}</div>
                    </div>
                </div>
            </div>
 
            <div className="w-[70%] border-b border-gray-400"></div>
 
            <div className="flex justify-between items-center px-3 py-3">
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-[.5rem] bg-gray-200 text-black px-2 py-1 rounded-md">
                        <LucideCalendarArrowUp size={12} />
                        <span>{date}</span>
                    </div>
                    {/* <div className="flex items-center gap-1 text-[.5rem] bg-gray-200 text-black px-2 py-1 rounded-md">
                        <FaRegCircleUser />
                        <span>Parrainage</span>
                    </div> */}
                    <div className="flex items-center gap-1 text-[.5rem] bg-gray-200 text-black px-2 py-1 rounded-md">
                        <Euro size={12} />
                        <span>0€</span>
                    </div>
                </div>
            </div>
        </div>
    );
}