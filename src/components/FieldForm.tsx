import { useState, useEffect } from 'react';
import { DetectedField } from '../services/documentAI';
import { Check, X, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

interface FieldFormProps {
  field: DetectedField | null;
  value: string;
  onValueChange: (value: string) => void;
  onSave: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalFields: number;
  suggestion?: string;
}

export const FieldForm = ({
  field,
  value,
  onValueChange,
  onSave,
  onNext,
  onPrevious,
  currentIndex,
  totalFields,
  suggestion,
}: FieldFormProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value, field?.id]);

  const handleSave = () => {
    onValueChange(localValue);
    onSave();
  };

  const handleNext = () => {
    onValueChange(localValue);
    onNext();
  };

  const handlePrevious = () => {
    onValueChange(localValue);
    onPrevious();
  };

  const applySuggestion = () => {
    if (suggestion) {
      setLocalValue(suggestion);
    }
  };

  if (!field) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">No field selected</p>
          <p className="text-sm">Click on a highlighted field in the document to start</p>
        </div>
      </div>
    );
  }

  const renderInput = () => {
    const commonClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none";

    switch (field.fieldType) {
      case 'date':
        return (
          <input
            type="date"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={commonClasses}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={commonClasses}
            placeholder="example@email.com"
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={commonClasses}
            placeholder="+1 (555) 000-0000"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={commonClasses}
            placeholder="0"
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localValue === 'true'}
              onChange={(e) => setLocalValue(e.target.checked ? 'true' : 'false')}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">Check this box</span>
          </div>
        );

      case 'address':
        return (
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={commonClasses}
            rows={3}
            placeholder="Enter complete address"
          />
        );

      default:
        return (
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={commonClasses}
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Fill Field</h3>
        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {totalFields}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <div className="text-xs text-gray-500 mb-2">
            Type: <span className="font-medium">{field.fieldType}</span>
          </div>
        </div>

        {field.guidance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Guidance:</p>
                <p className="text-sm text-blue-800">{field.guidance}</p>
              </div>
            </div>
          </div>
        )}

        {suggestion && suggestion !== localValue && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900 mb-1">
                  Suggested:
                </p>
                <p className="text-sm text-green-800">{suggestion}</p>
              </div>
              <button
                onClick={applySuggestion}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Input
          </label>
          {renderInput()}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => {
              setLocalValue('');
              onValueChange('');
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === totalFields - 1}
            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
