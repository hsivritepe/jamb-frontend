import { Apple, Play } from 'lucide-react';
import { SectionBoxTitle } from '@/app/components/ui/SectionBoxTitle';

export default function AppPromotion() {
    return (
        <section className="pt-8 px-8 bg-brand-light rounded-2xl">
            <div className="container mx-auto flex flex-col lg:flex-row">
                {/* Left Box - Content */}
                <div className="flex flex-col mb-8 lg:w-3/5 text-brand">
                    <SectionBoxTitle>
                        Manage Your Home
                        <br />
                        Projects Anytime,
                        <br />
                        Anywhere
                    </SectionBoxTitle>
                    <div className="text-md text-gray-600 w-3/4 py-6 leading-8 text-lg">
                        Download our app to get instant quotes, book
                        professionals, and track your project—all from
                        your phone. Simplify your renovation today!
                    </div>

                    {/* App Store Buttons */}
                    <div className="flex gap-6 mt-8">
                        <a
                            href="#"
                            className="flex items-center gap-4 bg-black text-white pl-4 pr-8 py-4 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Play size={32} fill="white" />
                            <div>
                                <div className="text-sm">
                                    Get it on
                                </div>
                                <div className="text-xl font-semibold">
                                    Google Play
                                </div>
                            </div>
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-4 bg-white text-black border border-black pl-4 pr-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Apple size={32} fill="black" />
                            <div>
                                <div className="text-sm">
                                    Download on the
                                </div>
                                <div className="text-xl font-semibold">
                                    App Store
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Right Box - Phone Mockup */}
                <div className="rounded-2xl lg:w-2/5 pl-4 pr-12">
                    <div className="relative mx-auto">
                        <div className="relative overflow-hidden">
                            <img
                                src="/images/app-screenshot.png"
                                alt="Jamb App Interface"
                                className="flex pt-2 pr-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
