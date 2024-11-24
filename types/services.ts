import { LucideIcon } from 'lucide-react';

export interface ServiceItem {
    id: number;
    title: string;
    count: number;
    image: string;
    subcategories: string[];
}

export interface Step {
    id: number;
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface Room {
    id: number;
    title: string;
    description: string;
    image: string;
    before: string;
    after: string;
}
