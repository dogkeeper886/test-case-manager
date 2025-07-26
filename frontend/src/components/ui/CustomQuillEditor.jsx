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
  const isInitializedRef = useRef(false);
  const isUserTypingRef = useRef(false);
  const lastCursorPositionRef = useRef(null);

  // Update refs when props change
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Quill - with empty dependency array to prevent re-initialization
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }

    // Clear container completely
    container.innerHTML = '';

    // Default modules and formats
    const defaultModules = {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'code-block'],
        ['clean']
      ]
    };

    const defaultFormats = [
      'header', 'bold', 'italic', 'underline', 'strike',
      'list', 'color', 'background', 'link', 'code-block'
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
    isInitializedRef.current = true;

    // Set initial value
    if (valueRef.current) {
      if (valueRef.current.includes('<')) {
        quill.clipboard.dangerouslyPasteHTML(valueRef.current);
      } else {
        quill.setText(valueRef.current);
      }
    }

    // Handle text changes with improved cursor position management
    quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
      if (source === 'user') {
        isUserTypingRef.current = true;
        
        // Store cursor position before change
        const range = quill.getSelection();
        if (range) {
          lastCursorPositionRef.current = range.index;
        }
        
        // Trigger onChange with a small delay to ensure cursor position is stable
        setTimeout(() => {
          if (onChangeRef.current) {
            const html = quill.root.innerHTML;
            onChangeRef.current(html);
          }
          isUserTypingRef.current = false;
        }, 10);
      }
    });

    // Handle selection changes to track cursor position
    quill.on(Quill.events.SELECTION_CHANGE, (range, oldRange, source) => {
      if (source === 'user' && range) {
        lastCursorPositionRef.current = range.index;
      }
    });

    // Expose Quill instance via ref
    if (ref) {
      if (typeof ref === 'function') {
        ref(quill);
      } else {
        ref.current = quill;
      }
    }

    // Cleanup function
    return () => {
      if (quillRef.current) {
        // Remove all event listeners
        quillRef.current.off('text-change');
        quillRef.current.off('selection-change');
        quillRef.current = null;
      }
      if (ref) {
        if (typeof ref === 'function') {
          ref(null);
        } else {
          ref.current = null;
        }
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array to prevent re-initialization

  // Update value when prop changes - with cursor position preservation
  useEffect(() => {
    if (quillRef.current && value !== valueRef.current && !isUserTypingRef.current) {
      valueRef.current = value;
      
      // Store current cursor position
      const currentRange = quillRef.current.getSelection();
      const cursorPosition = currentRange ? currentRange.index : 0;
      
      if (value) {
        if (value.includes('<')) {
          quillRef.current.clipboard.dangerouslyPasteHTML(value);
        } else {
          quillRef.current.setText(value);
        }
      } else {
        quillRef.current.setText('');
      }
      
      // Restore cursor position after content update
      if (currentRange) {
        setTimeout(() => {
          try {
            quillRef.current.setSelection(cursorPosition, 0);
          } catch (error) {
            // If cursor position is invalid, set to end of content
            const length = quillRef.current.getLength();
            quillRef.current.setSelection(length - 1, 0);
          }
        }, 0);
      }
    }
  }, [value]);

  // Update readOnly when prop changes
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly);
    }
  }, [readOnly]);

  // Update placeholder when prop changes
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.root.setAttribute('data-placeholder', placeholder);
    }
  }, [placeholder]);

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