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

  /** All possible languages */
  languages: string[];
  /** All possible units */
  units: string[];
  /** All possible currencies */
  currencies: string[];
  /** A map of language code => displayed name (e.g. ENG->English) */
  languageMap: Record<string, string>;
}

/**
 * Separate Preferences Modal:
 * Language, units, currency. Rendered only if props.show=true.
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

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
      <div
        ref={preferencesModalRef}
        className="bg-white p-6 rounded-xl shadow-lg max-w-[500px] w-[90%]"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Preferences</h2>

        {/* Language dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-100 focus:border-blue-300"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {languageMap[lang] ?? lang}
              </option>
            ))}
          </select>
        </div>

        {/* Units dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Units
          </label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-100 focus:border-blue-300"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Currency dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-100 focus:border-blue-300"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}