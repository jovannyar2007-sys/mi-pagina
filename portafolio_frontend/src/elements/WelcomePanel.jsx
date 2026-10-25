// Agrupa controles de bienvenida, notificaciones y "me gusta".
import NotificationBadge from './NotificationBadge';
import LikeToggle from './LikeToggle';

function WelcomePanel({ onOpenAccount }) {
  return (
    <section className="welcome-panel section">
      <div className="welcome-panel__content">
        <div className="welcome-panel__actions">
          <button type="button" className="btn btn-primary" onClick={onOpenAccount}>
            Iniciar Sesión
          </button>
          <NotificationBadge count={7} />
          <LikeToggle />
        </div>
      </div>
    </section>
  );
}

export default WelcomePanel;
