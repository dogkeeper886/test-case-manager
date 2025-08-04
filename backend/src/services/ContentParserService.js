const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { marked } = require('marked');

class ContentParserService {
  constructor() {
    this.supportedFormats = ['.md', '.txt', '.pdf', '.docx'];
  }

  /**
   * Parse file based on its extension
   * @param {string} filePath - Path to the file
   * @param {string} originalName - Original filename
   * @returns {Promise<Object>} Parsed content with metadata
   */
  async parseFile(filePath, originalName) {
    const extension = path.extname(originalName).toLowerCase();
    
    if (!this.supportedFormats.includes(extension)) {
      throw new Error(`Unsupported file format: ${extension}. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    const stats = await fs.stat(filePath);
    const baseMetadata = {
      originalName,
      extension,
      size: stats.size,
      parsedAt: new Date().toISOString()
    };

    try {
      switch (extension) {
        case '.md':
          return await this.parseMarkdown(filePath, baseMetadata);
        case '.txt':
          return await this.parseText(filePath, baseMetadata);
        case '.pdf':
          return await this.parsePDF(filePath, baseMetadata);
        case '.docx':
          return await this.parseDocx(filePath, baseMetadata);
        default:
          throw new Error(`Unsupported file format: ${extension}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse ${extension} file: ${error.message}`);
    }
  }

  /**
   * Parse Markdown file
   * @param {string} filePath - Path to markdown file
   * @param {Object} baseMetadata - Base metadata
   * @returns {Promise<Object>} Parsed markdown content
   */
  async parseMarkdown(filePath, baseMetadata) {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Parse markdown to extract structure
    const tokens = marked.lexer(content);
    const sections = this.extractSections(tokens);
    
    // Extract test-related patterns
    const testPatterns = this.extractTestPatterns(content);
    
    return {
      content: content.trim(),
      sections,
      testPatterns,
      format: 'markdown',
      metadata: {
        ...baseMetadata,
        sectionCount: sections.length,
        testCaseIndicators: testPatterns.indicators.length,
        hasTableContent: tokens.some(token => token.type === 'table')
      }
    };
  }

  /**
   * Parse plain text file
   * @param {string} filePath - Path to text file
   * @param {Object} baseMetadata - Base metadata
   * @returns {Promise<Object>} Parsed text content
   */
  async parseText(filePath, baseMetadata) {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Split into logical sections based on patterns
    const sections = this.extractTextSections(content);
    const testPatterns = this.extractTestPatterns(content);
    
    return {
      content: content.trim(),
      sections,
      testPatterns,
      format: 'text',
      metadata: {
        ...baseMetadata,
        lineCount: content.split('\n').length,
        sectionCount: sections.length,
        testCaseIndicators: testPatterns.indicators.length
      }
    };
  }

  /**
   * Parse PDF file
   * @param {string} filePath - Path to PDF file
   * @param {Object} baseMetadata - Base metadata
   * @returns {Promise<Object>} Parsed PDF content
   */
  async parsePDF(filePath, baseMetadata) {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    const content = pdfData.text;
    const sections = this.extractTextSections(content);
    const testPatterns = this.extractTestPatterns(content);
    
    return {
      content: content.trim(),
      sections,
      testPatterns,
      format: 'pdf',
      metadata: {
        ...baseMetadata,
        pageCount: pdfData.numpages,
        sectionCount: sections.length,
        testCaseIndicators: testPatterns.indicators.length,
        extractedInfo: pdfData.info
      }
    };
  }

  /**
   * Parse Word document
   * @param {string} filePath - Path to DOCX file
   * @param {Object} baseMetadata - Base metadata
   * @returns {Promise<Object>} Parsed Word document content
   */
  async parseDocx(filePath, baseMetadata) {
    const result = await mammoth.extractRawText({ path: filePath });
    const content = result.value;
    
    const sections = this.extractTextSections(content);
    const testPatterns = this.extractTestPatterns(content);
    
    return {
      content: content.trim(),
      sections,
      testPatterns,
      format: 'docx',
      metadata: {
        ...baseMetadata,
        sectionCount: sections.length,
        testCaseIndicators: testPatterns.indicators.length,
        hasImages: result.messages.some(msg => msg.type === 'warning' && msg.message.includes('image'))
      }
    };
  }

  /**
   * Extract sections from markdown tokens
   * @param {Array} tokens - Marked.js tokens
   * @returns {Array} Extracted sections
   */
  extractSections(tokens) {
    const sections = [];
    let currentSection = null;

    tokens.forEach(token => {
      if (token.type === 'heading') {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          level: token.depth,
          title: token.text,
          content: [],
          startIndex: sections.length
        };
      } else if (currentSection) {
        currentSection.content.push(token);
      }
    });

    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Extract sections from plain text based on patterns
   * @param {string} content - Text content
   * @returns {Array} Extracted sections
   */
  extractTextSections(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;

    // Common section patterns
    const sectionPatterns = [
      /^#{1,6}\s+(.+)/, // Markdown headers
      /^(.+)$/,         // Lines that are all caps or title case
      /^\d+\.\s+(.+)/,  // Numbered sections
      /^[-=]{3,}$/      // Underlines
    ];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check if this looks like a section header
      const isSectionHeader = sectionPatterns.some(pattern => 
        pattern.test(trimmedLine) && 
        trimmedLine.length > 3 && 
        trimmedLine.length < 100
      );

      if (isSectionHeader && trimmedLine !== '') {
        // Save previous section
        if (currentSection && currentSection.content.length > 0) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: trimmedLine,
          content: [],
          startLine: index
        };
      } else if (currentSection && trimmedLine !== '') {
        currentSection.content.push(trimmedLine);
      }
    });

    // Add final section
    if (currentSection && currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Extract test-related patterns from content
   * @param {string} content - Content to analyze
   * @returns {Object} Test patterns found
   */
  extractTestPatterns(content) {
    const indicators = [];
    const scenarios = [];
    const steps = [];

    // Test case indicators
    const testIndicators = [
      /test\s+case/gi,
      /test\s+scenario/gi,
      /test\s+plan/gi,
      /verify\s+that/gi,
      /ensure\s+that/gi,
      /given.*when.*then/gi,
      /precondition/gi,
      /expected\s+result/gi,
      /actual\s+result/gi
    ];

    // Step patterns
    const stepPatterns = [
      /^\d+\.\s+/gm,        // Numbered steps
      /^step\s+\d+/gmi,     // "Step 1", "Step 2"
      /^action:/gmi,        // Action labels
      /^expected:/gmi,      // Expected result labels
      /^\*\s+/gm,          // Bullet points
      /^-\s+/gm            // Dash lists
    ];

    // Find test indicators
    testIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        indicators.push(...matches.map(match => ({
          type: 'indicator',
          pattern: pattern.source,
          text: match
        })));
      }
    });

    // Find step patterns
    stepPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        steps.push(...matches.map(match => ({
          type: 'step',
          pattern: pattern.source,
          text: match
        })));
      }
    });

    // Extract potential test scenarios (paragraphs with test keywords)
    const paragraphs = content.split(/\n\s*\n/);
    paragraphs.forEach(paragraph => {
      const hasTestKeywords = testIndicators.some(pattern => pattern.test(paragraph));
      if (hasTestKeywords && paragraph.trim().length > 50) {
        scenarios.push({
          type: 'scenario',
          text: paragraph.trim(),
          confidence: this.calculateTestScenarioConfidence(paragraph)
        });
      }
    });

    return {
      indicators,
      scenarios,
      steps,
      summary: {
        totalIndicators: indicators.length,
        totalScenarios: scenarios.length,
        totalSteps: steps.length,
        confidence: scenarios.length > 0 ? 
          scenarios.reduce((sum, s) => sum + s.confidence, 0) / scenarios.length : 0
      }
    };
  }

  /**
   * Calculate confidence that a paragraph contains a test scenario
   * @param {string} paragraph - Paragraph text
   * @returns {number} Confidence score (0-1)
   */
  calculateTestScenarioConfidence(paragraph) {
    let score = 0;
    const text = paragraph.toLowerCase();

    // High confidence keywords
    const highConfidenceWords = ['test case', 'verify that', 'ensure that', 'expected result'];
    highConfidenceWords.forEach(word => {
      if (text.includes(word)) score += 0.3;
    });

    // Medium confidence keywords  
    const mediumConfidenceWords = ['should', 'must', 'will', 'action', 'step'];
    mediumConfidenceWords.forEach(word => {
      if (text.includes(word)) score += 0.1;
    });

    // Structure indicators
    if (/\d+\./.test(paragraph)) score += 0.2; // Numbered steps
    if (paragraph.includes('|')) score += 0.1; // Table format
    if (paragraph.split('\n').length > 2) score += 0.1; // Multi-line

    return Math.min(score, 1.0);
  }

  /**
   * Get supported file formats
   * @returns {Array} List of supported extensions
   */
  getSupportedFormats() {
    return [...this.supportedFormats];
  }

  /**
   * Validate file format
   * @param {string} filename - Filename to validate
   * @returns {boolean} True if supported
   */
  isFormatSupported(filename) {
    const extension = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(extension);
  }
}

module.exports = ContentParserService;