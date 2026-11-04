import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from './app/routes';
import './styles/index.css';

const router = createBrowserRouter(routes);

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado em index.html.');

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
