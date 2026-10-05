import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Apenas o subconjunto latin: os demais (cirilico, grego, vietnamita) somavam ~40 arquivos de fonte sem uso nesta interface.
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('elemento #root nao encontrado');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
