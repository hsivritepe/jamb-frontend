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
        <footer className="border-t max-w-7xl mx-auto px-4 py-4">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Popular services */}
                    <div>
                        <h3 className="text-2xl mb-4">
                            Popular services
                        </h3>
                        <ul className="space-y-2">
                            <li>Electrical</li>
                            <li>Plumbing</li>
                            <li>Painting</li>
                            <li>Tilling</li>
                            <li>Flooring</li>
                        </ul>
                    </div>

                    {/* Popular rooms renovation */}
                    <div>
                        <h3 className="text-2xl mb-4">
                            Popular rooms renovation
                        </h3>
                        <ul className="space-y-2">
                            <li>Bathroom</li>
                            <li>Kitchen</li>
                            <li>Living room</li>
                            <li>Bedroom</li>
                            <li>Patio Upgrading</li>
                        </ul>
                    </div>

                    {/* Packages */}
                    <div>
                        <h3 className="text-2xl mb-4">Packages</h3>
                        <ul className="space-y-2">
                            <li>Basic</li>
                            <li>Enhanced</li>
                            <li>All-inclusive</li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-2xl mb-4">About</h3>
                        <ul className="space-y-2">
                            <li>How it works</li>
                            <li>About us</li>
                            <li>
                                <a
                                    href="#"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Become a pro →
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t pt-8">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <span className="text-gray-500">
                            All questions by number
                        </span>
                        <a
                            href="tel:+14374601830"
                            className="text-xl font-medium"
                        >
                            +1 437 460 18 30
                        </a>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2 text-gray-500">
                        <span>© 2024 Jamb. All Rights Reserved.</span>
                        <span>
                            Use of this site is subject to certain
                        </span>
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Terms Of Use
                        </a>
                        <span>.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
