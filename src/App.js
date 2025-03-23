import React, { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import StepWizard from "react-step-wizard";
import EnhancedPathwayWizard from './components/ui/pathways/EnhancedPathwayWizard';

// Components
import { ThemeProvider } from './components/ui/Theme';
import { DynamicFormAssistant } from './components/assistant/DynamicFormAssistant';
import { IntelligentDocumentUpload } from './components/documents/IntelligentDocumentUpload';
import WizardNavigation from './components/ui/pathways/WizardNavigation';
import WizardDashboard from './components/ui/pathways/WizardDashboard';
import PathwaySelection from './components/pathways/PathwaySelection';
import JurisdictionStep from './components/pathways/JurisdictionStep';
import CaseTypeStep from './components/pathways/CaseTypeStep';
import DocumentUploadStep from './components/pathways/DocumentUploadStep';
import ReviewSubmitStep from './components/pathways/ReviewSubmitStep';
import FormDeliveryStep from './components/pathways/FormDeliveryStep';
import LegalTermTooltip from './components/ui/pathways/LegalTermTooltip';
import LegalDisclaimer from './components/ui/pathways/LegalDisclaimer';
import UserSessionBanner from './components/ui/pathways/UserSessionBanner';
import PathwayHelpModal from './components/ui/pathways/PathwayHelpModal';
import DocumentChecklist from './components/ui/pathways/DocumentChecklist';

// Services
import { PathwayService } from './services/pathways/PathwayService';
import { FormAssemblyService } from './services/pathways/FormAssemblyService';
import { DocumentAnalysisService } from './services/pathways/DocumentAnalysisService';
import { UserSessionService } from './services/UserSessionService';

// Data and Hooks
import { familyLawPathways } from './data/pathwayConfigurations';
import usePathwaySession from './hooks/usePathwaySession';
import "./PathwayStyles.css";

const PATHWAY_SESSION_TIMEOUT = 14400; // 4 hours

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
      return initialState;
    default:
      return state;
  }
};

const initialState = {
  activePathway: null,
  progress: {},
  answers: {},
  documents: [],
  generatedForms: [],
  selectedCourt: null
};

