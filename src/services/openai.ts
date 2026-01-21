import { DetectedField } from './documentAI';

export interface DocumentSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
}

export const generateDocumentSummary = async (
  extractedText: string,
  documentType: string,
  language: string = 'en'
): Promise<DocumentSummary> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert document analyzer. Respond in JSON only.',
          },
          {
            role: 'user',
            content: `Analyze this document and provide JSON response with summary, keyPoints array, actionItems array, and priority level. Text: ${extractedText.substring(0, 2000)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch {
      return {
        summary: content.substring(0, 200),
        keyPoints: [],
        actionItems: [],
        priority: 'medium',
      };
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

export const enhanceFieldDetection = async (
  extractedText: string,
  detectedFields: DetectedField[],
  documentType: string
): Promise<DetectedField[]> => {
  return detectedFields;
};

export const generateFieldSuggestion = async (
  fieldType: string,
  fieldLabel: string,
  userProfile: any
): Promise<string> => {
  if (!userProfile) return '';

  if (fieldLabel.toLowerCase().includes('name')) {
    return userProfile.full_name || '';
  }
  if (fieldLabel.toLowerCase().includes('email')) {
    return userProfile.email || '';
  }
  if (fieldLabel.toLowerCase().includes('phone')) {
    return userProfile.phone || '';
  }
  if (fieldLabel.toLowerCase().includes('address')) {
    return userProfile.address || '';
  }

  return '';
};
