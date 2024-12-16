"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";

// Utility function to format numbers into K format
const formatToK = (value: number): string => {
  return value >= 1000 ? `${(value / 1000).toFixed(2)}K` : value.toFixed(2);
};

// Props interface
interface ServiceTimePickerProps {
  subtotal: number; // Base subtotal value
  onClose: () => void; // Function to close the modal
  onConfirm: (selectedDate: string, coefficient: number) => void; // Function to confirm the selected date and coefficient
}

export default function ServiceTimePicker({
  subtotal,
  onClose,
  onConfirm,
}: ServiceTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCoefficient, setSelectedCoefficient] = useState<number>(1);

  // Generate price for specific dates and return the coefficient
  const getPriceForDate = (index: number, isWeekend: boolean) => {
    let coefficient = 1;
    if (index === 0) coefficient = 1.3;
    else if (index === 1) coefficient = 1.25;
    else if (index === 2) coefficient = 1.2;
    else if (index >= 3 && index <= 5) coefficient = 1.15;
    else if (index >= 6 && index <= 14) coefficient = 1.0;
    else if (index >= 15 && index <= 29) coefficient = 0.95;
    else coefficient = 0.9;

    if (isWeekend) coefficient += 0.1; // Extra charge for weekends

    return { price: subtotal * coefficient, coefficient };
  };

  // Generate 30 days grouped by weeks
  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < 30; i++) {
    const date = addDays(new Date(), i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const { price, coefficient } = getPriceForDate(i, isWeekend);

    currentWeek.push({
      date,
      formattedDate: format(date, "EEE, d MMM yyyy"), // Add day of week
      price: formatToK(price),
      isWeekend,
      coefficient, // Store coefficient for selected day
    });

    // Start a new week if we reach Sunday or end of days
    if (dayOfWeek === 0 || i === 29) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-[900px] shadow-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Select Available Time</h2>
          <button onClick={onClose} className="text-gray-600 text-lg">
            &times;
          </button>
        </div>

        {/* "Anytime in a Month" Option */}
        <button
          onClick={() => onConfirm("Anytime in a month", 1)}
          className="w-full py-2 mb-6 text-brand border border-brand rounded-lg font-medium"
        >
          Anytime in a Month
        </button>

        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-gray-600">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-red-500">Sat</div>
          <div className="text-red-500">Sun</div>
        </div>

        {/* Weekly Calendar */}
        <div className="space-y-4">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-3">
              {week.map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => {
                    setSelectedDate(day.formattedDate);
                    setSelectedCoefficient(day.coefficient);
                  }}
                  className={`p-2 border rounded-lg text-center flex flex-col justify-center ${
                    day.isWeekend ? "text-red-500" : "text-gray-800"
                  } ${
                    selectedDate === day.formattedDate
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-xs font-medium">{day.formattedDate}</div>
                  <div className="text-sm font-semibold text-blue-600">
                    ${day.price}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={() =>
            selectedDate && onConfirm(selectedDate, selectedCoefficient)
          }
          className={`w-full mt-6 py-3 text-white bg-blue-600 rounded-lg font-medium ${
            !selectedDate ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!selectedDate}
        >
          Confirm Date
        </button>
      </div>
    </div>
  );
}