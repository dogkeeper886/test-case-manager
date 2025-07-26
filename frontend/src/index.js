import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Temporarily disabled React.StrictMode to test duplicate toolbars issue
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);