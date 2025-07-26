import React, { forwardRef, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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
  const isUpdatingRef = useRef(false);
  const hasFocusRef = useRef(false);
  const changeTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const focusRestoreTimeoutRef = useRef(null);

  // Update refs when props change
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  // Debounced onChange handler
  const debouncedOnChange = useCallback((content) => {
    if (onChangeRef.current && content !== valueRef.current) {
      valueRef.current = content;
      onChangeRef.current(content);
    }
  }, []);

  // Function to restore focus if needed
  const restoreFocus = useCallback(() => {
    if (quillRef.current && hasFocusRef.current && !quillRef.current.hasFocus()) {
      console.log('🔧 Restoring focus to Quill editor');
      quillRef.current.focus();
    }
  }, []);

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
      'list',
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
        // Use delta-based update to preserve content structure
        const delta = quill.clipboard.convert(valueRef.current);
        quill.setContents(delta);
      } else {
        quill.setText(valueRef.current);
      }
    }

    // Handle text changes with debouncing
    quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
      if (isUpdatingRef.current) return; // Skip if we're programmatically updating
      
      // Mark as typing
      isTypingRef.current = true;
      
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      
      changeTimeoutRef.current = setTimeout(() => {
        const html = quill.root.innerHTML;
        debouncedOnChange(html);
        isTypingRef.current = false;
        
        // Restore focus after a short delay if we had focus
        if (hasFocusRef.current) {
          if (focusRestoreTimeoutRef.current) {
            clearTimeout(focusRestoreTimeoutRef.current);
          }
          focusRestoreTimeoutRef.current = setTimeout(restoreFocus, 10);
        }
      }, 300); // 300ms debounce
    });

    // Handle focus events
    quill.on(Quill.events.FOCUS, () => {
      hasFocusRef.current = true;
      isTypingRef.current = false;
    });

    quill.on(Quill.events.BLUR, () => {
      // Only mark as not focused if we're not currently typing
      if (!isTypingRef.current) {
        hasFocusRef.current = false;
      } else {
        // Try to restore focus immediately
        setTimeout(restoreFocus, 0);
      }
    });

    // Expose Quill instance via ref
    if (ref) {
      ref.current = quill;
    }

    // Cleanup function
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      if (focusRestoreTimeoutRef.current) {
        clearTimeout(focusRestoreTimeoutRef.current);
      }
      if (ref) {
        ref.current = null;
      }
      quillRef.current = null;
      container.innerHTML = '';
    };
  }, [ref, readOnly, theme, placeholder, modules, formats, restoreFocus]); // Added restoreFocus to dependencies

  // Update value when prop changes (only if not currently focused or typing)
  useEffect(() => {
    if (quillRef.current && value !== valueRef.current && !hasFocusRef.current && !isTypingRef.current) {
      isUpdatingRef.current = true;
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
            // Use delta-based update to preserve content structure
            const delta = quillRef.current.clipboard.convert(value);
            quillRef.current.setContents(delta);
          } else {
            quillRef.current.setText(value);
          }
        } else {
          quillRef.current.setText('');
        }
      }
      
      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
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