export interface DetectedField {
  id: string;
  type: string;
  label: string;
  value: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  guidance: string;
  fieldType: 'text' | 'date' | 'number' | 'email' | 'phone' | 'checkbox' | 'signature' | 'address';
}

export interface DocumentAnalysisResult {
  documentType: string;
  confidence: number;
  extractedText: string;
  detectedFields: DetectedField[];
  keyEntities: {
    names: string[];
    dates: string[];
    amounts: string[];
    locations: string[];
  };
  languageDetected: string;
  processingTime: number;
}

export const processDocumentWithGoogleAI = async (
  imageFile: File
): Promise<DocumentAnalysisResult> => {
  const startTime = Date.now();

  const base64Image = await fileToBase64(imageFile);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/process-document`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          imageBase64: base64Image.split(',')[1],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Processing failed: ${response.statusText}`);
    }

    const result = await response.json() as DocumentAnalysisResult;
    result.processingTime = Date.now() - startTime;

    return result;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


const extractKeyEntities = (text: string): DocumentAnalysisResult['keyEntities'] => {
  const datePattern = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g;
  const amountPattern = /\$\s*\d+[,.]?\d*|\d+[,.]\d{2}\s*(USD|EUR|GBP|INR|dollars?|rupees?)/gi;
  const namePattern = /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g;

  return {
    names: Array.from(text.matchAll(namePattern)).map(m => m[0]),
    dates: Array.from(text.matchAll(datePattern)).map(m => m[0]),
    amounts: Array.from(text.matchAll(amountPattern)).map(m => m[0]),
    locations: [],
  };
};
