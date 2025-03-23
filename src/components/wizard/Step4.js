// src/components/wizard/Step4.js
import React, { useCallback } from 'react';
import { 
  PathwayCard, 
  PathwayAlert,
  IntelligentDocumentUpload,
  DocumentStatusCard
} from '../ui/pathways';
import { FileText, Info, AlertCircle } from 'lucide-react';
import { DocumentValidationService } from '../../services';

const Step4 = ({ pathway, answers, onChange }) => {
  const docValidator = new DocumentValidationService(pathway);
  const [uploadErrors, setUploadErrors] = useState({});

  const handleUpload = useCallback(async (document) => {
    const validation = await docValidator.validateDocument(document);
    
    if (!validation.isValid) {
      setUploadErrors(prev => ({
        ...prev,
        [document.type]: validation.message
      }));
      return;
    }

    const newDocs = [...answers.documents, document];
    onChange({ documents: newDocs });
  }, [answers.documents, onChange]);

  return (
    <PathwayCard title="Document Portfolio" icon={FileText}>
      <div className="space-y-6">
        <PathwayAlert type="info">
          {pathway.documentGuidance || 'Upload required documents for your case'}
        </PathwayAlert>

        <div className="document-requirements">
          <h3 className="section-title">Required Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathway.documentRequirements
              .filter(doc => !doc.optional)
              .map(doc => (
                <IntelligentDocumentUpload
                  key={doc.id}
                  requirement={doc}
                  onUpload={handleUpload}
                  error={uploadErrors[doc.id]}
                />
              ))}
          </div>
        </div>

        {pathway.documentRequirements.some(doc => doc.optional) && (
          <div className="document-requirements">
            <h3 className="section-title">Optional Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pathway.documentRequirements
                .filter(doc => doc.optional)
                .map(doc => (
                  <IntelligentDocumentUpload
                    key={doc.id}
                    requirement={doc}
                    onUpload={handleUpload}
                  />
                ))}
            </div>
          </div>
        )}

        <DocumentStatusCard 
          documents={answers.documents}
          requirements={pathway.documentRequirements}
        />

        {Object.keys(uploadErrors).length > 0 && (
          <PathwayAlert type="error">
            <div className="space-y-2">
              {Object.entries(uploadErrors).map(([docType, error]) => (
                <div key={docType} className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{docType}: {error}</span>
                </div>
              ))}
            </div>
          </PathwayAlert>
        )}
      </div>
    </PathwayCard>
  );
};

export default Step4;