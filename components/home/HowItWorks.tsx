import { Step } from '@/types/services';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';

const steps: Step[] = [
    {
        id: 1,
        number: '1',
        title: 'Choose',
        description: 'Choose a category and type of work',
        row: 1,
        colSpan: 3,
        colStart: 1,
    },
    {
        id: 2,
        number: '2',
        title: 'Answer',
        description:
            'The system will ask a few clarifying questions and provide an accurate estimate instantly',
        row: 2,
        colSpan: 3,
        colStart: 3,
    },
    {
        id: 3,
        number: '3',
        title: 'Confirm and Wait',
        description:
            'We will automatically arrange materials and assign trusted professionals to arrive at the scheduled time',
        row: 1,
        colSpan: 3,
        colStart: 5,
    },
    {
        id: 4,
        number: '4',
        title: 'Manage',
        description:
            'Track the progress of the work directly through your account',
        row: 2,
        colSpan: 2,
        colStart: 7,
    },
];

export default function HowItWorks() {
    return (
        <section className="py-8 px-8 bg-brand-light rounded-2xl">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <SectionBoxTitle>How It Works?</SectionBoxTitle>
                    <a
                        href="/about"
                        className="text-blue-600 hover:text-blue-700 text-sm hidden md:block"
                    >
                        Learn more about our process
                    </a>
                </div>

                <div className="relative mt-12">
                    {/* Horizontal dividing line */}
                    <div className="hidden md:block absolute left-0 top-1/2 w-full h-[2px] bg-gray-200" />

                    <div className="grid grid-cols-8 gap-y-16 gap-x-4">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                style={{
                                    gridColumn: `${step.colStart} / span ${step.colSpan}`,
                                    gridRow: step.row,
                                }}
                            >
                                <StepBox step={step} />
                                <div
                                    className={`hidden md:block absolute ${
                                        step.row === 1
                                            ? 'bottom-[-32px]'
                                            : 'top-[-32px]'
                                    } left-6 w-[2px] h-[32px] bg-gray-200`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Separate StepBox component for cleaner code
function StepBox({ step }: { step: Step }) {
    return (
        <div className="relative">
            <div className="flex items-start mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white text-gray-300 font-bold rounded text-2xl">
                    {step.number}
                </div>
                <h3 className="text-xl font-semibold ml-4 pt-2">
                    {step.title}
                </h3>
            </div>
            <p className="text-gray-600 text-medium">
                {step.description}
            </p>
        </div>
    );
}
