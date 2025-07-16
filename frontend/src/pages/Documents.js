import React, { useState } from 'react';
import { Upload, File, FileText, Download, Trash2 } from 'lucide-react';

const Documents = () => {
  const [dragActive, setDragActive] = useState(false);

  const documents = [
    {
      id: 1,
      name: 'requirements.pdf',
      type: 'PDF',
      size: '2.3 MB',
      uploaded: '2024-01-20',
      testCases: 15,
      status: 'Processed',
    },
    {
      id: 2,
      name: 'user-stories.docx',
      type: 'Word',
      size: '1.8 MB',
      uploaded: '2024-01-22',
      testCases: 8,
      status: 'Processing',
    },
    {
      id: 3,
      name: 'api-specification.md',
      type: 'Markdown',
      size: '0.5 MB',
      uploaded: '2024-01-25',
      testCases: 0,
      status: 'Pending',
    },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log('File dropped:', e.dataTransfer.files[0]);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <File className="w-5 h-5 text-red-500" />;
      case 'Word':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Markdown':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload and manage design documents for test case generation
        </p>
      </div>

      <div className="mb-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-sm text-gray-600">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Upload a file
              </span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PDF, Word, or Markdown files up to 10MB
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Cases
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getFileIcon(doc.type)}
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      <div className="text-sm text-gray-500">{doc.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doc.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doc.testCases}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.status === 'Processed' 
                      ? 'bg-green-100 text-green-800' 
                      : doc.status === 'Processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doc.uploaded}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900 mr-4">
                    Generate Tests
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Documents;