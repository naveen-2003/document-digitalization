import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { FieldForm } from './components/FieldForm';
import { DocumentSummary } from './components/DocumentSummary';
import { UserProfile } from './components/UserProfile';
import { ExportOptions } from './components/ExportOptions';
import { LanguageSelector } from './components/LanguageSelector';
import { LogOut, Settings, Home } from 'lucide-react';
import { supabase } from './lib/supabase';
import { processDocumentWithGoogleAI, DetectedField } from './services/documentAI';
import { generateDocumentSummary, generateFieldSuggestion, DocumentSummary as SummaryType } from './services/openai';

interface AppState {
  documentFile: File | null;
  previewUrl: string | null;
  detectedFields: DetectedField[];
  selectedFieldIndex: number;
  filledFields: Record<string, string>;
  summary: SummaryType | null;
  loading: boolean;
  error: string | null;
  language: string;
  showProfileModal: boolean;
  showExportModal: boolean;
  userProfile: any;
}

const AppContent = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [state, setState] = useState<AppState>({
    documentFile: null,
    previewUrl: null,
    detectedFields: [],
    selectedFieldIndex: 0,
    filledFields: {},
    summary: null,
    loading: false,
    error: null,
    language: 'en',
    showProfileModal: false,
    showExportModal: false,
    userProfile: null,
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setState(prev => ({ ...prev, userProfile: data, language: data.preferred_language || 'en' }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    setState(prev => ({ ...prev, documentFile: file, previewUrl: null, loading: true, error: null }));

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const previewUrl = e.target?.result as string;
        setState(prev => ({ ...prev, previewUrl }));

        try {
          const analysisResult = await processDocumentWithGoogleAI(file);

          let summary = null;
          try {
            summary = await generateDocumentSummary(
              analysisResult.extractedText,
              analysisResult.documentType,
              state.language
            );
          } catch (error) {
            console.log('Summary generation failed:', error);
          }

          const initialFilledFields: Record<string, string> = {};

          if (state.userProfile) {
            for (const field of analysisResult.detectedFields) {
              const suggestion = await generateFieldSuggestion(
                field.fieldType,
                field.label,
                state.userProfile
              );
              if (suggestion) {
                initialFilledFields[field.id] = suggestion;
              }
            }
          }

          setState(prev => ({
            ...prev,
            detectedFields: analysisResult.detectedFields,
            summary,
            filledFields: initialFilledFields,
            selectedFieldIndex: 0,
            loading: false,
          }));

          if (user) {
            await supabase
              .from('documents')
              .insert({
                user_id: user.id,
                file_name: file.name,
                file_path: `${user.id}/${Date.now()}-${file.name}`,
                file_type: file.type,
                file_size: file.size,
                status: 'completed',
              });

            const { data: docData } = await supabase
              .from('documents')
              .select('id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (docData) {
              await supabase
                .from('document_analysis')
                .insert({
                  document_id: docData.id,
                  user_id: user.id,
                  document_type: analysisResult.documentType,
                  confidence_score: analysisResult.confidence,
                  extracted_text: analysisResult.extractedText,
                  detected_fields: enhancedFields,
                  key_entities: analysisResult.keyEntities,
                  summary: summary?.summary || null,
                  language_detected: analysisResult.languageDetected,
                  processing_time: analysisResult.processingTime,
                });
            }
          }
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            loading: false,
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to read file',
        loading: false,
      }));
    }
  };

  const handleFieldValueChange = (value: string) => {
    setState(prev => ({
      ...prev,
      filledFields: {
        ...prev.filledFields,
        [prev.detectedFields[prev.selectedFieldIndex].id]: value,
      },
    }));
  };

  const handleFieldNext = () => {
    setState(prev => ({
      ...prev,
      selectedFieldIndex: Math.min(prev.selectedFieldIndex + 1, prev.detectedFields.length - 1),
    }));
  };

  const handleFieldPrevious = () => {
    setState(prev => ({
      ...prev,
      selectedFieldIndex: Math.max(prev.selectedFieldIndex - 1, 0),
    }));
  };

  const handleFieldClick = (field: DetectedField) => {
    const index = state.detectedFields.findIndex(f => f.id === field.id);
    if (index >= 0) {
      setState(prev => ({ ...prev, selectedFieldIndex: index }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Document Digitalization</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector
              currentLanguage={state.language}
              onChange={(lang) => setState(prev => ({ ...prev, language: lang }))}
            />
            <button
              onClick={() => setState(prev => ({ ...prev, showProfileModal: true }))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Profile"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {state.error}
          </div>
        )}

        {!state.previewUrl ? (
          <DocumentUpload onFileSelect={handleFileSelect} loading={state.loading} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DocumentViewer
                imageUrl={state.previewUrl}
                fields={state.detectedFields}
                onFieldClick={handleFieldClick}
                selectedField={
                  state.detectedFields[state.selectedFieldIndex] || null
                }
                filledFields={state.filledFields}
              />

              {state.summary && (
                <DocumentSummary
                  documentType={state.detectedFields.length > 0 ? 'Detected Form' : 'Unknown'}
                  summary={state.summary}
                  keyEntities={{
                    names: [],
                    dates: [],
                    amounts: [],
                    locations: [],
                  }}
                />
              )}
            </div>

            <div className="space-y-6">
              <FieldForm
                field={state.detectedFields[state.selectedFieldIndex] || null}
                value={
                  state.detectedFields[state.selectedFieldIndex]
                    ? state.filledFields[state.detectedFields[state.selectedFieldIndex].id] || ''
                    : ''
                }
                onValueChange={handleFieldValueChange}
                onSave={() => {}}
                onNext={handleFieldNext}
                onPrevious={handleFieldPrevious}
                currentIndex={state.selectedFieldIndex}
                totalFields={state.detectedFields.length}
                suggestion={
                  state.userProfile && state.detectedFields[state.selectedFieldIndex]
                    ? generateFieldSuggestion(
                        state.detectedFields[state.selectedFieldIndex].fieldType,
                        state.detectedFields[state.selectedFieldIndex].label,
                        state.userProfile
                      ).then(s => s)
                    : undefined
                }
              />

              <button
                onClick={() => setState(prev => ({ ...prev, showExportModal: true }))}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Export & Share
              </button>

              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  documentFile: null,
                  previewUrl: null,
                  detectedFields: [],
                  selectedFieldIndex: 0,
                  filledFields: {},
                  summary: null,
                }))}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Upload New Document
              </button>
            </div>
          </div>
        )}
      </div>

      {state.showProfileModal && (
        <UserProfile
          onClose={() => setState(prev => ({ ...prev, showProfileModal: false }))}
          onSave={(profile) => {
            setState(prev => ({ ...prev, userProfile: profile }));
            loadUserProfile();
          }}
        />
      )}

      {state.showExportModal && (
        <ExportOptions
          documentName={state.documentFile?.name || 'Document'}
          filledFields={state.filledFields}
          fields={state.detectedFields}
          onClose={() => setState(prev => ({ ...prev, showExportModal: false }))}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
