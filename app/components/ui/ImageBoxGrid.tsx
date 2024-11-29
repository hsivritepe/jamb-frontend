'use client';

import Image from 'next/image';

interface Item {
    id: number;
    title: string;
    image: string;
    url: string;
    subcategories: string[];
}

interface ImageBoxGridProps {
    items: Item[];
    gridCols?: 4 | 6; // Number of columns
    showCount?: boolean;
}

export function ImageBoxGrid({
    items,
    showCount = true,
}: ImageBoxGridProps) {
    return (
        <div
            className={`grid gap-4`}
            style={{
                gridTemplateColumns: `repeat(auto-fit, 300px)`,
            }}
        >
            {items.map((item) => (
                <div key={item.id} className="relative group">
                    <div className="relative overflow-hidden rounded-xl aspect-square w-full">
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-110"
                        />

                        <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                            <h3
                                className="font-medium text-white text-2xl"
                                style={{
                                    textShadow:
                                        '1px 1px 3px rgba(0, 0, 0, 0.8)',
                                }}
                            >
                                {item.title}
                                {showCount &&
                                    item.subcategories.length &&
                                    `(${item.subcategories.length})`}
                            </h3>
                        </div>

                        {item.subcategories && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col pt-16 px-4">
                                <div
                                    className="text-white space-y-2"
                                    style={{
                                        textShadow:
                                            '1px 1px 3px rgba(0, 0, 0, 0.8)',
                                    }}
                                >
                                    {item.subcategories
                                        .slice(0, 5)
                                        .map((sub, idx) => (
                                            <div key={idx}>
                                                <span className="text-sm">
                                                    {sub}
                                                </span>
                                            </div>
                                        ))}
                                    {item.subcategories.length - 5 >
                                        0 && (
                                        <div className="flex !my-8">
                                            <span className="text-sm">
                                                More{' '}
                                                {item.subcategories
                                                    .length - 5}{' '}
                                                categories →
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
