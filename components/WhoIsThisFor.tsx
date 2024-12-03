import InfoBox from './ui/InfoBox';
import { SectionBoxTitle } from './ui/SectionBoxTitle';

const sections = [
    {
        image: '/images/who-is-this-for-img-1.jpg',
        title: 'Homeowners',
        description:
            'Our service is perfect for those who want to fully entrust home improvement tasks to professionals. We handle everything - from sourcing materials to finishing the job, ensuring minimal involvement from the client.',
        highlights: [
            "You don't need to get into the details — just choose a service and enjoy the results. This is especially relevant for large projects or regular maintenance.",
        ],
        layout: 'vertical' as const,
    },
    {
        image: '/images/who-is-this-for-img-2.jpg',
        title: 'Renters',
        description:
            'If you need to quickly fix problems or prepare a rental property our service provides tast solutions for any issue',
        highlights: [
            'We work within tight deadlines to help resolve any problems, from repairs to cleaning or prepping a property for the market. You save time and avoid the hassle.',
        ],
        layout: 'vertical' as const,
    },
    {
        image: '/images/who-is-this-for-img-3.jpg',
        title: 'Busy Professionals',
        description:
            "For those who don't have time to deal with home issues or organize repairs, our service is the pertect solution. We provide a full-service evcle. freeina you from any concerns",
        highlights: [
            'We handle all the logistics and execution. All you need to do is pick the service, and we take care of the rest. You save time and avoid stress.',
        ],
        layout: 'horizontal' as const,
    },
];

export default function WhoIsThisFor() {
    return (
        <section className="pt-12 pb-24">
            <div className="container mx-auto">
                <SectionBoxTitle>Who Is This For?</SectionBoxTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={
                                section.layout === 'horizontal'
                                    ? 'md:col-span-2'
                                    : ''
                            }
                        >
                            <InfoBox {...section} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
