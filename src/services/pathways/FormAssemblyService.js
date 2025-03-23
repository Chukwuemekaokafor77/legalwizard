// src/services/pathways/FormAssemblyService.js
import { PDFDocument } from 'pdf-lib';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { sanitizeFormData } from '../../utils/formSanitizers';

export class FormAssemblyService {
  constructor() {
    this.templateCache = new Map();
    this.maxFileSize = 1024 * 1024 * 5; // 5MB
    this.supportedMimeTypes = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]);
    this.watermarkText = 'Certified Copy - Not for Official Use';
  }

  async generateForms(pathway, answers, documents) {
    try {
      // Validate input structure
      if (!pathway?.fieldMappings || !pathway?.mainFormTemplate) {
        throw new Error('Invalid pathway configuration');
      }

      const sanitizedAnswers = sanitizeFormData(answers, pathway.fieldConfig);
      
      // Parallel processing of different document types
      const generatedForms = await Promise.all([
        this.generatePDFForms(pathway, sanitizedAnswers),
        this.processSupportingDocuments(pathway, documents),
        ...(pathway.requiresFinancialDisclosure ? [
          this.generateFinancialDisclosure(sanitizedAnswers)
        ] : [])
      ]);

      return generatedForms.flat();
    } catch (error) {
      console.error('Form generation failed:', error);
      throw new Error(`Document assembly failed: ${error.message}`);
    }
  }

  async generatePDFForms(pathway, data) {
    try {
      const template = await this.loadTemplate(pathway.mainFormTemplate);
      const pdfDoc = await PDFDocument.load(template);
      const form = pdfDoc.getForm();

      // Process all field mappings
      for (const [fieldName, mapping] of Object.entries(pathway.fieldMappings)) {
        const field = form.getField(fieldName);
        if (field) {
          const value = this.resolveNestedValue(data, mapping);
          this.setFieldValue(field, value);
        }
      }

      // Finalize PDF
      const pdfBytes = await pdfDoc.save();
      return this.createDocumentResult(
        `${pathway.id}_${new Date().toISOString()}.pdf`,
        pdfBytes,
        'application/pdf'
      );
    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  async loadTemplate(templateId) {
    try {
      // Check cache first
      if (this.templateCache.has(templateId)) {
        return this.templateCache.get(templateId);
      }

      // Fetch and validate template
      const response = await fetch(`/templates/${templateId}.pdf`);
      if (!response.ok) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      const buffer = await response.arrayBuffer();
      this.validateFileSize(buffer);
      
      // Add to cache
      this.templateCache.set(templateId, buffer);
      return buffer;
    } catch (error) {
      throw new Error(`Template loading error: ${error.message}`);
    }
  }

  validateFileSize(buffer) {
    if (buffer.byteLength > this.maxFileSize) {
      throw new Error(`File size exceeds limit (${this.maxFileSize/1024/1024}MB)`);
    }
  }

  async processSupportingDocuments(pathway, documents) {
    try {
      return await Promise.all(
        documents.map(async doc => {
          // Validate document before processing
          if (!this.supportedMimeTypes.has(doc.type)) {
            throw new Error(`Unsupported document type: ${doc.type}`);
          }

          const watermarkedContent = await this.applyWatermark(doc.content);
          return this.createDocumentResult(
            `Certified_${doc.name}`,
            watermarkedContent,
            doc.type
          );
        })
      );
    } catch (error) {
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }

  async applyWatermark(content) {
    try {
      const pdfDoc = await PDFDocument.load(content);
      const pages = pdfDoc.getPages();
      
      // Apply watermark to all pages
      pages.forEach((page, index) => {
        page.drawText(this.watermarkText, {
          x: 50,
          y: 50 + (index * 10), // Offset for multi-page documents
          size: 10,
          color: [0.8, 0.8, 0.8],
          opacity: 0.4,
          rotate: 45 // Diagonal watermark
        });
      });

      return await pdfDoc.save();
    } catch (error) {
      throw new Error(`Watermark application failed: ${error.message}`);
    }
  }

  async generateFinancialDisclosure(data) {
    try {
      const templateResponse = await fetch('/templates/financial-disclosure.docx');
      if (!templateResponse.ok) {
        throw new Error('Financial disclosure template not found');
      }
      
      const templateBuffer = await templateResponse.arrayBuffer();
      const zip = new PizZip(templateBuffer);
      
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => '' // Handle missing values gracefully
      });

      // Validate and set data
      if (typeof data !== 'object') {
        throw new Error('Invalid financial data format');
      }
      doc.setData(data);

      try {
        doc.render();
      } catch (renderError) {
        throw new Error(`Template rendering error: ${renderError.message}`);
      }

      const docxBuffer = doc.getZip().generate({ type: 'uint8array' });
      return this.createDocumentResult(
        `Financial_Disclosure_${new Date().toISOString()}.docx`,
        docxBuffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    } catch (error) {
      throw new Error(`Financial disclosure generation failed: ${error.message}`);
    }
  }

  createDocumentResult(name, content, mimeType) {
    if (!this.supportedMimeTypes.has(mimeType)) {
      throw new Error(`Unsupported document type: ${mimeType}`);
    }

    try {
      return {
        name,
        content,
        type: mimeType,
        previewUrl: URL.createObjectURL(new Blob([content], { type: mimeType })),
        size: content.byteLength,
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Document creation failed: ${error.message}`);
    }
  }

  resolveNestedValue(data, mappingPath) {
    try {
      return mappingPath.split('.').reduce((obj, key) => {
        if (obj && obj[key] !== undefined) {
          return obj[key];
        }
        throw new Error(`Missing data at path: ${mappingPath}`);
      }, data);
    } catch (error) {
      console.warn(`Data resolution error: ${error.message}`);
      return null;
    }
  }

  setFieldValue(field, value) {
    try {
      if (typeof value === 'undefined' || value === null) {
        field.setText('');
        return;
      }

      switch(field.constructor.name) {
        case 'PDFTextField':
          field.setText(value.toString());
          break;
        case 'PDFDropdown':
          field.select(value.toString());
          break;
        case 'PDFCheckBox':
          value ? field.check() : field.uncheck();
          break;
        default:
          field.setText(value.toString());
      }
    } catch (error) {
      console.error(`Field setting error: ${error.message}`);
    }
  }

  formatValue(value, type) {
    try {
      switch(type) {
        case 'date':
          return this.formatDate(value);
        case 'currency':
          return this.formatCurrency(value);
        case 'percentage':
          return this.formatPercentage(value);
        default:
          return value?.toString()?.trim() || '';
      }
    } catch (error) {
      console.error(`Formatting error for value ${value}: ${error.message}`);
      return '';
    }
  }

  formatDate(value) {
    const date = new Date(value);
    if (isNaN(date)) throw new Error('Invalid date value');
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatCurrency(value) {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) throw new Error('Invalid currency value');
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  formatPercentage(value) {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) throw new Error('Invalid percentage value');
    return `${numericValue.toFixed(1)}%`;
  }

  cleanupCache() {
    try {
      this.templateCache.clear();
      console.log('Template cache cleared successfully');
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  async preloadTemplates(templateIds) {
    try {
      await Promise.all(templateIds.map(async id => {
        if (!this.templateCache.has(id)) {
          await this.loadTemplate(id);
        }
      }));
    } catch (error) {
      console.error('Template preloading failed:', error);
    }
  }
}