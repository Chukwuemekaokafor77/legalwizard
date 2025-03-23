// src/components/ui/pathways/EnhancedPathwayWizard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import StepWizard from "react-step-wizard";

// Import existing components
import WizardNavigation from './WizardNavigation';
import WizardDashboard from './WizardDashboard';
import LegalTermTooltip from './LegalTermTooltip';
import LegalDisclaimer from './LegalDisclaimer';
import UserSessionBanner from './UserSessionBanner';
import PathwayHelpModal from './PathwayHelpModal';
import DocumentChecklist from './DocumentChecklist';

// Pathway Steps
import JurisdictionStep from '../../pathways/JurisdictionStep';
import CaseTypeStep from '../../pathways/CaseTypeStep';
import DocumentUploadStep from '../../pathways/DocumentUploadStep';
import ReviewSubmitStep from '../../pathways/ReviewSubmitStep';
import FormDeliveryStep from '../../pathways/FormDeliveryStep';

// New components
import DocumentRequirementsIntro from '../../pathways/DocumentRequirementsIntro';

// Services
import { PathwayService } from '../../../services/pathways/PathwayService';
import { FormAssemblyService } from '../../../services/pathways/FormAssemblyService';
import { DocumentAnalysisService } from '../../../services/pathways/DocumentAnalysisService';
import { UserSessionService } from '../../../services/UserSessionService';

// Hooks
import usePathwaySession from '../../../hooks/usePathwaySession';

const PATHWAY_SESSION_TIMEOUT = 14400; // 4 hours

// Reducer for pathway state
const pathwayReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_PATHWAY':
      return {
        ...state,
        activePathway: action.payload,
        progress: {
          currentSection: 0,
          completedSteps: [],
          percentageComplete: 0,
          requiredDocsSubmitted: false
        }
      };
    case 'UPDATE_ANSWERS':
      return { ...state, answers: { ...state.answers, ...action.payload } };
    case 'UPDATE_DOCUMENTS':
      return { ...state, documents: [...state.documents, ...action.payload] };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: { ...state.progress, ...action.payload } };
    case 'RESET_SESSION':
      return {
        activePathway: null,
        progress: {
          currentSection: 0,
          completedSteps: [],
          percentageComplete: 0,
          requiredDocsSubmitted: false
        },
        answers: {},
        documents: [],
        generatedForms: [],
        selectedCourt: null,
        helpContent: null,
        validationErrors: {},
        isGuest: true
      };
    default:
      return state;
  }
};

