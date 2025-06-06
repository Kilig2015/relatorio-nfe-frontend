import React from 'react';
import ReactDOM from 'react-dom/client';
import UploadRelatorio from './UploadRelatorio';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <UploadRelatorio />
  </React.StrictMode>
);
