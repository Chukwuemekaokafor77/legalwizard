// src/components/wizard/ReviewStep.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PathwayService, 
  DocumentValidationService,
  FormAssemblyService 
} from '../../services';
import {
  Alert,
  ProgressStatus,
  LegalTermTooltip,
  DocumentStatusCard,
  JurisdictionInfoCard
} from '../ui';
import {
  User,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  ChevronDown,
  ChevronUp,
  Scale,
  Banknote,
  ClipboardCheck
} from 'lucide-react';

const ReviewStep = ({
  pathway,
  answers,
  documents,
  forms,
  onSubmit,
  onEdit,
  isLoading,
  onValidationError,
  courtInfo
}) => {
  const [validationState, setValidationState] = useState({
    isValid: false,
    errors: [],
    warnings: []
  });
  
  const [expandedForms, setExpandedForms] = useState({});
  const pathwayService = new PathwayService();
  const docValidator = new DocumentValidationService(pathwayService);

  // Dynamic validation based on pathway
  const validateSubmission = useMemo(() => {
    const errors = [];
    const warnings = [];

    // 1. Validate required fields
    pathway.formSections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required && !answers[section.id]?.[field.id]) {
          errors.push(`${field.label} (${section.title})`);
        }
      });
    });

    // 2. Validate documents
    const docValidation = docValidator.validateDocuments(documents, pathway.id);
    errors.push(...docValidation.missing.map(d => `${d} required`));
    warnings.push(...docValidation.invalid.map(d => `${d} issues`));

    // 3. Jurisdiction-specific rules
    const jurisdictionValid = pathwayService.validateJurisdictionCompliance(
      answers.jurisdiction, 
      pathway.id,
      answers
    );
    if (!jurisdictionValid.isValid) {
      errors.push(...jurisdictionValid.errors);
    }

    const isValid = errors.length === 0;
    setValidationState({ isValid, errors, warnings });
    return isValid;
  }, [pathway, answers, documents]);

  // Form preview generation
  const generateFormPreviews = () => {
    const formAssembler = new FormAssemblyService();
    return forms.map(form => ({
      ...form,
      preview: formAssembler.generatePreview(form, answers)
    }));
  };

  // Document status
  const documentStatus = (docId) => {
    return documents.some(d => d.type === docId) ? 'valid' : 'missing';
  };

  // Toggle form expansion
  const toggleForm = (formId) => {
    setExpandedForms(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }));
  };

  return (
    <div className="pathway-review">
      <div className="review-header">
        <h2><ClipboardCheck size={24} /> Final Review</h2>
        <div className="flex items-center gap-4">
          <ProgressStatus 
            percentage={calculateProgress()} 
            label="Completion" 
          />
          <div className="text-sm text-gray-600">
            <Clock size={16} />
            Estimated processing: {pathway.estimatedTime}
          </div>
        </div>
      </div>

      {/* Validation Alerts */}
      {!validationState.isValid && (
        <Alert variant="critical" className="mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} />
            <div>
              <h4>Application Issues Detected</h4>
              <ul className="list-disc pl-5">
                {validationState.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {validationState.warnings.map((warning, i) => (
                  <li key={`warn-${i}`} className="text-yellow-700">{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </Alert>
      )}

      {/* Application Summary */}
      <div className="review-grid">
        {/* Personal Information */}
        <section className="review-section">
          <div className="section-header">
            <h3><User size={20} /> Applicant Details</h3>
            <button onClick={() => onEdit('personal')} className="edit-btn">
              <Edit size={16} /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Full Name" value={answers.fullName} />
            <InfoItem label="Date of Birth" value={answers.dateOfBirth} type="date" />
            <InfoItem label="Email" value={answers.email} type="email" />
            <InfoItem label="Phone" value={answers.phone} type="phone" />
          </div>
        </section>

        {/* Case Information */}
        <section className="review-section">
          <div className="section-header">
            <h3><Briefcase size={20} /> Case Details</h3>
            <button onClick={() => onEdit('case')} className="edit-btn">
              <Edit size={16} /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Jurisdiction" value={answers.jurisdiction} />
            <InfoItem label="Case Type" value={pathway.title} />
            <InfoItem label="Filing Court" value={courtInfo?.name} />
            <InfoItem label="Case Number" value={answers.caseNumber || 'New Filing'} />
          </div>
        </section>

        {/* Documents */}
        <section className="review-section">
          <div className="section-header">
            <h3><FileText size={20} /> Document Portfolio</h3>
            <ProgressStatus 
              percentage={calculateDocumentProgress()}
              label="Documents"
            />
          </div>
          <DocumentStatusCard 
            requirements={pathway.documentRequirements}
            documents={documents}
            onNavigate={onEdit}
          />
        </section>

        {/* Forms Preview */}
        <section className="review-section">
          <div className="section-header">
            <h3><Scale size={20} /> Court Forms</h3>
            <span className="text-sm text-gray-600">
              {forms.length} forms generated
            </span>
          </div>
          <div className="space-y-3">
            {generateFormPreviews().map(form => (
              <FormPreview
                key={form.id}
                form={form}
                isExpanded={expandedForms[form.id]}
                onToggle={() => toggleForm(form.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Submission Panel */}
      <div className="submission-panel">
        <div className="submission-info">
          <div className="flex items-center gap-4">
            <Banknote size={24} />
            <span>Estimated Fee: {courtInfo?.fees || 'Calculating...'}</span>
          </div>
          <JurisdictionInfoCard info={courtInfo} />
        </div>
        
        <button
          onClick={onSubmit}
          disabled={!validationState.isValid || isLoading}
          className="submit-button"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <FileText size={20} />
          )}
          {isLoading ? 'Finalizing Submission...' : `Submit to ${courtInfo?.name}`}
        </button>
      </div>

      <LegalTermTooltip 
        terms={pathway.glossary} 
        context="review" 
      />
    </div>
  );
};

// Helper components
const InfoItem = ({ label, value, type = 'text' }) => {
  const formatValue = () => {
    if (!value) return 'Not provided';
    if (type === 'date') return new Date(value).toLocaleDateString();
    if (type === 'phone') return formatPhoneNumber(value);
    return value;
  };

  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">{formatValue()}</span>
    </div>
  );
};

const FormPreview = ({ form, isExpanded, onToggle }) => (
  <div className="form-preview">
    <div className="preview-header">
      <div className="flex items-center gap-3">
        <FileText size={18} />
        <span>{form.name} (Form {form.number})</span>
      </div>
      <button onClick={onToggle} className="toggle-btn">
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>
    </div>
    {isExpanded && (
      <div className="preview-content">
        <table>
          <tbody>
            {Object.entries(form.preview).map(([field, value]) => (
              <tr key={field}>
                <td>{field}</td>
                <td>{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default ReviewStep;