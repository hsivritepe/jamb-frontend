"use client";

import { useState } from "react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  isBefore,
  startOfTomorrow,
  differenceInCalendarDays,
} from "date-fns";

// Utility function to format numbers into K format
const formatToK = (value: number): string => {
  return value >= 1000 ? `${(value / 1000).toFixed(2)}K` : value.toFixed(2);
};

// Function to determine color for price based on its value
const getPriceColor = (price: number, basePrice: number): string => {
  if (price > basePrice) return "text-red-500";
  if (price < basePrice) return "text-green-500";
  return "text-gray-800";
};

// Props interface
interface ServiceTimePickerProps {
  subtotal: number;
  onClose: () => void;
  onConfirm: (selectedDate: string, coefficient: number) => void;
}

export default function ServiceTimePicker({
  subtotal,
  onClose,
  onConfirm,
}: ServiceTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCoefficient, setSelectedCoefficient] = useState<number>(1);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfTomorrow());

  const tomorrow = startOfTomorrow();

  // Генерация цены и коэффициента на основе индекса
  const getPriceForDate = (date: Date) => {
    const daysDifference = differenceInCalendarDays(date, tomorrow);
    let coefficient = 1;

    if (daysDifference === 0) coefficient = 1.3;
    else if (daysDifference === 1) coefficient = 1.25;
    else if (daysDifference === 2) coefficient = 1.2;
    else if (daysDifference >= 3 && daysDifference <= 5) coefficient = 1.15;
    else if (daysDifference >= 6 && daysDifference <= 14) coefficient = 1.0;
    else if (daysDifference >= 15 && daysDifference <= 29) coefficient = 0.95;
    else coefficient = 0.9;

    if (getDay(date) === 0 || getDay(date) === 6) coefficient += 0.1;

    return { price: subtotal * coefficient, coefficient };
  };

  // Генерация календаря для текущего месяца
  const generateCalendar = (month: Date) => {
    const startDay = startOfMonth(month);
    const endDay = endOfMonth(month);
    const days = eachDayOfInterval({ start: startDay, end: endDay });
    const calendar: Array<Array<any>> = [[]];

    let weekIndex = 0;

    // Заполнение ячеек перед первым днем месяца
    const firstDayOfWeek = getDay(startDay); // Воскресенье = 0
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendar[weekIndex].push(null);
    }

    // Заполнение дней месяца
    days.forEach((date) => {
      if (calendar[weekIndex].length === 7) {
        weekIndex++;
        calendar[weekIndex] = [];
      }

      const isPastDay = isBefore(date, tomorrow);
      const { price, coefficient } = getPriceForDate(date);

      calendar[weekIndex].push({
        date,
        formattedDate: format(date, "EEE, d MMM"),
        price: formatToK(price),
        rawPrice: price,
        coefficient,
        isPastDay,
        isWeekend: getDay(date) === 0 || getDay(date) === 6,
      });
    });

    // Дополнение строк до 6 недель
    while (calendar.length < 6) {
      calendar.push(new Array(7).fill(null));
    }

    return calendar;
  };

  const calendar = generateCalendar(currentMonth);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-[900px] shadow-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Select Available Time</h2>
          <button onClick={onClose} className="text-gray-600 text-3xl">
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

        {/* Month Navigation */}
        <div className="flex justify-between mb-2">
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
            disabled={isBefore(addMonths(currentMonth, -1), tomorrow)}
            className={`text-blue-600 font-medium ${
              isBefore(addMonths(currentMonth, -1), tomorrow)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            ← Previous Month
          </button>
          <span className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="text-blue-600 font-medium"
          >
            Next Month →
          </button>
        </div>

        {/* Days of the Week */}
        <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar */}
        <div className="space-y-3">
          {calendar.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => (
                <div key={dayIndex} className="h-16 flex justify-center items-center">
                  {day ? (
                    <button
                      disabled={day.isPastDay}
                      onClick={() => {
                        setSelectedDate(format(day.date, "EEE, d MMM yyyy"));
                        setSelectedCoefficient(day.coefficient);
                      }}
                      className={`p-2 border rounded-lg w-full h-full flex flex-col justify-center items-center ${
                        day.isWeekend ? "border-red-500" : "border-gray-300"
                      } ${
                        day.isPastDay
                          ? "opacity-50 cursor-not-allowed"
                          : selectedDate === format(day.date, "EEE, d MMM yyyy")
                          ? "border-blue-600 bg-blue-100 scale-105 shadow-lg"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {day.formattedDate}
                      </span>
                      {!day.isPastDay && (
                        <span
                          className={`text-sm font-semibold ${getPriceColor(
                            day.rawPrice,
                            subtotal
                          )}`}
                        >
                          ${day.price}
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="h-full"></div>
                  )}
                </div>
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