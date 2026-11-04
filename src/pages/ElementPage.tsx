import { Link, useParams } from 'react-router';
import { paths } from '@/app/paths';
import { catalog, findElementBySymbol } from '@/data/catalog';

export function ElementPage() {
  const { symbol = '' } = useParams();
  const element = findElementBySymbol(catalog, symbol);

  if (!element) {
    return (
      <section className="page" aria-labelledby="titulo-elemento">
        <h1 id="titulo-elemento" className="page__title">
          Elemento não encontrado
        </h1>
        <p className="page__lead">Não há nenhum elemento cadastrado com o símbolo “{symbol}”.</p>
        <p>
          <Link to={paths.home}>Voltar à tabela periódica</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="page" aria-labelledby="titulo-elemento">
      <h1 id="titulo-elemento" className="page__title">
        {element.name} ({element.symbol})
      </h1>
      <div className="panel">
        <h2 className="panel__title">Em construção</h2>
        <p>A página completa do elemento será implementada nas próximas etapas.</p>
      </div>
    </section>
  );
}
