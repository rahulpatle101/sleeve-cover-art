// Dev-only design library. Not a Vite build input (only index.html is), so it never ships.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Library } from './Library.tsx';
import '../styles/tokens.css';
import '../styles/app.css';
import './library.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Library />
  </StrictMode>,
);
