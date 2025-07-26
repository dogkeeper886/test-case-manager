import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Bold, Italic, List, ListOrdered, Link, Code } from 'lucide-react';
import { Button } from './index';

const HtmlEditor = ({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  label,
  className = '',
  showPreview = true,
  showToolbar = true,
  maxHeight = '300px'
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const textareaRef = useRef(null);

  useEffect(() => {
    setHtmlContent(value);
  }, [value]);

  const handleContentChange = (newContent) => {
    setHtmlContent(newContent);
    onChange?.(newContent);
  };

  // Auto-format common text patterns
  const autoFormatText = (text) => {
    // Auto-detect and format common patterns
    let formattedText = text;
    
    // Auto-format URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formattedText = formattedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Auto-format email addresses
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    formattedText = formattedText.replace(emailRegex, '<a href="mailto:$1">$1</a>');
    
    // Auto-format line breaks for better readability
    formattedText = formattedText.replace(/\n\n/g, '</p><p>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formattedText.startsWith('<')) {
      formattedText = `<p>${formattedText}</p>`;
    }
    
    return formattedText;
  };

  const handleTextareaChange = (e) => {
    const newContent = e.target.value;
    
    // Only auto-format if user is typing plain text (not HTML)
    if (!newContent.includes('<') || newContent.match(/^[^<]*$/)) {
      const autoFormatted = autoFormatText(newContent);
      handleContentChange(autoFormatted);
    } else {
      handleContentChange(newContent);
    }
  };

  const insertTag = (tag, attributes = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let insertText = '';
    switch (tag) {
      case 'b':
        insertText = `<strong>${selectedText}</strong>`;
        break;
      case 'i':
        insertText = `<em>${selectedText}</em>`;
        break;
      case 'ul':
        insertText = `<ul>\n  <li>${selectedText}</li>\n</ul>`;
        break;
      case 'ol':
        insertText = `<ol>\n  <li>${selectedText}</li>\n</ol>`;
        break;
      case 'code':
        insertText = `<code>${selectedText}</code>`;
        break;
      case 'a':
        const url = prompt('Enter URL:');
        if (url) {
          insertText = `<a href="${url}">${selectedText || url}</a>`;
        } else {
          return;
        }
        break;
      default:
        insertText = `<${tag}>${selectedText}</${tag}>`;
    }

    const newValue = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
    handleContentChange(newValue);

    // Set cursor position after inserted content
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderPreview = () => {
    return (
      <div 
        className="prose prose-sm max-w-none p-4 border border-apple-gray-2 rounded-apple bg-white min-h-[100px] max-h-[300px] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: htmlContent || '<em>No content</em>' }}
      />
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-apple-gray-7">
          {label}
        </label>
      )}
      
      {showToolbar && (
        <div className="flex items-center gap-1 p-2 bg-apple-gray-1 border border-apple-gray-2 rounded-apple">
          <Button
            variant="ghost"
            size="sm"
            icon={<Bold className="w-4 h-4" />}
            onClick={() => insertTag('b')}
            className="text-apple-gray-6 hover:text-apple-gray-8"
            title="Bold"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Italic className="w-4 h-4" />}
            onClick={() => insertTag('i')}
            className="text-apple-gray-6 hover:text-apple-gray-8"
            title="Italic"
          />
          <div className="w-px h-4 bg-apple-gray-3 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            icon={<List className="w-4 h-4" />}
            onClick={() => insertTag('ul')}
            className="text-apple-gray-6 hover:text-apple-gray-8"
            title="Unordered List"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<ListOrdered className="w-4 h-4" />}
            onClick={() => insertTag('ol')}
            className="text-apple-gray-6 hover:text-apple-gray-8"
            title="Ordered List"
          />
          <div className="w-px h-4 bg-apple-gray-3 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            icon={<Link className="w-4 h-4" />}
            onClick={() => insertTag('a')}
            className="text-apple-gray-6 hover:text-apple-gray-8"
            title="Link"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Code className="w-4 h-4" />}
            onClick={() => insertTag('code')}
            className="text-apple-gray-6 hover:text-apple-gray-8"
            title="Code"
          />
          
          {showPreview && (
            <>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                icon={isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onClick={() => setIsPreview(!isPreview)}
                className="text-apple-gray-6 hover:text-apple-gray-8"
                title={isPreview ? 'Hide Preview' : 'Show Preview'}
              >
                {isPreview ? 'Hide Preview' : 'Preview'}
              </Button>
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {!isPreview && (
          <textarea
            ref={textareaRef}
            value={htmlContent}
            onChange={handleTextareaChange}
            placeholder={placeholder}
            className="w-full p-4 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
            style={{ minHeight: '120px', maxHeight }}
          />
        )}
        
        {isPreview && renderPreview()}
      </div>

      <div className="text-xs text-apple-gray-5">
        <p>Use the toolbar above to format your content. The system will automatically handle formatting for you.</p>
        <p className="mt-1">
          <strong>Tip:</strong> Select text and click a formatting button to apply formatting.
        </p>
      </div>
    </div>
  );
};

export default HtmlEditor; 