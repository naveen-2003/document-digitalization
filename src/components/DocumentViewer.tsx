import { useState } from 'react';
import { ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';
import { DetectedField } from '../services/documentAI';

interface DocumentViewerProps {
  imageUrl: string;
  fields: DetectedField[];
  onFieldClick: (field: DetectedField) => void;
  selectedField: DetectedField | null;
  filledFields: Record<string, string>;
}

export const DocumentViewer = ({
  imageUrl,
  fields,
  onFieldClick,
  selectedField,
  filledFields,
}: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  const getFieldColor = (field: DetectedField) => {
    if (filledFields[field.id]) {
      return 'rgba(34, 197, 94, 0.3)';
    }
    if (selectedField?.id === field.id) {
      return 'rgba(59, 130, 246, 0.4)';
    }
    return 'rgba(239, 68, 68, 0.3)';
  };

  const getBorderColor = (field: DetectedField) => {
    if (filledFields[field.id]) {
      return '#22c55e';
    }
    if (selectedField?.id === field.id) {
      return '#3b82f6';
    }
    return '#ef4444';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Document View</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-auto border-2 border-gray-200 rounded-lg"
        style={{ maxHeight: '600px' }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s',
          }}
        >
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt="Document"
              className="max-w-full"
            />

            {fields.map((field) => (
              <div
                key={field.id}
                onClick={() => onFieldClick(field)}
                className="absolute cursor-pointer transition-all hover:opacity-80"
                style={{
                  left: `${field.boundingBox.x}px`,
                  top: `${field.boundingBox.y}px`,
                  width: `${field.boundingBox.width}px`,
                  height: `${field.boundingBox.height}px`,
                  backgroundColor: getFieldColor(field),
                  border: `2px solid ${getBorderColor(field)}`,
                  borderRadius: '4px',
                }}
                title={field.label}
              >
                {filledFields[field.id] && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-red-200 border-2 border-red-500"></div>
          <span className="text-gray-700">Unfilled</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-blue-200 border-2 border-blue-500"></div>
          <span className="text-gray-700">Selected</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-green-200 border-2 border-green-500"></div>
          <span className="text-gray-700">Completed</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Progress: {Object.keys(filledFields).length} / {fields.length} fields
          </span>
          <span className="font-medium">
            {fields.length > 0
              ? Math.round((Object.keys(filledFields).length / fields.length) * 100)
              : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${
                fields.length > 0
                  ? (Object.keys(filledFields).length / fields.length) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
