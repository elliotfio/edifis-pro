import { useState } from 'react';
 
import { Check, ChevronDown } from 'lucide-react';
 
interface FilterOption {
    label: string;
    value: string;
    type: string;
}
 
interface FilterButtonProps {
    filters: Record<string, string>;
    filterOptions: FilterOption[];
    onFilterChange: (type: string, value: string) => void;
}
 
export function FilterButton({ filters, filterOptions, onFilterChange }: FilterButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
 
    const activeFiltersCount = Object.values(filters).filter((value) => value !== 'Tous').length;
 
    // Obtenir les types de filtres uniques
    const filterTypes = [...new Set(filterOptions.map((option) => option.type))];
 
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary"
            >
                <span>Filtrer</span>
                {activeFiltersCount > 0 && (
                    <span className="flex items-center justify-center h-5 w-5 text-xs bg-secondary text-white rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
                <ChevronDown className="h-4 w-4" />
            </button>
 
            {isOpen && (
                <>
                    <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10">
                        {filterTypes.map((filterType) => (
                            <div key={filterType} className="py-2">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    {filterType}
                                </div>
                                {filterOptions
                                    .filter((option) => option.type === filterType)
                                    .map((option) => (
                                        <button
                                            key={`${option.type}-${option.value}`}
                                            className={`
                        w-full px-3 py-2 text-sm text-left flex items-center justify-between
                        ${filters[option.type] === option.value ? 'text-secondary bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}
                      `}
                                            onClick={() => {
                                                onFilterChange(option.type, option.value);
                                            }}
                                        >
                                            {option.label}
                                            {filters[option.type] === option.value && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </button>
                                    ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
 