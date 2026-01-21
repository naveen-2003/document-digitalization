import { FileText, CheckCircle2 } from 'lucide-react';
import { DocumentSummary as SummaryType } from '../services/openai';

interface DocumentSummaryProps {
  documentType: string;
  summary: SummaryType | null;
  keyEntities: {
    names: string[];
    dates: string[];
    amounts: string[];
    locations: string[];
  };
  loading?: boolean;
}

export const DocumentSummary = ({
  documentType,
  summary,
  keyEntities,
  loading,
}: DocumentSummaryProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Document Summary</h3>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Document Type</span>
          <p className="text-lg font-semibold text-blue-600 mt-1">{documentType}</p>
        </div>

        {summary && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
              <p className="text-gray-800 leading-relaxed">{summary.summary}</p>
            </div>

            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