const App = () => {
  const [state, dispatch] = useReducer(pathwayReducer, initialState);
  const [sessionStatus, setSessionStatus] = useState('new');
  const [helpContent, setHelpContent] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  
  const navigate = useNavigate();
  const { pathwayId } = useParams();
  const { sessionTimeRemaining, restartSession } = usePathwaySession({
    timeout: PATHWAY_SESSION_TIMEOUT,
    onExpire: () => {
      dispatch({ type: 'RESET_SESSION' });
      setSessionStatus('expired');
      alert('Session expired. Please start a new session.');
      navigate('/');
    }
  });

  const pathwayManager = useMemo(() => new PathwayService(familyLawPathways), []);
  const documentAnalyzer = useMemo(() => new DocumentAnalysisService(), []);
  const formAssembler = useMemo(() => new FormAssemblyService(), []);

  useEffect(() => {
    const loadProgress = async () => {
      if (!isGuest) {
        const savedState = await UserSessionService.loadPathwayState();
        if (savedState) {
          dispatch({ type: 'INIT_PATHWAY', payload: savedState.activePathway });
          dispatch({ type: 'UPDATE_ANSWERS', payload: savedState.answers });
          dispatch({ type: 'UPDATE_DOCUMENTS', payload: savedState.documents });
          setSessionStatus('resumed');
        }
      }
    };
    loadProgress();
  }, [isGuest]);

  useEffect(() => {
    if (pathwayId) {
      const pathway = pathwayManager.getPathwayConfig(pathwayId);
      if (pathway) {
        dispatch({ type: 'INIT_PATHWAY', payload: pathway });
        restartSession();
      }
    }
  }, [pathwayId, pathwayManager, restartSession]);

  const handleFormUpdate = useCallback((sectionId, values) => {
    dispatch({ type: 'UPDATE_ANSWERS', payload: { [sectionId]: values } });
    const completedSteps = [...state.progress.completedSteps, sectionId];
    const percentageComplete = Math.round((completedSteps.length / state.activePathway.steps.length) * 100);
    dispatch({ type: 'UPDATE_PROGRESS', payload: { completedSteps, percentageComplete } });
  }, [state.progress.completedSteps, state.activePathway]);

  const handleDocumentAnalysis = useCallback(async (file) => {
    const analysis = await documentAnalyzer.processDocument(file);
    dispatch({ type: 'UPDATE_DOCUMENTS', payload: [file] });
    const autoFilled = formAssembler.mapDocumentToForms(analysis, state.activePathway?.formTemplates);
    dispatch({ type: 'UPDATE_ANSWERS', payload: autoFilled });
    const required = state.activePathway?.documentRequirements || [];
    const complete = required.every(req => state.documents.some(d => d.type === req.id));
    dispatch({ type: 'UPDATE_PROGRESS', payload: { requiredDocsSubmitted: complete } });
  }, [documentAnalyzer, formAssembler, state.activePathway, state.documents]);

  const autoSaveProgress = useCallback(async () => {
    if (!isGuest && state.activePathway) {
      await UserSessionService.saveTemporaryState({
        pathway: state.activePathway.id,
        progress: state.progress,
        answers: state.answers,
        documents: state.documents
      });
    }
  }, [isGuest, state]);

  const handleFormFinalize = useCallback(async () => {
    try {
      const forms = await formAssembler.generateDocuments(
        state.answers,
        state.activePathway.formTemplates
      );
      dispatch({ type: 'UPDATE_PROGRESS', payload: { generatedForms: forms } });
      navigate(`/pathways/${state.activePathway.id}/delivery`);
    } catch (error) {
      console.error('Form generation failed:', error);
      alert('Failed to generate documents. Please check your inputs.');
    }
  }, [formAssembler, state, navigate]);

  const renderPathwaySteps = () => (
    <StepWizard
      isHashEnabled
      nav={<WizardNavigation 
        currentStep={state.progress.currentSection}
        totalSteps={state.activePathway?.steps?.length || 0}
        onNext={() => dispatch({ type: 'UPDATE_PROGRESS', payload: { currentSection: prev => prev + 1 }})}
        onPrevious={() => dispatch({ type: 'UPDATE_PROGRESS', payload: { currentSection: prev => Math.max(0, prev - 1) }})}
        onSave={autoSaveProgress}
      />}
    >
      <JurisdictionStep 
        key="jurisdiction"
        onUpdate={handleFormUpdate}
        legalTermsComponent={LegalTermTooltip}
      />
      <CaseTypeStep 
        key="case-type"
        onUpdate={handleFormUpdate}
        legalTermsComponent={LegalTermTooltip}
      />
      <DocumentUploadStep 
        key="documents"
        onUpload={handleDocumentAnalysis}
        requirements={state.activePathway?.documentRequirements}
        checklistComponent={DocumentChecklist}
      />
      <ReviewSubmitStep 
        key="review"
        answers={state.answers}
        documents={state.documents}
        onFinalize={handleFormFinalize}
      />
      <FormDeliveryStep 
        key="delivery"
        forms={state.generatedForms}
        courtInfo={state.selectedCourt}
      />
    </StepWizard>
  );

  return (
    <Router>
      <ThemeProvider theme="legalPathway">
        <div className="pathway-container">
          <UserSessionBanner 
            isGuest={isGuest}
            timeRemaining={sessionTimeRemaining}
            onExtendSession={restartSession}
          />
          
          <Routes>
            <Route path="/" element={
              <PathwaySelection 
                pathways={familyLawPathways}
                onSelectPathway={(id) => navigate(`/pathways/${id}`)}
              />
            }/>

            <Route path="/pathways/:pathwayId" element={
              <div className="pathway-wizard">
                <WizardDashboard
                  pathway={state.activePathway}
                  progress={state.progress}
                  documents={state.documents}
                />
                
                {state.activePathway && renderPathwaySteps()}
                
                <PathwayHelpModal 
                  content={helpContent}
                  onClose={() => setHelpContent(null)}
                />
                <LegalDisclaimer />
              </div>
            }/>

            <Route path="*" element={
              <div className="error-page">
                <h2>Page Not Found</h2>
                <button onClick={() => navigate('/')}>
                  Return to Pathway Selection
                </button>
              </div>
            }/>
          </Routes>

          <DynamicFormAssistant 
            answers={state.answers}
            pathway={state.activePathway}
            onSuggestionApply={handleFormUpdate}
          />
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;