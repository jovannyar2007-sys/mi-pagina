import { useEffect, useState } from 'react';
import { apiUrl, readApiJson } from '../api';

const collections = [
  { id: 'peliculas', label: 'Películas' },
  { id: 'cines', label: 'Cines' },
  { id: 'comentarios', label: 'Comentarios' },
];

const emptyCollection = {
  items: [],
  page: 1,
  pages: 0,
  total: 0,
  loading: true,
  error: '',
};

function Account({ onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [activeCollection, setActiveCollection] = useState('peliculas');
  const [catalogs, setCatalogs] = useState(() =>
    Object.fromEntries(collections.map(({ id }) => [id, emptyCollection]))
  );
  const isRegistration = mode === 'register';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!user) return undefined;

    const controller = new AbortController();
    const loadInitialPages = async () => {
      await Promise.all(collections.map(async ({ id }) => {
        try {
          const response = await fetch(apiUrl(`/api/catalogo/${id}?page=1`), {
            signal: controller.signal,
          });
          const data = await readApiJson(response);

          if (!response.ok) {
            throw new Error(data.error || `No se pudo cargar ${id}.`);
          }

          setCatalogs((current) => ({
            ...current,
            [id]: { ...data, loading: false, error: '' },
          }));
        } catch (catalogError) {
          if (catalogError.name === 'AbortError') return;

          setCatalogs((current) => ({
            ...current,
            [id]: {
              ...current[id],
              loading: false,
              error: catalogError instanceof TypeError
                ? 'No se pudo conectar con el servidor.'
                : catalogError.message,
            },
          }));
        }
      }));
    };

    loadInitialPages();
    return () => controller.abort();
  }, [user]);

  const loadPage = async (collectionId, page) => {
    setCatalogs((current) => ({
      ...current,
      [collectionId]: { ...current[collectionId], loading: true, error: '' },
    }));

    try {
      const response = await fetch(apiUrl(`/api/catalogo/${collectionId}?page=${page}`));
      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los datos.');
      }

      setCatalogs((current) => ({
        ...current,
        [collectionId]: { ...data, loading: false, error: '' },
      }));
    } catch (catalogError) {
      setCatalogs((current) => ({
        ...current,
        [collectionId]: {
          ...current[collectionId],
          loading: false,
          error: catalogError instanceof TypeError
            ? 'No se pudo conectar con el servidor.'
            : catalogError.message,
        },
      }));
    }
  };

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setForm((current) => ({ ...current, password: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPending(true);

    try {
      const response = await fetch(apiUrl(isRegistration ? '/api/users' : '/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegistration
            ? form
            : { email: form.email, password: form.password }
        ),
      });
      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo completar la solicitud.');
      }

      setUser(data);
      setForm({ nombre: '', email: '', password: '' });
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el servidor. Comprueba que el backend y MongoDB estén iniciados.'
          : requestError.message
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="account-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="account-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
      >
        <button
          className="account-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de cuenta"
        >
          ×
        </button>
        <div className="account-card">
          {user ? (
            <div className="account-dashboard" aria-live="polite">
              <div className="account-profile">
                <span className="account-avatar" aria-hidden="true">
                  {(user.nombre || user.name || 'U').charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="account-kicker">Sesión iniciada</p>
                  <h4 id="account-title">¡Hola, {user.nombre || user.name}!</h4>
                  <p className="account-email">{user.email}</p>
                </div>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setUser(null)}
                >
                  Cerrar sesión
                </button>
              </div>
              <div className="catalog-section">
                <div className="catalog-heading">
                  <p className="account-kicker">Base de datos sample_mflix</p>
                  <h4>Explora la información</h4>
                </div>
                <div className="catalog-tabs" role="tablist" aria-label="Colecciones de MongoDB">
                  {collections.map(({ id, label }) => (
                    <button
                      key={id}
                      id={`${id}-tab`}
                      type="button"
                      role="tab"
                      aria-selected={activeCollection === id}
                      aria-controls="catalog-panel"
                      className={activeCollection === id ? 'catalog-tab active' : 'catalog-tab'}
                      onClick={() => setActiveCollection(id)}
                    >
                      {label}
                      {catalogs[id].loading ? '' : ` (${catalogs[id].total})`}
                    </button>
                  ))}
                </div>
                <div
                  id="catalog-panel"
                  className="catalog-panel"
                  role="tabpanel"
                  aria-labelledby={`${activeCollection}-tab`}
                >
                  {catalogs[activeCollection].loading ? (
                    <p className="catalog-status" role="status">Cargando información...</p>
                  ) : catalogs[activeCollection].error ? (
                    <p className="account-error" role="alert">
                      {catalogs[activeCollection].error}
                    </p>
                  ) : catalogs[activeCollection].items.length === 0 ? (
                    <p className="catalog-status">Esta colección no contiene documentos.</p>
                  ) : (
                    <div className="catalog-list">
                      {catalogs[activeCollection].items.map((item, index) => (
                        <details className="catalog-item" key={item._id || index}>
                          <summary>
                            {item.title || item.name || item.text || item._id || `Registro ${index + 1}`}
                          </summary>
                          <pre>{JSON.stringify(item, null, 2)}</pre>
                        </details>
                      ))}
                    </div>
                  )}
                  {!catalogs[activeCollection].loading &&
                    !catalogs[activeCollection].error &&
                    catalogs[activeCollection].pages > 1 && (
                      <div className="catalog-pagination">
                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={catalogs[activeCollection].page <= 1}
                          onClick={() => loadPage(activeCollection, catalogs[activeCollection].page - 1)}
                        >
                          Anterior
                        </button>
                        <span>
                          Página {catalogs[activeCollection].page} de {catalogs[activeCollection].pages}
                        </span>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={catalogs[activeCollection].page >= catalogs[activeCollection].pages}
                          onClick={() => loadPage(activeCollection, catalogs[activeCollection].page + 1)}
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="account-heading">
                <p className="account-kicker">Tu espacio</p>
                <h4 id="account-title">
                  {isRegistration ? 'Crear una cuenta' : 'Qué bueno verte de nuevo'}
                </h4>
                <p>
                  {isRegistration
                    ? 'Tus datos se guardarán de forma segura en MongoDB.'
                    : 'Inicia sesión con el correo y la contraseña de tu cuenta.'}
                </p>
              </div>

              <div className="account-tabs" role="tablist" aria-label="Acceso a la cuenta">
                <button
                  id="login-tab"
                  type="button"
                  role="tab"
                  aria-selected={!isRegistration}
                  aria-controls="account-panel"
                  className={!isRegistration ? 'account-tab active' : 'account-tab'}
                  onClick={() => changeMode('login')}
                >
                  Iniciar sesión
                </button>
                <button
                  id="register-tab"
                  type="button"
                  role="tab"
                  aria-selected={isRegistration}
                  aria-controls="account-panel"
                  className={isRegistration ? 'account-tab active' : 'account-tab'}
                  onClick={() => changeMode('register')}
                >
                  Crear cuenta
                </button>
              </div>

              <form
                id="account-panel"
                className="account-form"
                onSubmit={handleSubmit}
                aria-labelledby={isRegistration ? 'register-tab' : 'login-tab'}
              >
                {isRegistration && (
                  <label className="account-field">
                    Nombre
                    <input
                      type="text"
                      name="nombre"
                      autoComplete="name"
                      value={form.nombre}
                      onChange={updateField}
                      required
                      maxLength={100}
                    />
                  </label>
                )}
                <label className="account-field">
                  Correo electrónico
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField}
                    required
                  />
                </label>
                <label className="account-field">
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    autoComplete={isRegistration ? 'new-password' : 'current-password'}
                    value={form.password}
                    onChange={updateField}
                    required
                    minLength={isRegistration ? 8 : undefined}
                  />
                  {isRegistration && (
                    <span className="account-hint">Usa al menos 8 caracteres.</span>
                  )}
                </label>
                {error && (
                  <p className="account-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="btn btn-primary account-submit" type="submit" disabled={pending}>
                  {pending
                    ? 'Procesando...'
                    : isRegistration
                      ? 'Crear cuenta'
                      : 'Iniciar sesión'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Account;
