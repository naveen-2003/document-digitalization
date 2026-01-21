import { Download, Share2, Mail, Printer } from 'lucide-react';
import { DetectedField } from '../services/documentAI';

interface ExportOptionsProps {
  documentName: string;
  filledFields: Record<string, string>;
  fields: DetectedField[];
  onClose: () => void;
}

export const ExportOptions = ({
  documentName,
  filledFields,
  fields,
  onClose,
}: ExportOptionsProps) => {
  const generateCSV = () => {
    const headers = ['Field Label', 'Field Type', 'Value'];
    const rows = fields.map(field => [
      field.label,
      field.fieldType,
      filledFields[field.id] || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentName}-filled.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateJSON = () => {
    const data = {
      documentName,
      exportDate: new Date().toISOString(),
      filledFields,
      fieldsMetadata: fields.map(f => ({
        id: f.id,
        label: f.label,
        type: f.fieldType,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentName}-filled.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      const content = `
        <html>
          <head>
            <title>${documentName} - Filled Form</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #3b82f6; color: white; }
              tr:nth-child(even) { background-color: #f9fafb; }
            </style>
          </head>
          <body>
            <h1>${documentName} - Filled Form</h1>
            <p><strong>Exported on:</strong> ${new Date().toLocaleString()}</p>
            <table>
              <tr>
                <th>Field Label</th>
                <th>Value</th>
              </tr>
              ${fields
                .map(
                  field => `
                <tr>
                  <td>${field.label}</td>
                  <td>${filledFields[field.id] || '-'}</td>
                </tr>
              `
                )
                .join('')}
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: documentName,
          text: 'Check out this filled document form',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Share functionality is not supported in your browser');
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Filled Document: ${documentName}`);
    const body = encodeURIComponent(
      `I have completed the form: ${documentName}\n\n${Object.entries(filledFields)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Export & Share</h2>

        <div className="space-y-3">
          <button
            onClick={generateCSV}
            className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Download as CSV</p>
              <p className="text-sm text-gray-600">Excel compatible format</p>
            </div>
          </button>

          <button
            onClick={generateJSON}
            className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <Download className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Download as JSON</p>
              <p className="text-sm text-gray-600">For system integration</p>
            </div>
          </button>

          <button
            onClick={handlePrint}
            className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
          >
            <Printer className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Print Form</p>
              <p className="text-sm text-gray-600">Print filled document</p>
            </div>
          </button>

          <button
            onClick={handleEmailShare}
            className="w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
          >
            <Mail className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Share via Email</p>
              <p className="text-sm text-gray-600">Send to recipient</p>
            </div>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors text-left"
          >
            <Share2 className="w-5 h-5 text-cyan-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Share</p>
              <p className="text-sm text-gray-600">Share via system options</p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
