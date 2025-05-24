import React from 'react';
import ReactDOM from 'react-dom/client';
import { DemoEditor } from './lib/demo-editor';
import './index.css'; // Optional: if you have global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoEditor />
  </React.StrictMode>
);
