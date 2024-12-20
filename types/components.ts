import { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export interface SearchInputProps extends InputProps {
    onSearch: (query: string) => void;
}
