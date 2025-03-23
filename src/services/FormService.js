import { PDFService } from './PDFService';
import { DOCXGenerator } from './DOCXGenerator';
import { PathwayService } from './PathwayService';

export class FormService {
  constructor(pathwayConfig) {
    this.pathway = new PathwayService(pathwayConfig);
  }

  async generateMultipleForms(data) {
    const forms = [];
    
    for (const template of this.pathway.getTemplates()) {
      const compiled = this.compileTemplate(template, data);
      const pdf = await PDFService.generate(compiled);
      const docx = await DOCXGenerator.generate(compiled);
      
      forms.push({
        id: template.id,
        title: template.title,
        pdf,
        docx,
        metadata: this.extractMetadata(template)
      });
    }

    return forms;
  }

  compileTemplate(template, data) {
    // Replace placeholders with actual values
    let content = template.content;
    
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });

    // Add legal headers/footers
    return this.addLegalBoilerplate(content);
  }

  addLegalBoilerplate(content) {
    return `
      ${this.pathway.getHeader()}
      ${content}
      ${this.pathway.getFooter()}
    `;
  }

  extractMetadata(template) {
    return {
      court: template.court,
      jurisdiction: this.pathway.jurisdiction,
      effectiveDate: new Date().toISOString(),
      formId: template.formId
    };
  }
}