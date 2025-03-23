// src/components/pathways/DocumentRequirementsIntro.jsx
import React from 'react';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Introduction component for document requirements
 * Displays an overview of required documents before proceeding
 */
const DocumentRequirementsIntro = ({ 
  pathway, 
  onContinue 
}) => {
  return (
    <div className="document-requirements-intro">
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-blue-500" />
          <h2 className="text-xl font-semibold">Document Requirements</h2>
        </div>

        <p className="mb-6 text-gray-600">
          Before proceeding with your {pathway?.title || 'application'}, please make sure you have the following documents ready to upload.
        </p>

        <div className="space-y-4 mb-6">
          <h3 className="font-medium">Required Documents:</h3>
          <ul className="space-y-3">
            {pathway?.documentRequirements
              ?.filter(doc => !doc.optional)
              ?.map(doc => (
                <li key={doc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    )}
                  </div>
                </li>
              ))}
          </ul>

          {pathway?.documentRequirements?.some(doc => doc.optional) && (
            <>
              <h3 className="font-medium mt-6">Optional Documents:</h3>
              <ul className="space-y-3">
                {pathway?.documentRequirements
                  ?.filter(doc => doc.optional)
                  ?.map(doc => (
                    <li key={doc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-700">
              <p className="font-medium">Important Information</p>
              <p className="text-sm mt-1">
                Our system can analyze your documents to pre-fill some of your application information. 
                Make sure documents are clear, complete, and in one of the accepted formats (PDF, JPG, or PNG).
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Document Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequirementsIntro;