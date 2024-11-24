import { Apple, Play } from 'lucide-react';
import { AppStoreButton } from '@/types/app';

const storeButtons: AppStoreButton[] = [
    {
        platform: 'android',
        store: 'Get it on',
        text: 'Google Play',
        icon: Play,
        href: '#',
    },
    {
        platform: 'ios',
        store: 'Download on the',
        text: 'App Store',
        icon: Apple,
        href: '#',
    },
];

export default function AppPromotion() {
    return (
        <section className="py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Box - Content */}
                <div className="bg-white rounded-2xl p-8">
                    <div className="flex flex-col justify-center h-full">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-blue-600">
                                Manage Your Home
                            </h2>
                            <h3 className="text-3xl font-bold text-gray-900">
                                Projects Anytime,
                                <br />
                                Anywhere
                            </h3>
                            <p className="text-gray-600">
                                Download our App to get instant
                                quotes, book professionals, and view
                                project progress. Get real-time
                                updates, chat with your service
                                provider, and more.
                            </p>
                        </div>

                        {/* Download Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            {storeButtons.map((button) => {
                                const Icon = button.icon;
                                return (
                                    <a
                                        key={button.platform}
                                        href={button.href}
                                        className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors border border-gray-900 hover:border-gray-800"
                                    >
                                        <Icon className="w-6 h-6" />
                                        <div className="text-left">
                                            <div className="text-xs">
                                                {button.store}
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {button.text}
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Box - Phone Mockup */}
                <div className="bg-white rounded-2xl p-8">
                    <div className="relative mx-auto max-w-[300px]">
                        <div className="relative rounded-[3rem] overflow-hidden border-8 border-gray-900 bg-gray-900">
                            <img
                                src="/app-screenshot.jpg"
                                alt="Jamb App Interface"
                                className="w-full aspect-[9/19] object-cover rounded-[2.5rem]"
                            />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-900 rounded-b-2xl" />
                        </div>

                        <div className="absolute -right-4 top-12 bg-white p-4 rounded-lg shadow-lg w-48">
                            <div className="text-sm font-semibold mb-2 text-gray-900">
                                Order #2023-12-20
                            </div>
                            <div className="text-xs text-gray-600">
                                <div className="flex justify-between mb-1">
                                    <span>Service:</span>
                                    <span>Electrical</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className="text-green-600">
                                        In Progress
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
