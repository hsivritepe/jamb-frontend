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

export interface ServiceFeature {
    id: number;
    text: string;
}

export interface ServicePlan {
    id: number;
    name: string;
    price: number;
    description: string;
    features: ServiceFeature[];
    isPopular?: boolean;
}
