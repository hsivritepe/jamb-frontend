import { CheckCircle2, MessageCircle, Settings } from 'lucide-react';
import { Step } from '@/types/services';

const steps: Step[] = [
    {
        id: 1,
        title: 'Choose a Service',
        description:
            'Select from our wide range of professional home services',
        icon: CheckCircle2,
    },
    {
        id: 2,
        title: 'Book Instantly',
        description:
            'Schedule a service at your preferred time and location',
        icon: MessageCircle,
    },
    {
        id: 3,
        title: 'Get it Done',
        description:
            'Our verified professionals will complete your service',
        icon: Settings,
    },
];

export default function HowItWorks() {
    return (
        <section className="py-16">
            <div className="bg-white rounded-2xl p-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        How It Works
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Get your home services done in 3 simple steps
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.id}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
