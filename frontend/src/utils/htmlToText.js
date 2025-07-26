/**
 * Convert HTML content to readable text for display
 * This function strips HTML tags while preserving the content
 * @param {string} html - The HTML content to convert
 * @param {number} maxLength - Maximum length for truncation (default: 100)
 * @returns {string} - Clean text content
 */
export const htmlToText = (html, maxLength = 100) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content (strips all HTML tags)
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Truncate if longer than maxLength
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return text;
  } catch (error) {
    console.warn('Error converting HTML to text:', error);
    // Fallback: try to strip basic HTML tags with regex
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, maxLength) + (html.length > maxLength ? '...' : '');
  }
};

/**
 * Get a preview of HTML content for tooltips
 * @param {string} html - The HTML content
 * @param {number} maxLength - Maximum length for preview (default: 200)
 * @returns {string} - Clean text preview
 */
export const getHtmlPreview = (html, maxLength = 200) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    let text = tempDiv.textContent || tempDiv.innerText || '';
    text = text.replace(/\s+/g, ' ').trim();
    
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return text;
  } catch (error) {
    console.warn('Error getting HTML preview:', error);
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, maxLength) + (html.length > maxLength ? '...' : '');
  }
};

/**
 * Check if content contains HTML tags
 * @param {string} content - The content to check
 * @returns {boolean} - True if content contains HTML tags
 */
export const containsHtml = (content) => {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  // Simple check for HTML tags
  const htmlTagRegex = /<[^>]*>/;
  return htmlTagRegex.test(content);
}; 