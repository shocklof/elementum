import { catalog, getCompleteness } from '@/data/catalog';

export function HomePage() {
  const { registered, expected } = getCompleteness(catalog);

  return (
    <section className="page" aria-labelledby="titulo-home">
      <h1 id="titulo-home" className="page__title">
        Tabela periódica
      </h1>
      <p className="page__lead">
        Explore os 118 elementos químicos, suas propriedades e seus modelos atômicos.
      </p>
      <div className="panel">
        <h2 className="panel__title">Em construção</h2>
        <p>
          A tabela interativa será implementada nas próximas etapas. Elementos cadastrados:{' '}
          <strong>
            {registered} de {expected}
          </strong>
          .
        </p>
      </div>
    </section>
  );
}
