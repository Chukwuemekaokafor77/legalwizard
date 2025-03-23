// src/components/pathways/DocumentRequirementsChecklist.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Check, AlertCircle, Info, Download, ExternalLink } from 'lucide-react';

/**
 * Component to display document requirements as a checklist with details and templates
 */
const DocumentRequirementsChecklist = ({ 
  pathway, 
  onStatusChange, 
  documents = [], 
  showTemplates = true 
}) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedItem, setExpandedItem] = useState(null);
  
  // Reset checklist when pathway changes
  useEffect(() => {
    setCheckedItems({});
    setExpandedItem(null);
  }, [pathway?.id]);
  
  // Check existing documents
  useEffect(() => {
    if (documents.length > 0) {
      const newCheckedItems = { ...checkedItems };
      
      documents.forEach(doc => {
        const matchingRequirement = pathway?.documentRequirements?.find(req => 
          req.id === doc.type || (doc.analysis && doc.analysis.documentType === req.id)
        );
        
        if (matchingRequirement) {
          newCheckedItems[matchingRequirement.id] = true;
        }
      });
      
      setCheckedItems(newCheckedItems);
    }
  }, [documents, pathway]);
  
  // Calculate completion status
  useEffect(() => {
    if (pathway?.documentRequirements) {
      const requiredDocs = pathway.documentRequirements.filter(req => !req.optional);
      const requiredComplete = requiredDocs.every(req => checkedItems[req.id]);
      const totalComplete = pathway.documentRequirements.filter(req => checkedItems[req.id]).length;
      
      onStatusChange?.({
        isComplete: requiredComplete,
        completedCount: totalComplete,
        totalCount: pathway.documentRequirements.length,
        requiredCount: requiredDocs.length
      });
    }
  }, [checkedItems, pathway, onStatusChange]);
  
  // Toggle checkbox
  const handleCheck = (docId) => {
    setCheckedItems(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };
  
  // Toggle expanded details
  const toggleDetails = (docId) => {
    setExpandedItem(expandedItem === docId ? null : docId);
  };
  
  // Generate download link for template
  const getTemplateLink = (doc) => {
    if (!doc.templateLink) return null;
    
    return (
      <a 
        href={doc.templateLink}
        download={`Template-${doc.title}.pdf`}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mr-3"
      >
        <Download className="w-3.5 h-3.5 mr-1" />
        <span>Template</span>
      </a>
    );
  };
  
  // Generate sample link
  const getSampleLink = (doc) => {
    if (!doc.sampleLink) return null;
    
    return (
      <a 
        href={doc.sampleLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        <ExternalLink className="w-3.5 h-3.5 mr-1" />
        <span>Sample</span>
      </a>
    );
  };
  
  if (!pathway?.documentRequirements) {
    return (
      <div className="text-center p-4">
        <p>No document requirements specified for this pathway.</p>
      </div>
    );
  }
  
  return (
    <div className="document-requirements-checklist">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          Document Checklist
        </h3>
        <p className="text-sm text-gray-600">
          Check off each document as you prepare it. Required documents must be ready before proceeding.
        </p>
      </div>
      
      <div className="space-y-3">
        {pathway.documentRequirements.map(doc => {
          const isChecked = checkedItems[doc.id] || false;
          const isExpanded = expandedItem === doc.id;
          const hasDetails = doc.description || doc.requirements || doc.notes;
          const hasTemplates = showTemplates && (doc.templateLink || doc.sampleLink);
          
          return (
            <div 
              key={doc.id} 
              className={`
                border rounded-lg overflow-hidden transition-colors duration-200
                ${isChecked ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}
              `}
            >
              <div className="p-3 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    id={`doc-${doc.id}`}
                    checked={isChecked}
                    onChange={() => handleCheck(doc.id)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <label 
                      htmlFor={`doc-${doc.id}`} 
                      className="font-medium text-gray-900 cursor-pointer"
                    >
                      {doc.title}
                      {!doc.optional && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    
                    <div className="flex-shrink-0">
                      {isChecked ? (
                        <div className="flex items-center text-green-600">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : !doc.optional && (
                        <div className="text-sm text-amber-600 whitespace-nowrap">
                          Required
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {doc.description}
                    </p>
                  )}
                  
                  {(hasDetails || hasTemplates) && (
                    <button
                      onClick={() => toggleDetails(doc.id)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Info className="w-3.5 h-3.5 mr-1" />
                      <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
                    </button>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 ml-8 border-t border-gray-100">
                  {doc.requirements && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Requirements:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-0.5">
                        {doc.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {doc.notes && (
                    <div className="mb-3 bg-blue-50 p-2 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">{doc.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {hasTemplates && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        {getTemplateLink(doc)}
                        {getSampleLink(doc)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          <span className="text-red-500">*</span> Required document
        </div>
        
        <div>
          {Object.values(checkedItems).filter(Boolean).length} of {pathway.documentRequirements.length} ready
        </div>
      </div>
    </div>
  );
};

export default DocumentRequirementsChecklist;