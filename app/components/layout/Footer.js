import Link from 'next/link';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Phone,
    Mail,
    MapPin,
} from 'lucide-react';

const footerLinks = {
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
            text: 'support@jambi.com',
            href: 'mailto:support@jambi.com',
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <Link href="/">
                            <img
                                src="/logo.png"
                                alt="Jamb"
                                className="h-8 w-auto mb-6"
                            />
                        </Link>
                        <p className="text-sm mb-6">
                            Your trusted partner for all home services
                            and renovations. Professional, reliable,
                            and always at your service.
                        </p>
                        <div className="flex gap-4">
                            {footerLinks.social.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">
                            Services
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">
                            Contact Us
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.contact.map(
                                (item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                <span>
                                                    {item.text}
                                                </span>
                                            </a>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} Jambi. All
                            rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link
                                href="/terms"
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/privacy"
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
