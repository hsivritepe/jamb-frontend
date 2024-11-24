'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';

const navigation = [
    { name: 'Services', href: '/services' },
    { name: 'Teams', href: '/teams' },
    { name: 'Packages', href: '/packages' },
    { name: 'About us', href: '/about' },
];

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed w-full z-50 bg-gray-100/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto py-4">
                <nav className="bg-white rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center h-16 px-6">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <img
                                src="/logo.png"
                                alt="Jamb"
                                className="h-8 w-auto"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Right Section */}
                        <div className="hidden md:flex items-center gap-4">
                            {/* Emergency Button */}
                            <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>Emergency</span>
                            </button>

                            {/* Language Selector */}
                            <div className="relative">
                                <button className="flex items-center gap-2 text-gray-700">
                                    <span>EN</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() =>
                                    setIsMobileMenuOpen(
                                        !isMobileMenuOpen
                                    )
                                }
                                className="text-gray-700 p-2"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 px-6 border-t">
                            <div className="flex flex-col gap-4">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-700 hover:text-blue-600 font-medium"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                {/* Mobile Emergency Button */}
                                <button className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <Phone className="w-4 h-4" />
                                    <span>Emergency</span>
                                </button>

                                {/* Mobile Language Selector */}
                                <button className="flex items-center gap-2 text-gray-700">
                                    <span>EN</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
