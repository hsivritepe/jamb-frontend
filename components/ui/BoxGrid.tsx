import React from 'react';
import { cn } from '@/lib/utils';
import { SectionBoxSubtitle } from './SectionBoxSubtitle';

interface BoxGridProps {
    children: React.ReactNode;
    className?: string;
}

interface BoxProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'primary' | 'dark' | 'full-width' | 'light';
    isPopular?: boolean;
}

type BoxTagsProps = {
    tags: string[];
    variant?: 'primary' | 'default' | 'light';
};

export function BoxGrid({ children, className }: BoxGridProps) {
    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {children}
        </div>
    );
}

export function BoxGridRow({ children, className }: BoxGridProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-1 md:grid-cols-3 gap-4',
                className
            )}
        >
            {children}
        </div>
    );
}

export function Box({
    children,
    className,
    variant = 'default',
    isPopular,
}: BoxProps) {
    const variants = {
        default: 'bg-white border border-gray-200',
        primary: 'bg-blue-600 text-white',
        dark: 'bg-gray-900 text-white',
        'full-width': 'bg-gray-900 text-white w-full',
        light: 'bg-brand-light border border-gray-200',
    };

    return (
        <div
            className={cn(
                'rounded-xl p-6 relative flex flex-col justify-between',
                variants[variant],
                className
            )}
        >
            {isPopular && (
                <span className="absolute -top-3 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    Popular
                </span>
            )}
            {children}
        </div>
    );
}

export function BoxTitle({ children, className }: BoxGridProps) {
    return <SectionBoxSubtitle>{children}</SectionBoxSubtitle>;
}

export function BoxDescription({
    children,
    className,
}: BoxGridProps) {
    return <p>{children}</p>;
}

export function BoxPrice({
    amount,
    period,
    className,
    variant = 'default',
}: {
    amount: string | number;
    period: string;
    className?: string;
    variant?: 'default' | 'primary' | 'light';
}) {
    const numericAmount =
        typeof amount === 'string' ? parseFloat(amount) : amount;

    const variants = {
        default: 'text-lg text-gray-400',
        light: 'text-lg text-gray-400',
        primary: 'text-lg text-blue-300',
    };

    return (
        <div className="flex flex-col items-baseline gap-1 mb-1">
            <div className="flex items-baseline gap-1">
                <SectionBoxSubtitle>
                    From{' '}
                    {numericAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    })}{' '}
                    $
                </SectionBoxSubtitle>
                <span className={cn(variants[variant])}>
                    / {period}
                </span>
            </div>
            <div className={cn('text-md', variants[variant])}>
                {(numericAmount * 12).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                })}{' '}
                ${' '}
                <span className={cn(variants[variant])}>/ year</span>
            </div>
            <hr className="my-2 w-full" />
        </div>
    );
}

export function BoxTags({ tags, variant = 'default' }: BoxTagsProps) {
    const variants = {
        default: 'border border-gray-400',
        light: 'border border-brand text-brand',
        primary: 'border border-brand-light bg-white text-gray-900',
    };

    return (
        <div className="flex gap-2 flex-wrap my-4">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className={cn(
                        'px-3 py-1 text-sm rounded-md',
                        variants[variant]
                    )}
                >
                    {tag}
                </span>
            ))}
        </div>
    );
}
