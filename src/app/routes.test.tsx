import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from './routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe('roteamento', () => {
  it('renderiza a página da tabela periódica em "/"', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Tabela periódica' })).toBeInTheDocument();
    expect(screen.getByText(/0 de 118/)).toBeInTheDocument();
  });

  it('renderiza o layout com navegação e link de pulo', () => {
    renderAt('/');
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para o conteúdo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Elementum/ })).toBeInTheDocument();
  });

  it('mostra "elemento não encontrado" para um símbolo não cadastrado', () => {
    renderAt('/elemento/Xx');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Elemento não encontrado' }),
    ).toBeInTheDocument();
  });

  it('mostra a página 404 para rotas desconhecidas', () => {
    renderAt('/nao-existe');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Página não encontrada' }),
    ).toBeInTheDocument();
  });
});
