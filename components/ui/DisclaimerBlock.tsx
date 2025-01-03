// DisclaimerBlock.tsx

"use client";

export function DisclaimerBlock() {
  return (
    <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Disclaimer & Terms of Service</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Our services are performed by independent, licensed contractors who operate under their own credentials.
        </li>
        <li>
          All work is insured to provide you with peace of mind throughout the project.
        </li>
        <li>
          Pricing requires confirmation with the contractors, verification of material availability with suppliers, 
          and an assessment of delivery lead times.
        </li>
        <li>
          Usually, this verification process does not take more than 30 minutes. Afterward, final approval by the Client
          is required, and payment must be made in accordance with the selected payment terms.
        </li>
        <li>
          Until final approval is given, the estimate remains preliminary and subject to change.
        </li>
        <li>
          Our company provides support at every stage of the project, ensuring a seamless experience.
        </li>
        <li>
          The Client can monitor the entire order fulfillment process through our application.
        </li>
        <li>
          We will do everything possible to ensure the highest quality of work.
        </li>
        <li>
          You can read additional terms and conditions in the License Agreement.
        </li>
      </ul>
    </div>
  );
}