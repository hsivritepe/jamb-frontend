import BreadCrumb from '@/components/ui/BreadCrumb';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { EMERGENCY_STEPS } from '@/constants/navigation';

export default function EmergencyEstimate() {
    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto mb-16">
                <BreadCrumb items={EMERGENCY_STEPS} />
                <SectionBoxTitle className="mt-12">
                    Estimate
                </SectionBoxTitle>
            </div>
        </main>
    );
}
