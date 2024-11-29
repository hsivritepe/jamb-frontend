import { LucideIcon } from 'lucide-react';

export interface AppStoreButton {
    platform: 'ios' | 'android';
    store: string;
    text: string;
    icon: LucideIcon;
    href: string;
}
