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

/**
 * These are the "raw" major holidays. We'll expand them to include
 * adjacent days if the holiday is Monday/Friday => "long weekend."
 */
const rawHolidays: Record<string, string> = {
  "2025-07-04": "Independence Day",
  "2025-11-27": "Thanksgiving Day",
  "2025-12-25": "Christmas Day",
};

/**
 * Build an "extended" holiday map: If the holiday is on a Friday,
 * we also treat Saturday as a holiday; if Monday, we also treat Sunday, etc.
 */
function buildExtendedHolidays(): Record<string, string> {
  const extended: Record<string, string> = { ...rawHolidays };

  for (const dateKey of Object.keys(rawHolidays)) {
    const holidayName = rawHolidays[dateKey];
    const dateObj = parseISO(dateKey); // e.g. parse "2025-07-04"
    const dw = getDay(dateObj); // Sunday=0,...,Mon=1,Fri=5,Sat=6

    // If holiday is Monday => treat Sunday as a holiday, too
    if (dw === 1) {
      const sunday = subDays(dateObj, 1);
      const sundayKey = format(sunday, "yyyy-MM-dd");
      extended[sundayKey] = `${holidayName} (long weekend)`;
    }
    // If holiday is Friday => treat Saturday as a holiday, too
    if (dw === 5) {
      const saturday = addDays(dateObj, 1);
      const saturdayKey = format(saturday, "yyyy-MM-dd");
      extended[saturdayKey] = `${holidayName} (long weekend)`;
    }
  }
  return extended;
}

/** Our final holiday map includes official + extended weekend days. */
const usHolidays = buildExtendedHolidays();

/**
 * Format large values per the rules:
 * - >1,000,000 => "X.YZ M"
 * - >100,000 => "NNN K" (no decimals)
 * - >1,000 => "NNN.NN K" (two decimals)
 * - else => two decimals
 */
