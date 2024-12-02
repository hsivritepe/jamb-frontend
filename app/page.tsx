import HeroSection from '@/components/home/HeroSection';
import ServicesGrid from '@/components/home/ServicesGrid';
import HowItWorks from '@/components/home/HowItWorks';
import RoomMakeovers from '@/components/home/RoomMakeovers';
import AppPromotion from '@/components/home/AppPromotion';
import ServicePackages from '@/components/home/ServicePackages';
import Footer from '@/components/layout/Footer';
export default function Home() {
    return (
        <main className="min-h-screen pt-20">
            <HeroSection />
            <ServicesGrid />
            <HowItWorks />
            <RoomMakeovers />
            <AppPromotion />
            <ServicePackages />
        </main>
    );
}
