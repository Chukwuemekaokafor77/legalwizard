// src/services/pathways/DocumentAnalysisService.js
import { PDFDocument } from 'pdf-lib';
import { createWorker } from 'tesseract.js'; // Updated Tesseract import


export class DocumentAnalysisService {
  constructor() {
    this.worker = createWorker();
    this.initializeOCR();
  }

  async initializeOCR() {
    await this.worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
  }

  async processImage(file) {
    const { data: { text } } = await this.worker.recognize(file);
    return text;
  }

  async processDocument(file) {
    const processId = Symbol('documentProcess');
    return new Promise((resolve, reject) => {
      this.analysisQueue.next({
        file,
        processId,
        resolve,
        reject
      });
      this.activeProcesses.set(processId, {
        status: 'queued',
        progress: 0
      });
    });
  }

  async processTask({ file, processId, resolve, reject }) {
    try {
      this.updateProcessStatus(processId, 'processing', 0);
      
      const analysisResult = await this.analyzeDocument(file);
      const insights = this.extractDocumentInsights(analysisResult);
      
      this.updateProcessStatus(processId, 'complete', 100);
      resolve({
        status: 'complete',
        ...insights,
        metadata: this.extractMetadata(file)
      });
    } catch (error) {
      this.updateProcessStatus(processId, 'error', 0);
      reject({
        status: 'error',
        message: 'Analysis failed',
        errorCode: error.code || 'ANALYSIS_FAILURE'
      });
    } finally {
      this.activeProcesses.delete(processId);
    }
  }

  updateProcessStatus(processId, status, progress) {
    if (this.activeProcesses.has(processId)) {
      this.activeProcesses.set(processId, { status, progress });
    }
  }

  async analyzeDocument(file) {
    const fileType = file.type;
    let textContent = '';

    if (fileType === 'application/pdf') {
      textContent = await this.processPDF(file);
    } else if (fileType.includes('image/')) {
      textContent = await this.processImage(file);
    } else if (this.isTextFile(fileType)) {
      textContent = await this.processTextFile(file);
    } else {
      throw new Error('Unsupported file type');
    }

    return {
      text: textContent,
      entities: this.extractLegalEntities(textContent)
    };
  }

  isTextFile(fileType) {
    return [
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(fileType);
  }

  async processPDF(file) {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pageTexts = [];
    
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      try {
        const text = await page.getTextContent();
        pageTexts.push(text.items.map(item => item.str).join(' '));
        this.updateProcessStatus(Symbol.for('currentPdfPage'), 'processing', (i + 1) / pdfDoc.getPageCount() * 100);
      } catch (error) {
        console.warn(`Error processing page ${i + 1}:`, error);
        pageTexts.push('');
      }
    }
    
    return pageTexts.join('\n');
  }

  async processImage(file) {
    try {
      const { data: { text } } = await this.ocrWorker.recognize(file);
      return text;
    } finally {
      await this.ocrWorker.terminate();
    }
  }

  async processTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  extractMetadata(file) {
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    };
  }

  extractLegalEntities(text) {
    const entityPatterns = {
      date: /\b\d{4}-\d{2}-\d{2}\b/g,
      currency: /\$\d+(?:\.\d{2})?/g,
      caseNumber: /[A-Z]{2}-\d{6}/g
    };

    return Object.entries(entityPatterns).reduce((acc, [type, pattern]) => {
      acc[type] = text.match(pattern) || [];
      return acc;
    }, {});
  }

  extractDocumentInsights(rawAnalysis) {
    return {
      keyDates: this.extractDates(rawAnalysis.text),
      partiesInvolved: this.identifyParties(rawAnalysis.entities),
      financialData: this.extractFinancials(rawAnalysis.text),
      childrenDetails: this.findChildInfo(rawAnalysis.entities)
    };
  }

  extractDates(text) {
    return text.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
  }

  identifyParties(entities) {
    return entities.caseNumber.map(caseNum => ({
      caseNumber: caseNum,
      parties: []
    }));
  }

  extractFinancials(text) {
    const amounts = text.match(/\$\d+(?:\.\d{2})?/g) || [];
    return {
      total: amounts.reduce((sum, amount) => sum + parseFloat(amount.slice(1)), 0),
      transactions: amounts
    };
  }

  findChildInfo(entities) {
    return entities.caseNumber.map(caseNum => ({
      caseNumber: caseNum,
      children: []
    }));
  }

  cleanup() {
    this.ocrWorker.terminate();
    this.activeProcesses.clear();
  }
}