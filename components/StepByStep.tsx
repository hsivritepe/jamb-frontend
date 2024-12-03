import { StepByStepProps } from '@/types/components';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { SectionBoxSubtitle } from '@/components/ui/SectionBoxSubtitle';
import Image from 'next/image';

export default function StepByStep({
    title,
    steps,
}: StepByStepProps) {
    return (
        <div className="py-12">
            <div className="container mx-auto">
                <SectionBoxTitle>{title}</SectionBoxTitle>
                <div className="mx-auto space-y-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row items-center bg-gray-200 p-8 rounded-md"
                        >
                            {index % 2 === 0 ? (
                                <>
                                    <div className="w-14 flex-shrink-0 mr-8 self-start">
                                        <div className="w-14 h-14 flex items-center justify-center bg-white text-gray-400 rounded-md text-xl font-medium border border-gray-200">
                                            {step.number}
                                        </div>
                                    </div>
                                    <div className="flex-1 self-center pr-16">
                                        <SectionBoxSubtitle>
                                            {step.title}
                                        </SectionBoxSubtitle>
                                        <div
                                            className="text-gray-600 space-y-4"
                                            dangerouslySetInnerHTML={{
                                                __html: step.description,
                                            }}
                                        />
                                    </div>
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        width={300}
                                        height={400}
                                        className="h-[400px] w-auto object-contain rounded-lg"
                                    />
                                </>
                            ) : (
                                <>
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        width={300}
                                        height={400}
                                        className="h-[400px] w-auto object-contain rounded-lg"
                                    />
                                    <div className="flex-1 self-center px-16">
                                        <SectionBoxSubtitle>
                                            {step.title}
                                        </SectionBoxSubtitle>
                                        <div
                                            className="text-gray-600 space-y-4"
                                            dangerouslySetInnerHTML={{
                                                __html: step.description,
                                            }}
                                        />
                                    </div>
                                    <div className="w-14 flex-shrink-0 ml-8 self-start">
                                        <div className="w-14 h-14 flex items-center justify-center bg-white text-gray-400 rounded-md text-xl font-medium border border-gray-200">
                                            {step.number}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
