// components/ui/ServiceCostBreakdown.tsx
import { formatWithSeparator } from '@/utils/format';

interface ServiceCostBreakdownProps {
  breakdown: {
    work_cost: string;
    material_cost: string;
    materials?: any[];
  };
}

export default function ServiceCostBreakdown({ breakdown }: ServiceCostBreakdownProps) {
  const laborCost = parseFloat(breakdown.work_cost || '0');
  const matCost = parseFloat(breakdown.material_cost || '0');
  const materials = breakdown.materials || [];

  return (
    <div className="mt-4 p-4 bg-gray-50 border rounded">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">Cost Breakdown</h4>
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between">
          <span>Labor</span>
          <span>${formatWithSeparator(laborCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>Materials</span>
          <span>${formatWithSeparator(matCost)}</span>
        </div>
      </div>
      {materials.length > 0 && (
        <table className="table-auto w-full text-sm text-left text-gray-700">
          ...
        </table>
      )}
    </div>
  );
}