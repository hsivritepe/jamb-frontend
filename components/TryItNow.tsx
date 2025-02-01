import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { SectionBoxSubtitle } from '@/components/ui/SectionBoxSubtitle';
import Button from '@/components/ui/Button';
export default function TryItNow() {
    return (
        <div className="py-4">
            <div className="container flex flex-col md:flex-row items-center mx-auto p-10 rounded-md bg-brand-light">
                <div className="flex-1">
                    <SectionBoxTitle className="text-brand">
                        Try It Now!
                    </SectionBoxTitle>
                    <SectionBoxSubtitle>
                        10% of your first order
                    </SectionBoxSubtitle>
                </div>
                <div className="flex-1">
                    <Button className="w-full p-12">
                        Try Jamb &nbsp; →
                    </Button>
                    <div className="text-md text-gray-500 pt-4">
                        Offer valid on the first order on thejamb.com or
                        the Jamp app for new users only.
                    </div>
                </div>
            </div>
        </div>
    );
}
