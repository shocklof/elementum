import type { RouteObject } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { ElementPage } from '@/pages/ElementPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'elemento/:symbol', element: <ElementPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
