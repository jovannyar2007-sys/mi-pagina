// Presenta la marca del portafolio y el buscador de contenido.
import SearchBar from './SearchBar';

function Header({ search, onSearchChange }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-dot" />
        <span>Jovanny González</span>
      </div>

      <SearchBar value={search} onChange={onSearchChange} />
    </header>
  );
}

export default Header;
