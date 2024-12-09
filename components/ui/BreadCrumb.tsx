'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface BreadCrumbProps {
    items: ReadonlyArray<{
        readonly label: string;
        readonly href: string;
    }>;
}

export default function BreadCrumb({ items }: BreadCrumbProps) {
    const pathname = usePathname();
    const currentIndex = items.findIndex(
        (item) => item.href === pathname
    );

    return (
        <nav className="w-full border-b border-gray-200">
            <div className="flex items-center justify-between text-gray-500">
                {items.map((item, index) => {
                    const isActive = pathname === item.href;
                    const isAccessible = index <= currentIndex;

                    return (
                        <div
                            key={item.href}
                            className={`flex-1 relative ${
                                isActive
                                    ? 'border-b-2 border-brand -mb-[2px]'
                                    : ''
                            }`}
                        >
                            {isAccessible ? (
                                <Link
                                    href={item.href}
                                    className={`flex items-center justify-center py-4 hover:text-gray-800 ${
                                        isActive
                                            ? 'text-gray-800 font-medium'
                                            : ''
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="flex items-center justify-center py-4 text-gray-500 cursor-not-allowed">
                                    {item.label}
                                </span>
                            )}
                            {index < items.length - 1 && (
                                <ChevronRight className="w-5 h-5 absolute top-1/2 -translate-y-1/2 -right-3 text-gray-400" />
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