function formatLargeValue(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(2)}M`; // e.g. 1.55M
  } else if (value >= 100_000) {
    const kVal = Math.round(value / 1000); // e.g. 150 => "150K"
    return `${kVal}K`;
  } else if (value >= 1_000) {
    const kVal = value / 1000;
    return `${kVal.toFixed(2)}K`; // e.g. 1.34K
  } else {
    // below 1,000 => show two decimals
    return value.toFixed(2);
  }
}

/**
 * Return a Tailwind text color class
 * - red if above base
 * - green if below base
 * - gray if roughly equal
 */
function getPriceColor(price: number, basePrice: number): string {
  if (price > basePrice) return "text-red-500";
  if (price < basePrice) return "text-green-500";
  return "text-gray-800";
}

/** Props for ServiceTimePicker */
interface ServiceTimePickerProps {
  /** The labor cost before date-based adjustments. */
  subtotal: number;
  /** Optional function if parent wants a "close" button. */
  onClose?: () => void;
  /** Called when user hits "Confirm/Change Date." */
  onConfirm: (selectedDate: string, coefficient: number) => void;
}

/**
 * A date-selection component for picking a day or "Anytime in a Month",
 * applying surcharges (coefficient) for near/immediate days or weekends,
 * and for US holidays or their extended "long weekend" days => 1.5 max.
 */
export default function ServiceTimePicker({
  subtotal,
  onClose,
  onConfirm,
}: ServiceTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCoefficient, setSelectedCoefficient] = useState<number>(1);
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);

  // "Anytime in a Month" button highlight
  const [anytimeSelected, setAnytimeSelected] = useState<boolean>(false);

  // Start from tomorrow, do not allow going to previous months
  const tomorrow = startOfTomorrow();
  const [currentMonth, setCurrentMonth] = useState<Date>(tomorrow);

  /** Identify if a date is in the extended holiday map. */
  function getHolidayName(date: Date): string {
    const dateKey = format(date, "yyyy-MM-dd");
    return usHolidays[dateKey] || "";
  }

  /**
   * Compute the final price & coefficient for a given date:
   * - If differenceInCalendarDays=0 => 1.5
   * - If =1 => 1.3
   * - <=5 => 1.25
   * - <=14 => 1.0
   * - <=29 => 0.95
   * - else => 0.9
   * Then weekends => if dayDiff>30 => 1.05, else +0.1
   * If holiday => max(1.5).
   */
  function getPriceForDate(date: Date) {
    const dayDiff = differenceInCalendarDays(date, tomorrow);
    let c = 1.0;

    // Base day-diff logic
    if (dayDiff === 0) c = 1.5;
    else if (dayDiff === 1) c = 1.3;
    else if (dayDiff <= 5) c = 1.25;
    else if (dayDiff <= 14) c = 1.0;
    else if (dayDiff <= 29) c = 0.95;
    else c = 0.9; // >30

    // Weekend or extended weekend => if dayDiff>30 => 1.05, else +0.1
    const dw = getDay(date); // 0=Sun,6=Sat
    if (dw === 0 || dw === 6) {
      if (dayDiff > 30) {
        c = 1.05;
      } else {
        c += 0.1;
      }
    }

    // Check if holiday => force up to 1.5
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

  /**
   * Build 6 weeks of data for the currentMonth
   */
  function generateCalendar(month: Date) {
    const startDay = startOfMonth(month);
    const endDay = endOfMonth(month);
    const days = eachDayOfInterval({ start: startDay, end: endDay });

    const calendar: Array<Array<any>> = [[]];
    let weekIndex = 0;

    // Pad out the first row
    for (let i = 0; i < getDay(startDay); i++) {
      calendar[weekIndex].push(null);
    }

    days.forEach((d) => {
      if (calendar[weekIndex].length === 7) {
        weekIndex++;
        calendar[weekIndex] = [];
      }
      const isPast = isBefore(d, tomorrow);
      const { price, priceDisplay, coefficient, holidayName } =
        getPriceForDate(d);

      calendar[weekIndex].push({
        date: d,
        dayNumber: format(d, "d"), // "4"
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

  /** Clicking on a day cell => update selected date. */
  function selectDayCell(cell: any) {
    if (cell.isPast) return;
    const fmt = format(cell.date, "EEE, d MMM yyyy");
    setSelectedDate(fmt);
    setSelectedCoefficient(cell.coefficient);
    setHasConfirmed(false);
    setAnytimeSelected(false);
  }

  /** "Anytime in a Month" => sets date to that string & c=1. */
  function pickAnytime() {
    setSelectedDate("Anytime in a Month");
    setSelectedCoefficient(1);
    setHasConfirmed(false);
    setAnytimeSelected(true);
  }

  /** Confirm => pass to parent => show "Change Date" label. */
  function handleConfirmClick() {
    if (!selectedDate) return;
    onConfirm(selectedDate, selectedCoefficient);
    setHasConfirmed(true);
  }
  const confirmButtonLabel = hasConfirmed ? "Change Date" : "Confirm Date";

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 w-full h-auto">
      {/* Header row */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Select Available Date{" "}
          <span className="text-sm text-gray-500 font-normal">
            (impacts labor total)
          </span>
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            className="text-gray-600 text-xl px-2 rounded hover:bg-gray-200 transition-colors active:scale-95"
          >
            &times;
          </button>
        )}
      </div>

      {/* "Anytime in a Month" */}
      <button
        onClick={pickAnytime}
        className={`w-full py-2 mb-6 border rounded-lg font-medium transition-transform active:scale-95
          ${
            anytimeSelected
              ? "bg-brand text-white border-brand"
              : "text-brand border-brand"
          }
        `}
      >
        Anytime in a Month
      </button>

      {/* Month nav */}
      <div className="flex justify-between mb-2">
        <button
          onClick={() => {
            const prev = addMonths(currentMonth, -1);
            if (!isBefore(prev, tomorrow)) {
              setCurrentMonth(prev);
            }
          }}
          className="text-blue-600 font-medium transition-transform active:scale-95"
        >
          ← Previous
        </button>
        <span className="text-xl font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentMonth((old) => addMonths(old, 1))}
          className="text-blue-600 font-medium transition-transform active:scale-95"
        >
          Next →
        </button>
      </div>

      {/* Weekdays header */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar grid */}
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
                                ${
                                  cell.isWeekend
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }
                                ${
                                  cell.isPast
                                    ? "opacity-50 cursor-not-allowed"
                                    : selectedDate ===
                                      format(cell.date, "EEE, d MMM yyyy")
                                    ? "border-blue-600 bg-blue-100 scale-105 shadow-lg"
                                    : "hover:bg-gray-100"
                                }
                                ${cell.holidayName ? "bg-red-50" : ""}
                    `}
                    title={
                      cell.holidayName
                        ? `Holiday: ${cell.holidayName}`
                        : undefined
                    }
                  >
                    {/* Day number (red if holiday) + price */}
                    <span
                      className={`text-lg font-bold ${
                        cell.holidayName ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {!cell.isPast && (
                      <span
                        className={`text-sm font-semibold ${getPriceColor(
                          cell.price,
                          subtotal
                        )}`}
                      >
                        {cell.priceDisplay}
                      </span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirmClick}
        disabled={!selectedDate}
        className={`w-full mt-6 py-3 rounded-lg font-medium transition-transform active:scale-95
          ${
            !selectedDate
              ? "opacity-50 cursor-not-allowed bg-blue-600 text-white"
              : hasConfirmed
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
          }
        `}
      >
        {confirmButtonLabel}
      </button>

      {/* If user selected a date => show details */}
      {selectedDate && (
        <p className="mt-3 text-center text-md text-gray-700">
          Selected:{" "}
          <span className="font-medium text-blue-600">
            {selectedDate}
            {/* If it's a holiday => show holiday name in parentheses */}
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
          <span className="font-medium">{selectedCoefficient.toFixed(2)}</span>
        </p>
      )}
    </div>
  );
}
