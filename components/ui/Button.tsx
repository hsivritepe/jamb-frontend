interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

export default function Button({
    children,
    variant = 'primary',
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`px-8 py-2 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
