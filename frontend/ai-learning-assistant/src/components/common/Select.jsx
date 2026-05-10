import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ options, value, onChange, placeholder = "Select an option", label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2" ref={containerRef}>
            {label && (
                <label className="block text-sm font-semibold text-foreground">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-card border-2 transition-all duration-300 rounded-xl outline-none
                        ${isOpen ? 'border-primary ring-4 ring-primary/10 shadow-glow-primary' : 'border-border hover:border-primary/40'}`}
                >
                    <span className={`text-sm font-medium ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown 
                        size={18} 
                        className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                            {options.length > 0 ? (
                                options.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors text-sm font-medium
                                            ${value === option.value 
                                                ? 'bg-primary/10 text-primary' 
                                                : 'text-foreground hover:bg-primary/5 hover:text-primary'}`}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {value === option.value && <Check size={16} />}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                    No options available
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Select;
