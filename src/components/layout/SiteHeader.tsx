import { Atom, Grid3x3 } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { paths } from '@/app/paths';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to={paths.home} className="brand" aria-label="Elementum — página inicial">
          <Atom className="brand__icon" aria-hidden="true" />
          <span className="brand__name">Elementum</span>
        </Link>
        <nav aria-label="Principal">
          <NavLink to={paths.home} end className="nav-link">
            <Grid3x3 size={16} aria-hidden="true" />
            Tabela periódica
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
