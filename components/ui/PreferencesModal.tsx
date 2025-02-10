"use client";

import React from "react";

interface PreferencesModalProps {
  /** Whether the modal is shown */
  show: boolean;
  /** Callback to close the modal (e.g. on Cancel or outside click) */
  onClose: () => void;
  /** Callback when user clicks Save */
  onSave: () => void;

  /** Reference to the modal container for outside-click detection */
  preferencesModalRef: React.RefObject<HTMLDivElement>;

  /** Current language code */
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;

  /** Current measurement unit */
  selectedUnit: string;
  setSelectedUnit: (val: string) => void;

  /** Current currency code */
  selectedCurrency: string;
  setSelectedCurrency: (val: string) => void;

  /** Available language codes */
  languages: string[];
  /** Available measurement units */
  units: string[];
  /** Available currency codes */
  currencies: string[];
  /** Mapping from language code to display name (e.g. ENG -> 'English') */
  languageMap: Record<string, string>;
}

/**
 * PreferencesModal:
 * A modal that allows the user to select language, units, and currency.
 * Currently only ENG / Feet / US are enabled. Others are shown but disabled.
 */
export default function PreferencesModal({
  show,
  onClose,
  onSave,
  preferencesModalRef,

  selectedLanguage,
  setSelectedLanguage,
  selectedUnit,
  setSelectedUnit,
  selectedCurrency,
  setSelectedCurrency,

  languages,
  units,
  currencies,
  languageMap,
}: PreferencesModalProps) {
  if (!show) return null;

  /**
   * Renders a horizontal group of buttons for a given set of items (languages, units, currencies).
   * Only one option is "live"; all others are disabled for now. 
   */
  function renderButtonGroup<T extends string>(
    label: string,
    items: T[],
    selected: T,
    onSelect: (val: T) => void,
    mapFn?: Record<string, string>
  ) {
    return (
      <div className="mb-6">
        <p className="block text-lg font-medium text-gray-700 mb-2">{label}</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            // We only enable ENG for Language, Feet for Units, and US for Currency.
            const isEnabled =
              (label === "Language" && item === "ENG") ||
              (label === "Units" && item === "Feet") ||
              (label === "Currency" && item === "US");

            const isSelected = selected === item;
            const displayName = mapFn?.[item] ?? item;

            // Build classes conditionally
            let buttonClasses =
              "px-3 py-2 w-24 rounded font-medium border text-center transition-colors";

            if (!isEnabled) {
              // Disabled (coming soon)
              buttonClasses +=
                " bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed";
            } else if (isSelected) {
              buttonClasses +=
                " bg-blue-600 text-white border-blue-600";
            } else {
              buttonClasses +=
                " bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300";
            }

            return (
              <button
                key={item}
                onClick={
                  isEnabled
                    ? () => onSelect(item)
                    : undefined /* no onClick if disabled */
                }
                disabled={!isEnabled}
                className={buttonClasses}
                title={isEnabled ? undefined : "Coming soon"}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
      <div
        ref={preferencesModalRef}
        className="bg-white w-full sm:w-[400px] h-full p-6 flex flex-col relative"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Preferences</h2>

        {/* Language selection */}
        {renderButtonGroup(
          "Language",
          languages,
          selectedLanguage,
          setSelectedLanguage,
          languageMap
        )}

        {/* Unit selection */}
        {renderButtonGroup("Units", units, selectedUnit, setSelectedUnit)}

        {/* Currency selection */}
        {renderButtonGroup(
          "Currency",
          currencies,
          selectedCurrency,
          setSelectedCurrency
        )}

        {/* Modal action buttons */}
        <div className="mt-auto flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}