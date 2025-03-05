import type React from 'react';
import { Search } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface FilterOption {
    value: string;
    label: string;
}

interface SearchBarProps {
    onSearch: (query: string) => void;
    value?: string;
    filterOptions?: FilterOption[];
    onFilterChange?: (value: string) => void;
    placeholder?: string;
    selectedFilter?: string;
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = memo(({
    onSearch,
    value: externalValue = '',
    filterOptions,
    onFilterChange,
    placeholder = 'Rechercher',
    selectedFilter,
    className = '',
}) => {
    const [localValue, setLocalValue] = useState(externalValue);
    const debouncedValue = useDebounce(localValue, 300);

    useEffect(() => {
        onSearch(debouncedValue);
    }, [debouncedValue, onSearch]);

    useEffect(() => {
        setLocalValue(externalValue);
    }, [externalValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-secondary focus:border-secondary sm:text-sm"
                placeholder={placeholder}
                value={localValue}
                onChange={handleChange}
            />
            {filterOptions && (
                <select
                    value={selectedFilter}
                    onChange={(e) => onFilterChange?.(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
                >
                    {filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;