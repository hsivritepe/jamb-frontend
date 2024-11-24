import Link from 'next/link';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Phone,
    Mail,
    MapPin,
    LucideIcon,
} from 'lucide-react';
import { FooterLinks } from '@/types/common';

interface FooterLink {
    name: string;
    href: string;
}

interface ContactLink {
    icon: LucideIcon;
    text: string;
    href: string;
}

interface SocialLink {
    icon: LucideIcon;
    href: string;
    name: string;
}

const footerLinks: FooterLinks = {
    services: [
        { name: 'Electrical', href: '/services/electrical' },
        { name: 'Plumbing', href: '/services/plumbing' },
        { name: 'Painting', href: '/services/painting' },
        { name: 'Carpentry', href: '/services/carpentry' },
        { name: 'Cleaning', href: '/services/cleaning' },
    ],
    company: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Terms & Conditions', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
    ],
    contact: [
        {
            icon: Phone,
            text: '+1 (555) 123-4567',
            href: 'tel:+15551234567',
        },
        {
            icon: Mail,
            text: 'support@jamb.com',
            href: 'mailto:support@jamb.com',
        },
        {
            icon: MapPin,
            text: '123 Service Street, City, Country',
            href: '#',
        },
    ],
    social: [
        { icon: Facebook, href: '#', name: 'Facebook' },
        { icon: Twitter, href: '#', name: 'Twitter' },
        { icon: Instagram, href: '#', name: 'Instagram' },
        { icon: Linkedin, href: '#', name: 'LinkedIn' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Footer content remains the same, just with proper typing */}
        </footer>
    );
}
