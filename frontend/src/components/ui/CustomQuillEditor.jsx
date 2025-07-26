import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const CustomQuillEditor = forwardRef(({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  readOnly = false,
  modules = {},
  formats = [],
  theme = 'snow',
  className = '',
  style = {}
}, ref) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Update refs when props change
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create editor container
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    // Default modules configuration
    const defaultModules = {
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

    // Merge with custom modules
    const mergedModules = { ...defaultModules, ...modules };

    // Default formats
    const defaultFormats = [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'list', 'bullet',
      'color', 'background',
      'link', 'code-block'
    ];

    // Merge with custom formats
    const mergedFormats = [...defaultFormats, ...formats];

    // Initialize Quill
    const quill = new Quill(editorContainer, {
      theme,
      readOnly,
      placeholder,
      modules: mergedModules,
      formats: mergedFormats
    });

    // Store Quill instance
    quillRef.current = quill;

    // Set initial value
    if (valueRef.current) {
      // Handle HTML content
      const isHTML = /^<([a-z]+)[^>]*>[\S\s]*<\/\1>$/.test(valueRef.current) || 
                     valueRef.current.includes('<');
      
      if (isHTML) {
        quill.clipboard.dangerouslyPasteHTML(valueRef.current);
      } else {
        quill.setText(valueRef.current);
      }
    }

    // Handle text changes
    quill.on(Quill.events.TEXT_CHANGE, () => {
      const html = quill.root.innerHTML;
      // Only trigger onChange if content actually changed
      if (html !== valueRef.current) {
        valueRef.current = html;
        onChangeRef.current?.(html);
      }
    });

    // Expose Quill instance via ref
    if (ref) {
      ref.current = quill;
    }

    // Cleanup function
    return () => {
      if (ref) {
        ref.current = null;
      }
      quillRef.current = null;
      container.innerHTML = '';
    };
  }, [ref, readOnly, theme, placeholder, modules, formats]);

  // Update value when prop changes
  useEffect(() => {
    if (quillRef.current && value !== valueRef.current) {
      valueRef.current = value;
      
      // Get current content
      const currentContent = quillRef.current.root.innerHTML;
      
      // Only update if content is different
      if (value !== currentContent) {
        if (value) {
          // Handle HTML content
          const isHTML = /^<([a-z]+)[^>]*>[\S\s]*<\/\1>$/.test(value) || 
                         value.includes('<');
          
          if (isHTML) {
            quillRef.current.clipboard.dangerouslyPasteHTML(value);
          } else {
            quillRef.current.setText(value);
          }
        } else {
          quillRef.current.setText('');
        }
      }
    }
  }, [value]);

  // Update readOnly when prop changes
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly);
    }
  }, [readOnly]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={style}
    />
  );
});

CustomQuillEditor.displayName = 'CustomQuillEditor';

CustomQuillEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  modules: PropTypes.object,
  formats: PropTypes.array,
  theme: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default CustomQuillEditor; 