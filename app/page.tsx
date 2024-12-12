import HeroSection from '@/components/home/HeroSection';
import ServicesGrid from '@/components/home/ServicesGrid';
import HowItWorks from '@/components/home/HowItWorks';
import RoomMakeovers from '@/components/home/RoomMakeovers';
import AppPromotion from '@/components/AppPromotion';
import ServicePackages from '@/components/ServicePackages';

export default function Home() {
    return (
        <main className="min-h-screen pt-20 ">
            <HeroSection />
            <ServicesGrid title="Comprehensive Home Services<br />at Your Fingertips" />
            <HowItWorks />
            <RoomMakeovers />
            <AppPromotion />
            <ServicePackages />
        </main>
    );
}
