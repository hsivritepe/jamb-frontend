import { Step } from '@/types/services';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';

const steps: Step[] = [
    {
        id: 1,
        number: '1',
        title: 'Choose',
        description: 'Choose a service category',
        position: 'top',
    },
    {
        id: 2,
        number: '2',
        title: 'Answer',
        description:
            'Fill up simple quiz form, including questions and industry standards for a seamless estimate',
        position: 'bottom',
    },
    {
        id: 3,
        number: '3',
        title: 'Wait',
        description:
            'We will automatically assign trusted professionals who will arrive at the agreed time.',
        position: 'top',
    },
    {
        id: 4,
        number: '4',
        title: 'Manage',
        description:
            'Monitor the progress of the work through your account',
        position: 'bottom',
    },
];

export default function HowItWorks() {
    const topSteps = steps.filter((step) => step.position === 'top');
    const bottomSteps = steps.filter(
        (step) => step.position === 'bottom'
    );

    return (
        <section className="py-8 px-8 bg-brand-light rounded-xl">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <SectionBoxTitle>How It Works?</SectionBoxTitle>
                    <a
                        href="#"
                        className="text-blue-600 hover:text-blue-700 text-sm hidden md:block"
                    >
                        Learn more about our process
                    </a>
                </div>

                <div className="relative mt-12">
                    <div className="hidden md:block absolute left-0 top-1/2 w-full h-[2px] bg-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-8 gap-8 relative">
                        {/* Top Row Steps */}
                        {topSteps.map((step) => (
                            <div
                                key={step.id}
                                className={`md:col-span-${
                                    step.id === 1 ? '3' : '3'
                                } md:col-start-${
                                    step.id === 1 ? '1' : '5'
                                }`}
                            >
                                <div className="relative-32">
                                    <div className="flex items-start mb-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-white text-brand-light font-bold rounded text-2xl">
                                            {step.number}
                                        </div>
                                        <h3 className="text-xl font-semibold ml-4 pt-2">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {step.description}
                                    </p>
                                    <div className="hidden md:block absolute bottom-[-64px] left-6 w-[2px] h-[64px] bg-gray-200" />
                                </div>
                            </div>
                        ))}

                        {/* Bottom Row Steps */}
                        {bottomSteps.map((step) => (
                            <div
                                key={step.id}
                                className={`md:col-span-${
                                    step.id === 4 ? '2' : '3'
                                } md:col-start-${
                                    step.id === 2 ? '3' : '7'
                                }`}
                            >
                                <div className="relative-32">
                                    <div className="hidden md:block absolute top-[-64px] left-6 w-[2px] h-[64px] bg-gray-200" />
                                    <div className="flex items-start mb-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-white text-brand-light font-bold rounded text-2xl">
                                            {step.number}
                                        </div>
                                        <h3 className="text-xl font-semibold ml-4 pt-2">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
