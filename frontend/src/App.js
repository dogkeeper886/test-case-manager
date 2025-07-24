import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.css';


import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import TestCases from './pages/TestCases.jsx';
import TestCaseDetail from './pages/TestCaseDetail';
import TestSuiteBrowser from './pages/TestSuiteBrowser';
import Documents from './pages/Documents';
import Import from './pages/Import';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import ComponentTest from './pages/ComponentTest';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/testcases" element={<TestCases />} />
            <Route path="/testcases/:id" element={<TestCaseDetail />} />
            <Route path="/test-suites" element={<TestSuiteBrowser />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/import" element={<Import />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/test" element={<ComponentTest />} />
          </Routes>
          <ToastContainer position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;