import { ReactNode } from 'react';

export interface LayoutProps {
    children: ReactNode;
}

export interface MetaData {
    title: string;
    description: string;
    keywords: string[];
}
