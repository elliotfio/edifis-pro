import { Button } from "@/components/ui/Button"
import { ToolbarProps, View } from "react-big-calendar"
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, memo, useCallback } from 'react';
import { format } from 'date-fns';
import Searchbar from '@/components/ui/Searchbar';
import { fr } from 'date-fns/locale';

interface CustomToolbarProps<TEvent extends object> extends ToolbarProps<TEvent> {
    onSearch: (query: string) => void;
    searchValue: string;
}

const CustomToolbar = memo(<TEvent extends { start: Date; end: Date }>({ 
    label, 
    onNavigate, 
    onView, 
    view, 
    onSearch, 
    searchValue 
}: CustomToolbarProps<TEvent>) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const toggleDropdown = useCallback(() => {
        setDropdownOpen(!dropdownOpen);
    }, [dropdownOpen]);

    const handleNavigate = useCallback((direction: 'PREV' | 'NEXT') => {
        const newDate = new Date(currentDate);
        if (direction === 'PREV') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (direction === 'NEXT') {
            newDate.setDate(newDate.getDate() + 7);
        }
        setCurrentDate(newDate);
        onNavigate(direction);
    }, [currentDate, onNavigate]);

    const getDateLabel = useCallback(() => {
        switch (view) {
            case 'month': {
                const monthYear = format(currentDate, 'MMMM yyyy', { locale: fr });
                return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
            }
            case 'week':
                return format(currentDate, "'Semaine du' dd MMMM yyyy", { locale: fr });
            case 'day':
                return format(currentDate, "EEEE dd MMMM yyyy", { locale: fr });
            default:
                return format(currentDate, "'Semaine du' dd MMMM yyyy", { locale: fr });
        }
    }, [view, currentDate]);

    return (
        <div className="flex justify-between items-center mb-4 gap-8">
            <div className="flex items-center gap-6 flex-grow">
                <div className="flex flex-col items-center border p-2 rounded-md justify-center min-w-[60px]">
                    <span className="text-sm font-bold leading-none">{format(currentDate, 'MMM', { locale: fr }).toUpperCase()}</span>
                    <span className="text-2xl font-bold leading-none">{format(currentDate, 'd')}</span>
                </div>
                <div className="flex-grow max-w-md">
                    <Searchbar 
                        onSearch={onSearch}
                        value={searchValue}
                        placeholder="Rechercher par titre ou lieu..."
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="primary" className="w-auto" onClick={() => handleNavigate('PREV')}>
                    <ChevronLeft size={16} />
                </Button>
                <span className="text-md font-medium whitespace-nowrap">{getDateLabel()}</span>
                <Button variant="primary" className="w-auto" onClick={() => handleNavigate('NEXT')}>
                    <ChevronRight size={16} />
                </Button>
                <div className="relative inline-block">
                    <Button variant="primary" className="w-auto px-2" onClick={toggleDropdown}>
                        Vues <ChevronDown size={16} className="ml-1" />
                    </Button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-10">
                            <ul className="py-1">
                                <li>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { onView('month'); setDropdownOpen(false); }}>Vue mois</button>
                                </li>
                                <li>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { onView('week'); setDropdownOpen(false); }}>Vue semaine</button>
                                </li>
                                <li>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { onView('day'); setDropdownOpen(false); }}>Vue jour</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

CustomToolbar.displayName = 'CustomToolbar';

export default CustomToolbar;