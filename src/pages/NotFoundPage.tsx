import { Link } from 'react-router';
import { paths } from '@/app/paths';

export function NotFoundPage() {
  return (
    <section className="page" aria-labelledby="titulo-404">
      <h1 id="titulo-404" className="page__title">
        Página não encontrada
      </h1>
      <p className="page__lead">O endereço acessado não existe no Elementum.</p>
      <p>
        <Link to={paths.home}>Voltar à tabela periódica</Link>
      </p>
    </section>
  );
}