const EnhancedPathwayWizard = ({ pathwayId, onNavigate }) => {
  const [pathwayState, dispatch] = React.useReducer(pathwayReducer, {
    activePathway: null,
    progress: {
      currentSection: 0,
      completedSteps: [],
      percentageComplete: 0,
      requiredDocsSubmitted: false
    },
    answers: {},
    documents: [],
    generatedForms: [],
    selectedCourt: null,
    helpContent: null,
    validationErrors: {},
    isGuest: true
  });
  
  const { sessionTimeRemaining, restartSession } = usePathwaySession({
    timeout: PATHWAY_SESSION_TIMEOUT,
    onExpire: () => {
      dispatch({ type: 'RESET_SESSION' });
      alert('Session expired. Please start a new session.');
      onNavigate('/');
    }
  });

  const pathwayManager = useMemo(() => new PathwayService(), []);
  const documentAnalyzer = useMemo(() => new DocumentAnalysisService(), []);
  const formAssembler = useMemo(() => new FormAssemblyService(), []);

  // Initialize pathway
  useEffect(() => {
    const loadPathway = () => {
      if (pathwayId) {
        const pathway = pathwayManager.getPathwayConfig(pathwayId);
        if (pathway) {
          dispatch({ 
            type: 'INIT_PATHWAY', 
            payload: pathway 
          });
          restartSession();
        }
      }
    };
    
    loadPathway();
  }, [pathwayId, pathwayManager, restartSession]);

  // Load saved progress for non-guest users
  useEffect(() => {
    const loadProgress = async () => {
      if (!pathwayState.isGuest) {
        try {
          const savedState = await UserSessionService.loadPathwayState();
          if (savedState && savedState.activePathway?.id === pathwayId) {
            dispatch({ type: 'INIT_PATHWAY', payload: savedState.activePathway });
            dispatch({ type: 'UPDATE_ANSWERS', payload: savedState.answers || {} });
            dispatch({ type: 'UPDATE_DOCUMENTS', payload: savedState.documents || [] });
            dispatch({ 
              type: 'UPDATE_PROGRESS', 
              payload: savedState.progress || {
                currentSection: 0,
                completedSteps: [],
                percentageComplete: 0,
                requiredDocsSubmitted: false
              }
            });
          }
        } catch (error) {
          console.error('Error loading saved progress:', error);
        }
      }
    };
    
    loadProgress();
  }, [pathwayState.isGuest, pathwayId]);

  // Auto-save functionality
  const autoSaveProgress = useCallback(async () => {
    if (!pathwayState.isGuest && pathwayState.activePathway) {
      await UserSessionService.saveTemporaryState({
        pathway: pathwayState.activePathway.id,
        progress: pathwayState.progress,
        answers: pathwayState.answers,
        documents: pathwayState.documents
      });
    }
  }, [pathwayState.isGuest, pathwayState.activePathway, pathwayState.answers, 
      pathwayState.documents, pathwayState.progress]);

  // Set up auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveProgress();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [autoSaveProgress]);

  // Handle form updates
  const handleFormUpdate = useCallback((sectionId, values) => {
    dispatch({ 
      type: 'UPDATE_ANSWERS', 
      payload: { [sectionId]: values } 
    });
    
    // Update progress
    const completedSteps = [...pathwayState.progress.completedSteps, sectionId];
    const percentageComplete = Math.round(
      (completedSteps.length / pathwayState.activePathway.steps.length) * 100
    );
    
    dispatch({ 
      type: 'UPDATE_PROGRESS', 
      payload: { completedSteps, percentageComplete } 
    });
  }, [pathwayState.progress.completedSteps, pathwayState.activePathway]);

  // Handle document analysis
  const handleDocumentAnalysis = useCallback(async (file) => {
    try {
      const analysis = await documentAnalyzer.processDocument(file);
      
      dispatch({ 
        type: 'UPDATE_DOCUMENTS', 
        payload: [{
          file,
          name: file.name,
          size: file.size,
          type: determineDocumentType(file, analysis),
          uploadedAt: new Date(),
          analysis
        }]
      });
      
      // Auto-fill forms based on document analysis
      const autoFilled = formAssembler.mapDocumentToForms(
        analysis, 
        pathwayState.activePathway?.formTemplates
      );
      
      dispatch({ 
        type: 'UPDATE_ANSWERS', 
        payload: autoFilled 
      });
      
      // Check if all required documents are submitted
      const required = pathwayState.activePathway?.documentRequirements || [];
      const complete = required
        .filter(req => !req.optional)
        .every(req => 
          pathwayState.documents.some(d => d.type === req.id)
        );
      
      dispatch({ 
        type: 'UPDATE_PROGRESS', 
        payload: { requiredDocsSubmitted: complete } 
      });
    } catch (error) {
      console.error('Document analysis failed:', error);
    }
  }, [documentAnalyzer, formAssembler, pathwayState.activePathway, pathwayState.documents]);

  // Determine document type based on analysis
  const determineDocumentType = (file, analysis) => {
    // Try to determine document type from analysis
    if (analysis && analysis.documentType) {
      return analysis.documentType;
    }
    
    // Fallback to checking file name patterns
    const fileName = file.name.toLowerCase();
    const requiredDocs = pathwayState.activePathway?.documentRequirements || [];
    
    // Check for document types in filename
    for (const doc of requiredDocs) {
      const keywords = doc.fileNameKeywords || [];
      if (keywords.some(keyword => fileName.includes(keyword.toLowerCase()))) {
        return doc.id;
      }
    }
    
    // Default to generic document type
    return 'generic_document';
  };

  // Generate final forms
  const handleFormFinalize = useCallback(async () => {
    try {
      const forms = await formAssembler.generateDocuments(
        pathwayState.answers,
        pathwayState.activePathway.formTemplates
      );
      
      dispatch({ 
        type: 'UPDATE_PROGRESS', 
        payload: { generatedForms: forms } 
      });
      
      // Navigate to delivery step
      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: { currentSection: pathwayState.activePathway.steps.length - 1 }
      });
    } catch (error) {
      console.error('Form generation failed:', error);
      alert('Failed to generate documents. Please check your inputs.');
    }
  }, [formAssembler, pathwayState.answers, pathwayState.activePathway]);

  // Render wizard steps with our components
  const renderPathwaySteps = () => (
    <StepWizard
      isHashEnabled
      nav={<WizardNavigation 
        currentStep={pathwayState.progress.currentSection}
        totalSteps={pathwayState.activePathway?.steps?.length || 0}
        onNext={() => dispatch({ 
          type: 'UPDATE_PROGRESS', 
          payload: { currentSection: pathwayState.progress.currentSection + 1 }
        })}
        onPrevious={() => dispatch({ 
          type: 'UPDATE_PROGRESS', 
          payload: { currentSection: Math.max(0, pathwayState.progress.currentSection - 1) }
        })}
        onSave={autoSaveProgress}
      />}
    >
      <DocumentRequirementsIntro
        key="requirements-intro"
        pathway={pathwayState.activePathway}
        onContinue={() => dispatch({ 
          type: 'UPDATE_PROGRESS', 
          payload: { currentSection: 1 }
        })}
      />
      
      <JurisdictionStep 
        key="jurisdiction"
        pathway={pathwayState.activePathway}
        answers={pathwayState.answers.jurisdiction || {}}
        onUpdate={(values) => handleFormUpdate('jurisdiction', values)}
        legalTermsComponent={LegalTermTooltip}
      />
      
      <CaseTypeStep 
        key="case-type"
        pathway={pathwayState.activePathway}
        answers={pathwayState.answers.caseType || {}}
        onUpdate={(values) => handleFormUpdate('caseType', values)}
        legalTermsComponent={LegalTermTooltip}
      />
      
      <DocumentUploadStep 
        key="documents"
        pathway={pathwayState.activePathway}
        documents={pathwayState.documents}
        onUpload={handleDocumentAnalysis}
        requirements={pathwayState.activePathway?.documentRequirements}
        checklistComponent={DocumentChecklist}
      />
      
      <ReviewSubmitStep 
        key="review"
        pathway={pathwayState.activePathway}
        answers={pathwayState.answers}
        documents={pathwayState.documents}
        onFinalize={handleFormFinalize}
      />
      
      <FormDeliveryStep 
        key="delivery"
        pathway={pathwayState.activePathway}
        forms={pathwayState.generatedForms}
        courtInfo={pathwayState.selectedCourt}
      />
    </StepWizard>
  );

  if (!pathwayState.activePathway) {
    return <div className="loading-spinner">Loading pathway...</div>;
  }

  return (
    <div className="pathway-wizard-container">
      {/* Session Banner */}
      <UserSessionBanner
        isGuest={pathwayState.isGuest}
        timeRemaining={sessionTimeRemaining}
        onExtendSession={restartSession}
      />
      
      <div className="pathway-wizard">
        {/* Progress Dashboard */}
        <WizardDashboard
          pathway={pathwayState.activePathway}
          progress={pathwayState.progress}
          documents={pathwayState.documents}
        />
        
        {/* Main Wizard Steps */}
        {pathwayState.activePathway && renderPathwaySteps()}
        
        {/* Help Modal */}
        {pathwayState.helpContent && (
          <PathwayHelpModal
            content={pathwayState.helpContent}
            onClose={() => dispatch({
              type: 'UPDATE_PROGRESS',
              payload: { helpContent: null }
            })}
          />
        )}
        
        {/* Legal Disclaimer */}
        <LegalDisclaimer />
      </div>
    </div>
  );
};

export default EnhancedPathwayWizard;