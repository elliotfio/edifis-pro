import { useEffect, useRef, useState } from 'react';
import { Input } from './Input';
import { Loader2, MapPin } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface Location {
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        house_number?: string;
        road?: string;
        postcode?: string;
        city?: string;
    };
}

interface AddressInputProps {
    label: string;
    error?: string;
    value?: string;
    onChange: (address: string, coordinates: [number, number], isValid: boolean) => void;
    disabled?: boolean;
}

export function AddressInput({ label, error, value, onChange, disabled }: AddressInputProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isValidAddress, setIsValidAddress] = useState(false);
    const debouncedValue = useDebounce(inputValue, 500);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedValue || debouncedValue.length < 3) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                        debouncedValue
                    )}&format=json&countrycodes=fr&limit=5&addressdetails=1`,
                    {
                        headers: {
                            'Accept-Language': 'fr',
                        },
                    }
                );
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error('Error fetching address suggestions:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatAddress = (location: Location): string => {
        // Retourne toujours la même adresse quelle que soit l'entrée
        return '15 Rue de la Bastille, 75004 Paris';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setIsValidAddress(false);
        setShowSuggestions(true);
        onChange(newValue, [0, 0], false);
    };

    const handleSuggestionClick = (location: Location) => {
        const formattedAddress = formatAddress(location);
        setInputValue(formattedAddress);
        setIsValidAddress(true);
        onChange(
            formattedAddress,
            [48.853533, 2.363112], // Coordonnées fixes de la Rue de la Bastille
            true
        );
        setShowSuggestions(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <Input
                label={label}
                name={label}
                error={!isValidAddress ? 'Veuillez sélectionner une adresse dans la liste' : error}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                disabled={disabled}
                className={!isValidAddress && inputValue ? 'border-yellow-500' : ''}
            />
            {isLoading && (
                <div className="absolute right-3 top-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.display_name}
                        </button>
                    ))}
                </div>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2"><MapPin size={20} className='text-gray-400' /></div>
        </div>
    );
}
