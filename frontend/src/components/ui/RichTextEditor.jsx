import React, { useState, useRef, useEffect } from 'react';
import CustomQuillEditor from './CustomQuillEditor';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './index';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  label,
  className = '',
  showPreview = true,
  maxHeight = '300px',
  readOnly = false
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const quillRef = useRef(null);

  useEffect(() => {
    setHtmlContent(value);
  }, [value]);

  const handleContentChange = (content) => {
    setHtmlContent(content);
    onChange?.(content);
  };

  // Quill modules configuration
  const modules = {
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
    }
  };

  // Quill formats configuration
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background',
    'link', 'code-block'
  ];

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
        <div className="flex items-center justify-between">
          <div className="text-xs text-apple-gray-5">
            <p>Use the toolbar above to format your content. No HTML knowledge required.</p>
            <p className="mt-1">
              <strong>Tip:</strong> Select text and use the formatting buttons to style your content.
            </p>
          </div>
          
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
};

export default RichTextEditor; 