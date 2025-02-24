import { Apple, Play } from "lucide-react";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";

/**
 * AppPromotion component:
 * 1) Desktops (≥1024px, lg:) remain unchanged.
 * 2) Tablets (768px–1023px, md:):
 *    - Make the right box (phone mockup) smaller (e.g. md:w-2/3) 
 *      and pinned to the bottom (using self-end or mt-auto).
 * 3) Phones (<768px):
 *    - App Store Buttons in a column instead of a row.
 */
export default function AppPromotion() {
  return (
    <section className="sm:my-2 pt-8 px-8 bg-brand-light rounded-2xl">
      {/**
       * The parent container uses flex-col by default, 
       * switching to lg:flex-row at ≥1024px for desktop.
       */}
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
            Download our app to get instant quotes, book professionals,
            and track your project—all from your phone. Simplify your
            renovation today!
          </div>

          {/**
           * App Store Buttons:
           * - On phones (<768px), show them in a column (flex-col).
           * - On tablets/desktops (≥768px), revert to row (md:flex-row).
           */}
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            {/* Google Play Button */}
            <a
              href="#"
              className="flex items-center gap-4 bg-black text-white pl-4 pr-8 py-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Play size={32} fill="white" />
              <div>
                <div className="text-sm">Get it on</div>
                <div className="text-xl font-semibold">Google Play</div>
              </div>
            </a>

            {/* App Store Button */}
            <a
              href="#"
              className="flex items-center gap-4 bg-white text-black border border-black pl-4 pr-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Apple size={32} fill="black" />
              <div>
                <div className="text-sm">Download on the</div>
                <div className="text-xl font-semibold">App Store</div>
              </div>
            </a>
          </div>
        </div>

        {/**
         * Right Box - Phone Mockup:
         * - For tablets (768px–1023px), 
         *   we make it smaller (md:w-2/3) and pinned to bottom (self-end or mt-auto).
         * - For desktop (≥1024px, lg:...), original "lg:w-2/5" stays in effect.
         */}
        <div
          className="
            rounded-2xl
            lg:w-2/5
            pl-4 pr-12
            md:w-2/3    /* smaller width on tablets */
            md:self-end /* pinned at bottom within flex-col on tablets */
            md:mt-auto
          "
        >
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