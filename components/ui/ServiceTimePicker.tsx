"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  startOfTomorrow,
  differenceInCalendarDays,
  parseISO,
  addDays,
  subDays,
} from "date-fns";

const rawHolidays: Record<string, string> = {
  "2025-07-04": "Independence Day",
  "2025-11-27": "Thanksgiving Day",
  "2025-12-25": "Christmas Day",
};

function buildExtendedHolidays(): Record<string, string> {
  const extended: Record<string, string> = { ...rawHolidays };
  for (const dateKey of Object.keys(rawHolidays)) {
    const holidayName = rawHolidays[dateKey];
    const dateObj = parseISO(dateKey);
    const dw = getDay(dateObj);
    if (dw === 1) {
      const sunday = subDays(dateObj, 1);
      extended[format(sunday, "yyyy-MM-dd")] = `${holidayName} (long weekend)`;
    }
    if (dw === 5) {
      const saturday = addDays(dateObj, 1);
      extended[format(saturday, "yyyy-MM-dd")] = `${holidayName} (long weekend)`;
    }
  }
  return extended;
}

const usHolidays = buildExtendedHolidays();

function formatLargeValue(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(2)}M`;
  } else if (value >= 100_000) {
    const kVal = Math.round(value / 1000);
    return `${kVal}K`;
  } else if (value >= 1_000) {
    const kVal = value / 1000;
    return `${kVal.toFixed(2)}K`;
  } else {
    return value.toFixed(2);
  }
}

function formatMobileValue(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(1)}M`;
  } else if (value >= 100_000) {
    const kVal = Math.round(value / 1000);
    return `${kVal}K`;
  } else if (value >= 1_000) {
    const kVal = value / 1000;
    return `${kVal.toFixed(1)}K`;
  } else {
    return Math.round(value).toString();
  }
}

function getPriceColor(price: number, basePrice: number): string {
  if (price > basePrice) return "text-red-500";
  if (price < basePrice) return "text-green-500";
  return "text-gray-800";
}

interface ServiceTimePickerProps {
  subtotal: number;
  onClose?: () => void;
  onConfirm: (selectedDate: string, coefficient: number) => void;
}

