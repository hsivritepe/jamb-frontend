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

export interface StepByStepProps {
    title: string;
    steps: {
        number: number;
        title: string;
        description: string;
        image: string;
    }[];
}

export interface ButtonProps {
    children: React.ReactNode;
}

export interface BreadCrumbItem {
    label: string;
    href: string;
}

export interface BreadCrumbProps {
    items: BreadCrumbItem[];
}
