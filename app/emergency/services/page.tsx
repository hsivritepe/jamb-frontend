import BreadCrumb from '@/components/ui/BreadCrumb';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { EMERGENCY_STEPS } from '@/constants/navigation';

export default function EmergencyServices() {
    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto mb-16">
                <BreadCrumb items={EMERGENCY_STEPS} />
                <SectionBoxTitle className="mt-12">
                    Select a service category
                </SectionBoxTitle>
            </div>
        </main>
    );
}
