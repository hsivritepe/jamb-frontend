import { clampQuantity } from '@/utils/clampQuantity';

interface QuantitySelectorProps {
    serviceId: string;
    value: number;          // текущее значение
    onChange: (val: number) => void;
    unit?: string;
    className?: string;
  }
  
  export default function QuantitySelector({ serviceId, value, onChange, unit = 'each', className }: QuantitySelectorProps) {
  
    const handleIncrement = () => {
      const next = clampQuantity(serviceId, value + 1);
      onChange(next);
    };
  
    const handleDecrement = () => {
      const next = clampQuantity(serviceId, value - 1);
      onChange(next);
    };
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value) || 0;
      const next = clampQuantity(serviceId, parsed);
      onChange(next);
    };
  
    return (
      <div className={`flex items-center gap-1 ${className || ''}`}>
        <button onClick={handleDecrement} className="...">-</button>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className="..."
        />
        <button onClick={handleIncrement} className="...">+</button>
        <span className="text-sm text-gray-600">{unit}</span>
      </div>
    );
  }