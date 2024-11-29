import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
    name: string;
    href: string;
}

export interface FooterLink {
    name: string;
    href: string;
}

export interface ContactLink {
    icon: LucideIcon;
    text: string;
    href: string;
}

export interface SocialLink {
    icon: LucideIcon;
    href: string;
    name: string;
}

export interface FooterLinks {
    services: FooterLink[];
    company: FooterLink[];
    contact: ContactLink[];
    social: SocialLink[];
}
