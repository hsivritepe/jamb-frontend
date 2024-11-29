import HeroSection from '@/app/components/home/HeroSection';
import ServicesGrid from '@/app/components/home/ServicesGrid';
import HowItWorks from '@/app/components/home/HowItWorks';
import RoomMakeovers from '@/app/components/home/RoomMakeovers';
import AppPromotion from '@/app/components/home/AppPromotion';
import ServicePackages from '@/app/components/home/ServicePackages';
import Footer from '@/app/components/layout/Footer';
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
