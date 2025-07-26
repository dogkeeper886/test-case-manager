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
  }, [onChange]);

  // Initialize Quill
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Default modules and formats
    const defaultModules = {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ]
    };

    const defaultFormats = [
      'header', 'bold', 'italic', 'underline', 'strike',
      'list', 'bullet', 'color', 'background', 'link', 'image'
    ];

    // Merge with provided modules and formats
    const mergedModules = { ...defaultModules, ...modules };
    const mergedFormats = [...defaultFormats, ...formats];

    // Create Quill instance
    const quill = new Quill(container, {
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
      if (valueRef.current.includes('<')) {
        quill.clipboard.dangerouslyPasteHTML(valueRef.current);
      } else {
        quill.setText(valueRef.current);
      }
    }

    // Handle text changes - only trigger onChange when user finishes typing
    quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
      if (source === 'user' && onChangeRef.current) {
        const html = quill.root.innerHTML;
        onChangeRef.current(html);
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
      
      if (value) {
        if (value.includes('<')) {
          quillRef.current.clipboard.dangerouslyPasteHTML(value);
        } else {
          quillRef.current.setText(value);
        }
      } else {
        quillRef.current.setText('');
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