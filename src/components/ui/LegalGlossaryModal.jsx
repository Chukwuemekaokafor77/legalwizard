// src/components/ui/LegalGlossaryModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, ExternalLink, BookOpen } from 'lucide-react';

/**
 * Modal component for displaying legal term definitions
 * Can display a single term or the full glossary
 */
const LegalGlossaryModal = ({ term, glossary, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [activeTab, setActiveTab] = useState(term ? 'term' : 'all');
  
  // Initialize filtered terms based on search or selected term
  useEffect(() => {
    if (term && glossary[term]) {
      setFilteredTerms([{ key: term, ...glossary[term] }]);
    } else {
      const terms = Object.entries(glossary || {}).map(([key, value]) => ({
        key,
        ...value
      }));
      
      if (searchTerm) {
        setFilteredTerms(terms.filter(t => 
          t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.definition.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      } else {
        setFilteredTerms(terms);
      }
    }
  }, [term, glossary, searchTerm]);
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
// Get related terms
const getRelatedTerms = (termKey) => {
    const termData = glossary[termKey];
    if (!termData?.relatedTerms) return [];
    
    return termData.relatedTerms
      .filter(key => glossary[key])
      .map(key => ({ key, ...glossary[key] }));
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            {term ? `Legal Term: ${term}` : 'Legal Glossary'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {!term && (
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search legal terms..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {filteredTerms.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No matching terms found.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTerms.map(termData => (
                <div key={termData.key} className="term-card">
                  <h3 className="text-lg font-bold text-blue-700 mb-2">{termData.key}</h3>
                  <p className="mb-3">{termData.definition}</p>
                  
                  {termData.example && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <h4 className="font-medium mb-1">Example:</h4>
                      <p className="text-sm text-gray-700">{termData.example}</p>
                    </div>
                  )}
                  
                  {termData.reference && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Reference: </span>
                      {termData.reference}
                    </div>
                  )}
                  
                  {termData.relatedTerms && termData.relatedTerms.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-2">Related Terms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {getRelatedTerms(termData.key).map(related => (
                          <button
                            key={related.key}
                            onClick={() => {
                              setSearchTerm('');
                              setFilteredTerms([related]);
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100"
                          >
                            {related.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredTerms.length > 0 && (
              <>{filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} found</>
            )}
          </div>
          
          <a 
            href="https://www.justice.gc.ca/eng/csj-sjc/harmonization/bijurilex/terminology/index.html" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
          >
            <span>More legal resources</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LegalGlossaryModal;