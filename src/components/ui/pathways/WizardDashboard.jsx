import React from 'react';
import { CheckCircle, Clock, FileText, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';

const WizardDashboard = ({
  progress,
  currentStep,
  totalSteps,
  pathway,
  requiredDocuments,
  uploadedDocuments,
  completedSections,
  onNavigateToStep
}) => {
  // Document status checker
  const documentStatus = (docId) => ({
    uploaded: uploadedDocuments?.some(d => d.type === docId),
    required: requiredDocuments?.some(d => d.id === docId)
  });

  // Time estimation calculation
  const calculateTimeRemaining = () => {
    const baseMinutes = pathway?.estimatedTime?.match(/\d+/)?.[0] || 60;
    const remaining = Math.max(1, Math.round(baseMinutes * (1 - progress/100)));
    return `${remaining}min remaining`;
  };

  return (
    <div className="pathway-dashboard">
      <div className="dashboard-header">
        <BookOpen size={24} />
        <h3>{pathway?.title || 'Legal Pathway Progress'}</h3>
        <div className="time-estimate">
          <Clock size={18} />
          <span>{calculateTimeRemaining()}</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="circular-progress">
          <div className="progress-ring">
            <svg>
              <circle className="background" />
              <circle 
                className="progress" 
                style={{ strokeDashoffset: `calc(440 - (440 * ${progress}) / 100)` }}
              />
            </svg>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="step-indicators">
          {pathway?.formSections?.map((step, index) => (
            <button
              key={step.id}
              className={`step-item ${currentStep === index+1 ? 'active' : ''} ${completedSections.includes(step.id) ? 'completed' : ''}`}
              onClick={() => onNavigateToStep(index+1)}
            >
              <span className="step-marker">
                {completedSections.includes(step.id) ? (
                  <CheckCircle size={16} />
                ) : (
                  <span>{index+1}</span>
                )}
              </span>
              <span className="step-title">{step.title}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="document-status">
        <h4><FileText size={18} /> Required Documents</h4>
        <ul>
          {requiredDocuments?.map(doc => (
            <li 
              key={doc.id}
              className={`doc-item ${documentStatus(doc.id).uploaded ? 'uploaded' : 'missing'}`}
            >
              {documentStatus(doc.id).uploaded ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span>{doc.title}</span>
              {!documentStatus(doc.id).uploaded && (
                <span className="doc-alert">Required</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WizardDashboard;