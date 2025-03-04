import React, { forwardRef, useState } from 'react';

import { Check, ChevronDown } from 'lucide-react';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    name: string;
    error?: string;
    options: SelectOption[];
    value: string;
    onChange?: (value: string) => void;
}

export const SelectInput = forwardRef<HTMLInputElement, SelectInputProps>(
    ({ label, name, error, options, value, onChange, className = '', ...props }, ref) => {
        const [isOpen, setIsOpen] = useState(false);

        const selectedOption = options.find((opt) => opt.value === value);

        return (
            <div className="relative">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            w-full flex items-center justify-between px-3 py-2 text-sm 
            border border-gray-300 rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
                >
                    <span className={`${!value ? 'text-gray-500' : 'text-gray-900'}`}>
                        {selectedOption?.label || 'Choisir'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
                        <div className="absolute w-full mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`
                      w-full px-3 py-2 text-sm text-left flex items-center justify-between
                      ${value === option.value ? 'text-secondary bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                                        onClick={() => {
                                            onChange && onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {option.label}
                                        {value === option.value && <Check className="h-4 w-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

                {/* Input caché pour react-hook-form */}
                <input type="hidden" name={name} ref={ref} value={value} {...props} />
            </div>
        );
    }
);

SelectInput.displayName = 'SelectInput';
 