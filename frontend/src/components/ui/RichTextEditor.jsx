import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import CustomQuillEditor from './CustomQuillEditor';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './index';

const RichTextEditor = memo(({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  label,
  className = '',
  showPreview = true,
  maxHeight = '300px',
  readOnly = false
}) => {
  // Generate a stable key for the CustomQuillEditor
  const editorKey = useMemo(() => `quill-${label || 'editor'}`, [label]);
  const [isPreview, setIsPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const [isTyping, setIsTyping] = useState(false);
  const quillRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    // Only update content if not currently typing to prevent cursor position issues
    if (!isTyping) {
      setHtmlContent(value);
    }
  }, [value, isTyping]);

  const handleContentChange = useCallback((content) => {
    setIsTyping(true);
    setHtmlContent(content);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the onChange callback to prevent rapid updates
    debounceTimeoutRef.current = setTimeout(() => {
      onChange?.(content);
      setIsTyping(false);
    }, 50); // 50ms debounce
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Quill modules configuration - memoized to prevent re-renders
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    },
    keyboard: {
      bindings: {
        // Ensure proper cursor behavior for common keys
        'enter': {
          key: 13,
          handler: function(range, context) {
            // Default enter behavior
            return true;
          }
        },
        'backspace': {
          key: 8,
          handler: function(range, context) {
            // Default backspace behavior
            return true;
          }
        }
      }
    }
  }), []);

  // Quill formats configuration - memoized to prevent re-renders
  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background',
    'link', 'code-block'
  ], []);

  const renderPreview = () => {
    return (
      <div 
        className="prose prose-sm max-w-none p-4 border border-apple-gray-2 rounded-apple bg-white min-h-[100px] max-h-[300px] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: htmlContent || '<em>No content</em>' }}
      />
    );
  };

  // Custom CSS for Apple design
  const customStyles = `
    .ql-editor {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1d1d1f;
      padding: 16px;
      min-height: 120px;
      max-height: ${maxHeight};
      overflow-y: auto;
    }
    
    .ql-toolbar {
      border: 1px solid #d2d2d7;
      border-radius: 8px 8px 0 0;
      background-color: #f5f5f7;
      padding: 8px;
    }
    
    .ql-container {
      border: 1px solid #d2d2d7;
      border-top: none;
      border-radius: 0 0 8px 8px;
      background-color: white;
    }
    
    .ql-editor:focus {
      outline: none;
      border-color: #007aff;
      box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
    }
    
    .ql-editor.ql-blank::before {
      color: #86868b;
      font-style: italic;
    }
    
    .ql-snow .ql-picker {
      color: #1d1d1f;
    }
    
    .ql-snow .ql-stroke {
      stroke: #1d1d1f;
    }
    
    .ql-snow .ql-fill {
      fill: #1d1d1f;
    }
    
    .ql-snow .ql-picker-options {
      background-color: white;
      border: 1px solid #d2d2d7;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .ql-snow .ql-picker-item:hover {
      background-color: #f5f5f7;
    }
    
    .ql-snow .ql-picker-item.ql-selected {
      background-color: #007aff;
      color: white;
    }
    
    .ql-snow .ql-tooltip {
      background-color: white;
      border: 1px solid #d2d2d7;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      color: #1d1d1f;
    }
    
    .ql-snow .ql-tooltip input[type=text] {
      border: 1px solid #d2d2d7;
      border-radius: 4px;
      padding: 4px 8px;
    }
    
    .ql-snow .ql-tooltip a {
      color: #007aff;
    }
  `;

  return (
    <div className={`space-y-3 ${className}`}>
      <style>{customStyles}</style>
      
      {label && (
        <label className="block text-sm font-medium text-apple-gray-7">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {!isPreview && (
          <div className="rich-text-editor-container">
            <CustomQuillEditor
              key={editorKey}
              ref={quillRef}
              value={htmlContent}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              placeholder={placeholder}
              readOnly={readOnly}
              theme="snow"
            />
          </div>
        )}
        
        {isPreview && renderPreview()}
      </div>

      {showPreview && (
        <div className="flex items-center justify-end">
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
        </div>
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor; 