"use client";

import React from "react";

interface PreferencesModalProps {
  /** Whether the modal is shown */
  show: boolean;
  /** Callback to close the modal (e.g. on Cancel / outside click) */
  onClose: () => void;
  /** Callback when user clicks Save */
  onSave: () => void;

  /** Link to the modal's div for outside-click detection */
  preferencesModalRef: React.RefObject<HTMLDivElement>;

  /** Selected language code */
  selectedLanguage: string;
  /** Set selected language code */
  setSelectedLanguage: (val: string) => void;

  /** Selected unit of measurement */
  selectedUnit: string;
  /** Set selected unit of measurement */
  setSelectedUnit: (val: string) => void;

  /** Selected currency code */
  selectedCurrency: string;
  /** Set selected currency code */
  setSelectedCurrency: (val: string) => void;

  /** All possible language codes */
  languages: string[];
  /** All possible units */
  units: string[];
  /** All possible currencies */
  currencies: string[];
  /** A map of language code => displayed name (e.g. ENG->English) */
  languageMap: Record<string, string>;
}

/**
 * PreferencesModal:
 * - A modal for language, units, and currency.
 * - The 'show' prop controls visibility.
 * - Each section is now a row of same-size buttons for consistent styling.
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
   * A helper to render a horizontal group of same-size buttons
   * for any array of codes (like 'ENG','FRA','ESP' or 'Feet','Meters', etc.).
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
            const isSelected = selected === item;
            const displayName = mapFn?.[item] ?? item;
            return (
              <button
                key={item}
                onClick={() => onSelect(item)}
                className={`px-3 py-2 w-24 rounded font-medium border text-center transition-colors
                  ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
                  }
                `}
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
      <div
        ref={preferencesModalRef}
        className="bg-white p-6 rounded-xl shadow-lg max-w-[460px] w-[90%]"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Preferences</h2>

        {/* Language buttons */}
        {renderButtonGroup(
          "Language",
          languages,
          selectedLanguage,
          setSelectedLanguage,
          languageMap
        )}

        {/* Units buttons */}
        {renderButtonGroup("Units", units, selectedUnit, setSelectedUnit)}

        {/* Currency buttons */}
        {renderButtonGroup(
          "Currency",
          currencies,
          selectedCurrency,
          setSelectedCurrency
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
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