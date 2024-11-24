import { Apple, Play } from 'lucide-react';

export default function AppPromotion() {
    return (
        <section className="px-4 py-16 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-blue-600">
                                Manage Your Home
                            </h2>
                            <h3 className="text-3xl font-bold">
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Google Play Button */}
                            <a
                                href="#"
                                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <Play className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="text-xs">
                                        Get it on
                                    </div>
                                    <div className="text-sm font-semibold">
                                        Google Play
                                    </div>
                                </div>
                            </a>

                            {/* App Store Button */}
                            <a
                                href="#"
                                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <Apple className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="text-xs">
                                        Download on the
                                    </div>
                                    <div className="text-sm font-semibold">
                                        App Store
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right Content - Phone Mockup */}
                    <div className="relative">
                        <div className="relative mx-auto max-w-[300px]">
                            {/* Phone Frame */}
                            <div className="relative rounded-[3rem] overflow-hidden border-8 border-black bg-black">
                                <img
                                    src="/app-screenshot.jpg" // Add your app screenshot to public folder
                                    alt="Jambi App Interface"
                                    className="w-full aspect-[9/19] object-cover rounded-[2.5rem]"
                                />

                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-2xl" />
                            </div>

                            {/* Order Details Preview */}
                            <div className="absolute -right-4 top-12 bg-white p-4 rounded-lg shadow-lg w-48">
                                <div className="text-sm font-semibold mb-2">
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
            </div>
        </section>
    );
}
