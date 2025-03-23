// src/components/wizard/Step5.js
import React from 'react';
import { 
  PathwayCard,
  PathwaySection,
  DocumentStatusCard,
  InfoPanel
} from '../ui/pathways';
import { Briefcase, User, FileText } from 'lucide-react';

const Step5 = ({ pathway, answers, onNavigate }) => {
  const renderSection = (section) => (
    <PathwaySection
      key={section.id}
      title={section.title}
      icon={section.icon}
      onEdit={() => onNavigate(section.editStep)}
    >
      <div className="form-review-grid">
        {section.fields.map(field => (
          <div key={field.id} className="form-field-review">
            <label>{field.label}</label>
            <div>{answers[section.id]?.[field.id] || 'Not provided'}</div>
          </div>
        ))}
      </div>
    </PathwaySection>
  );

  return (
    <PathwayCard title="Case Review" icon={Briefcase}>
      <div className="space-y-6">
        <InfoPanel type="warning">
          Please verify all information before submission. Incorrect information may delay processing.
        </InfoPanel>

        {pathway.formSections.map(renderSection)}

        <DocumentStatusCard 
          documents={answers.documents}
          requirements={pathway.documentRequirements}
        />

        <PathwaySection title="Final Verification" icon={FileText}>
          <div className="verification-checklist">
            {pathway.verificationSteps.map((step, i) => (
              <label key={i} className="verification-item">
                <input type="checkbox" required />
                <span>{step}</span>
              </label>
            ))}
          </div>
        </PathwaySection>
      </div>
    </PathwayCard>
  );
};

export default Step5;