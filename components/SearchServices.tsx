'use client';
import { useState, ChangeEvent } from 'react';
import { Search } from 'lucide-react';

export default function SearchServices() {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };
    return (
        <div className="relative">
            <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Explore 995 Services"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-[60px] pl-5 pr-6 rounded-xl border border-brand-light focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base placeholder-brand bg-brand-light"
                />
                <Search className="relative right-9 h-5 w-5 text-blue-600" />
            </div>
        </div>
    );
}
