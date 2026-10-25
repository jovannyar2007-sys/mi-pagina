// Presenta la cantidad de mensajes en una insignia.
function NotificationBadge({ count = 0 }) {
  return (
    <div className="notification-pill" aria-live="polite">
      <span className="notification-title">Mensajes</span>
      <strong>{count}</strong>
    </div>
  );
}

export default NotificationBadge;
