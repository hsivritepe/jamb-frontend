import { LucideIcon } from 'lucide-react';

export interface ServiceItem {
    id: number;
    title: string;
    count: number;
    image: string;
    subcategories: string[];
    type: 'indoor' | 'outdoor';
}

export interface Step {
    id: number;
    number: string;
    title: string;
    description: string;
    position: 'top' | 'bottom';
}

export interface Room {
    id: number;
    title: string;
    description: string;
    image: string;
    before: string;
    after: string;
}
