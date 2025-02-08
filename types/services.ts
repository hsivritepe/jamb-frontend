import { LucideIcon } from 'lucide-react';

export interface ServiceCategory {
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

export interface ServiceItem {
    id: string;
    title: string;
    description: string;
    price: number;
    quantity?: number;
    categoryId: number;
}

export type EstimateService = {
    id: string;
    title: string;
    description: string;
    price: number;
    categoryId?: number;
    category: string;
    quantity?: number;
};