export default function ServiceTimePicker({
  subtotal,
  onClose,
  onConfirm,
}: ServiceTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCoefficient, setSelectedCoefficient] = useState<number>(1);
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const [anytimeSelected, setAnytimeSelected] = useState<boolean>(false);

  const tomorrow = startOfTomorrow();
  const [currentMonth, setCurrentMonth] = useState<Date>(tomorrow);

  function getHolidayName(date: Date): string {
    const dateKey = format(date, "yyyy-MM-dd");
    return usHolidays[dateKey] || "";
  }

  function getPriceForDate(date: Date) {
    const dayDiff = differenceInCalendarDays(date, tomorrow);
    let c = 1.0;
    if (dayDiff === 0) c = 1.5;
    else if (dayDiff === 1) c = 1.3;
    else if (dayDiff <= 5) c = 1.25;
    else if (dayDiff <= 14) c = 1.0;
    else if (dayDiff <= 29) c = 0.95;
    else c = 0.9;

    const dw = getDay(date);
    if (dw === 0 || dw === 6) {
      if (dayDiff > 30) c = 1.05;
      else c += 0.1;
    }

    const holidayName = getHolidayName(date);
    if (holidayName && c < 1.5) {
      c = 1.5;
    }

    const finalPrice = subtotal * c;
    return {
      price: finalPrice,
      priceDisplay: formatLargeValue(finalPrice),
      coefficient: c,
      holidayName,
    };
  }

  function generateCalendar(month: Date) {
    const startDay = startOfMonth(month);
    const endDay = endOfMonth(month);
    const days = eachDayOfInterval({ start: startDay, end: endDay });

    const calendar: Array<Array<any>> = [[]];
    let weekIndex = 0;
    for (let i = 0; i < getDay(startDay); i++) {
      calendar[weekIndex].push(null);
    }

    days.forEach((d) => {
      if (calendar[weekIndex].length === 7) {
        weekIndex++;
        calendar[weekIndex] = [];
      }
      const isPast = isBefore(d, tomorrow);
      const { price, priceDisplay, coefficient, holidayName } = getPriceForDate(d);
      calendar[weekIndex].push({
        date: d,
        dayNumber: format(d, "d"),
        price,
        priceDisplay,
        coefficient,
        isWeekend: getDay(d) === 0 || getDay(d) === 6,
        holidayName,
        isPast,
      });
    });

    while (calendar.length < 6) {
      calendar.push(new Array(7).fill(null));
    }
    return calendar;
  }

  const calendarData = generateCalendar(currentMonth);

  function selectDayCell(cell: any) {
    if (cell.isPast) return;
    const fmt = format(cell.date, "EEE, d MMM yyyy");
    setSelectedDate(fmt);
    setSelectedCoefficient(cell.coefficient);
    setHasConfirmed(false);
    setAnytimeSelected(false);
  }

  function pickAnytime() {
    setSelectedDate("Anytime in a Month");
    setSelectedCoefficient(1);
    setHasConfirmed(false);
    setAnytimeSelected(true);
  }

  function handleConfirmClick() {
    if (!selectedDate) return;
    onConfirm(selectedDate, selectedCoefficient);
    setHasConfirmed(true);
  }
  const confirmButtonLabel = hasConfirmed ? "Change Date" : "Confirm Date";

  return (
    <div className="bg-white border-t border-b sm:border border-gray-300 sm:rounded-lg p-2 sm:p-4 w-full h-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="pl-2 text-2xl sm:text-3xl font-bold sm:font-semibold text-gray-800">
          Select Available Date{" "}
          <span className="text-sm text-gray-500 font-semibold sm:font-normal">
            (Impacts Total Labor)
          </span>
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            className="text-gray-600 text-4xl px-2 rounded hover:bg-gray-200 transition-colors active:scale-95"
          >
            &times;
          </button>
        )}
      </div>

      <button
        onClick={pickAnytime}
        className={`w-full py-2 mb-6 border rounded-lg font-semibold sm:font-medium transition-transform active:scale-95
          ${
            anytimeSelected
              ? "bg-blue-100 text-brand border-brand shadow-lg"
              : "hover:bg-gray-100 text-brand border-brand"
          }
        `}
      >
        Anytime in a Month
      </button>

      <div className="flex justify-between mb-2">
        <button
          onClick={() => {
            const prev = addMonths(currentMonth, -1);
            if (!isBefore(prev, tomorrow)) {
              setCurrentMonth(prev);
            }
          }}
          className="text-blue-600 font-semibold sm:font-medium transition-transform active:scale-95"
        >
          ← Previous
        </button>
        <span className="text-xl font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentMonth((old) => addMonths(old, 1))}
          className="text-blue-600 font-semibold sm:font-medium transition-transform active:scale-95"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold sm:font-medium text-gray-600 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="space-y-3">
        {calendarData.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-2">
            {week.map((cell, cIdx) => (
              <div key={cIdx} className="h-16 flex justify-center items-center">
                {!cell ? (
                  <div className="h-full"></div>
                ) : (
                  <button
                    disabled={cell.isPast}
                    onClick={() => selectDayCell(cell)}
                    className={`p-2 border rounded-lg w-full h-full flex flex-col justify-center items-center
                      transition-transform active:scale-95
                      ${cell.isWeekend ? "border-red-500" : "border-gray-300"}
                      ${
                        cell.isPast
                          ? "opacity-50 cursor-not-allowed"
                          : selectedDate === format(cell.date, "EEE, d MMM yyyy")
                          ? "border-blue-600 bg-blue-100 scale-105 shadow-lg"
                          : "hover:bg-gray-100"
                      }
                      ${cell.holidayName ? "bg-red-50" : ""}
                    `}
                    title={cell.holidayName ? `Holiday: ${cell.holidayName}` : undefined}
                  >
                    <span
                      className={`text-lg font-bold ${
                        cell.holidayName ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {!cell.isPast && (
                      <>
                        <span
                          className={`block sm:hidden text-sm font-semibold ${getPriceColor(
                            cell.price,
                            subtotal
                          )}`}
                        >
                          {formatMobileValue(cell.price)}
                        </span>
                        <span
                          className={`hidden sm:block text-sm font-semibold ${getPriceColor(
                            cell.price,
                            subtotal
                          )}`}
                        >
                          {cell.priceDisplay}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirmClick}
        disabled={!selectedDate}
        className={`w-full mt-6 py-3 rounded-lg font-semibold sm:font-medium transition-transform active:scale-95
          ${
            !selectedDate
              ? "opacity-50 cursor-not-allowed bg-blue-600 text-white"
              : hasConfirmed
              ? "border border-blue-600 text-blue-600 bg-transparent"
              : "bg-blue-600 text-white"
          }
        `}
      >
        {confirmButtonLabel}
      </button>

      {selectedDate && (
        <p className="mt-3 text-center text-md text-gray-700">
          Selected:{" "}
          <span className="font-semibold sm:font-medium text-blue-600">
            {selectedDate}
            {(() => {
              let matchedHoliday = "";
              for (const week of calendarData) {
                for (const day of week) {
                  if (
                    day &&
                    format(day.date, "EEE, d MMM yyyy") === selectedDate &&
                    day.holidayName
                  ) {
                    matchedHoliday = day.holidayName;
                    break;
                  }
                }
                if (matchedHoliday) break;
              }
              return matchedHoliday ? ` (${matchedHoliday})` : "";
            })()}
          </span>
          <br />
          Coefficient:{" "}
          <span className="font-semibold sm:font-medium">
            {selectedCoefficient.toFixed(2)}
          </span>
        </p>
      )}
    </div>
  );
}