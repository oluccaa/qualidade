import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Prevenção rigorosa de dupla inicialização no ambiente ESM
const container = document.getElementById('root');

if (container && !container.hasAttribute('data-react-initialized')) {
  container.setAttribute('data-react-initialized', 'true');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}