// src/validation/sessionValidators.js
export const validateSessionState = (state) => {
    if (!state || typeof state !== 'object') return null;
    return {
      activePathway: state.activePathway,
      progress: state.progress || {},
      answers: state.answers || {},
      documents: Array.isArray(state.documents) ? state.documents : []
    };
  };