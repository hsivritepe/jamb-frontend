import { LucideIcon } from 'lucide-react';

export interface ServiceItem {
    id: number;
    title: string;
    image: string;
    url: string;
    subcategories: string[];
    type: 'indoor' | 'outdoor';
}

export interface Step {
    id: number;
    number: string;
    title: string;
    description: string;
    row: number;
    colSpan: number;
    colStart: number;
}

export interface Room {
    id: number;
    title: string;
    image: string;
    url: string;
    subcategories: string[];
}
