// Muestra la navegacion lateral y permite cambiar entre secciones.
import { navigation } from '../data/navigation';

function Navbar({
  activeSection,
  onNavigate,
  isOpen,
  onToggle,
  onReturnToAccess,
  items = navigation,
}) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-block">
          <span className="brand-mark">J</span>
          <div>
            <p className="brand-label">Portafolio</p>
            <h2>Jovanny</h2>
          </div>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Abrir menú"
          onClick={onToggle}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`sidebar-nav ${isOpen ? 'show' : ''}`} aria-label="Navegación lateral">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeSection === item.id ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button className="nav-item access-nav-item" type="button" onClick={onReturnToAccess}>
          Cambiar acceso
        </button>
      </nav>
    </aside>
  );
}

export default Navbar;
