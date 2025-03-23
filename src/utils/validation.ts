import { 
    PathwayConfig,
    DocumentRequirement,
    FormSection
  } from '@/types/pathway';


  
  export const validatePathwayConfig = (config: PathwayConfig): string[] => {
    const errors: string[] = [];
    
    // Validate ID format
    if (!/^[a-z-]+$/.test(config.id)) {
      errors.push('ID must use lowercase letters and hyphens only');
    }
  
    // Validate document requirements
    config.documentRequirements.forEach((doc: DocumentRequirement) => {
      if (doc.maxSize > 20971520) { // 20MB
        errors.push(`Document ${doc.title} exceeds maximum size limit of 20MB`);
      }
    });
  
    // Validate form sections
    config.formSections.forEach((section: FormSection) => {
      if (!section.fields || section.fields.length === 0) {
        errors.push(`Section "${section.title}" has no fields defined`);
      }
    });
  
    // Validate required properties
    if (!config.steps || config.steps.length === 0) {
      errors.push('Pathway must have at least one step defined');
    }
  
    return errors;
  };