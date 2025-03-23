export class PathwayService {
  constructor(pathwaysConfig) {
    this.pathways = pathwaysConfig;
    this.documentMap = this.createDocumentMap();
  }

  // Document mapping and core functionality
  createDocumentMap() {
    return this.pathways.reduce((map, pathway) => {
      pathway.documentRequirements.forEach(req => {
        map[req.id] = { 
          ...req, 
          pathways: [...(map[req.id]?.pathways || []), pathway.id]
        };
      });
      return map;
    }, {});
  }

  // Configuration access
  getPathwayConfig(pathwayId) {
    return this.pathways.find(p => p.id === pathwayId);
  }

  // Document requirements
  getRequiredDocuments(pathwayId) {
    const pathway = this.getPathwayConfig(pathwayId);
    return pathway?.documentRequirements || [];
  }

  // Document validation
  checkDocumentStatus(docId, uploadedDocs) {
    const requirement = this.documentMap[docId];
    if (!requirement) return 'not-required';
    
    const uploaded = uploadedDocs.find(d => d.type === docId);
    if (!uploaded) return 'missing';
    
    return this.validateDocumentCompliance(uploaded, requirement);
  }

  // AI-powered validation core
  validateDocumentCompliance(document, requirement) {
    const issues = [];
    
    // Size validation
    if (requirement.maxSize && document.size > requirement.maxSize) {
      issues.push({
        code: 'FILE_TOO_LARGE',
        message: `Maximum size: ${(requirement.maxSize/1024/1024).toFixed(1)}MB`,
        actual: `${(document.size/1024/1024).toFixed(2)}MB`
      });
    }

    // Page count validation
    if (requirement.minPages && document.pages < requirement.minPages) {
      issues.push({
        code: 'INSUFFICIENT_PAGES',
        message: `Minimum pages: ${requirement.minPages}`,
        actual: document.pages
      });
    }

    // Format validation
    if (requirement.acceptedFormats && !requirement.acceptedFormats.includes(document.extension)) {
      issues.push({
        code: 'INVALID_FORMAT',
        message: `Accepted formats: ${requirement.acceptedFormats.join(', ')}`,
        actual: document.extension
      });
    }

    return issues.length > 0 
      ? { status: 'non-compliant', issues } 
      : { status: 'valid' };
  }

  // New: Get all pathways requiring a specific document
  getPathwaysForDocument(docId) {
    return this.documentMap[docId]?.pathways || [];
  }
}