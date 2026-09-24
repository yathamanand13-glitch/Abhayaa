import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext';
import { PermissionProvider } from './context/PermissionContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </LanguageProvider>
  </StrictMode>,
);
