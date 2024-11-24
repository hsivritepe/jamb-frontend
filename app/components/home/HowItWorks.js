import { CheckCircle2, MessageCircle, Settings } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: 'Choose',
        description: 'Choose a service category',
        icon: CheckCircle2,
    },
    {
        id: 2,
        title: 'Answer',
        description:
            'Fill up with task-specific questions and instantly get a quote',
        icon: MessageCircle,
    },
    {
        id: 3,
        title: 'Manage',
        description:
            'Monitor the progress of the work through your account',
        icon: Settings,
    },
];

export default function HowItWorks() {
    return (
        <section className="px-4 py-16 md:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold">
                        How It Works?
                    </h2>
                    <a
                        href="#"
                        className="text-blue-600 hover:underline"
                    >
                        Learn more about our process
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.id}
                                className="relative flex flex-col items-center text-center"
                            >
                                {/* Icon */}
                                <div className="w-16 h-16 mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Icon className="w-8 h-8 text-blue-600" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600">
                                    {step.description}
                                </p>

                                {/* Connector Line (hide on mobile and last item) */}
                                {step.id !== steps.length && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-full border-t-2 border-dashed border-gray-300" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
