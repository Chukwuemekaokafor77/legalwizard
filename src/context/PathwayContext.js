import React, { createContext, useContext, useReducer } from 'react';

const PathwayContext = createContext();

const pathwayReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_PATHWAY':
      return {
        ...state,
        activePathway: action.payload,
        progress: { /* initial progress state */ }
      };
    // Add other cases
    default:
      return state;
  }
};

export const PathwayProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pathwayReducer, {
    activePathway: null,
    progress: {},
    answers: {},
    documents: [],
    generatedForms: []
  });

  return (
    <PathwayContext.Provider value={{ state, dispatch }}>
      {children}
    </PathwayContext.Provider>
  );
};

export const usePathway = () => {
  const context = useContext(PathwayContext);
  if (!context) {
    throw new Error('usePathway must be used within a PathwayProvider');
  }
  return context;
};