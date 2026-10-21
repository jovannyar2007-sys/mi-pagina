import { useEffect, useState } from 'react';
import SectionTitle from './SectionTitle';
import { apiUrl, readApiJson } from '../api';

const emptyProject = {
  title: '',
  description: '',
  tags: '',
  url: '',
};

function AdminForm({
  onProjectCreated,
  onProjectDeleted,
  authenticatedAdmin = null,
  onAdminLogin,
  onAdminLogout,
  loginOnly = false,
}) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [admin, setAdmin] = useState(authenticatedAdmin);
  const [adminProjects, setAdminProjects] = useState([]);
  const [project, setProject] = useState(emptyProject);
  const [pending, setPending] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!admin || loginOnly) return undefined;

    const controller = new AbortController();
    fetch(apiUrl('/api/projects'), { signal: controller.signal })
      .then(async (response) => {
        const data = await readApiJson(response);
        if (!response.ok || !Array.isArray(data)) {
          throw new Error(data.error || 'No se pudieron cargar los proyectos para administrar.');
        }
        setAdminProjects(data);
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;
        setError(
          requestError instanceof TypeError
            ? 'No se pudo conectar con el servidor para cargar los proyectos.'
            : requestError.message
        );
      });

    return () => controller.abort();
  }, [admin, loginOnly]);

  const updateCredentials = (event) => {
    setCredentials((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateProject = (event) => {
    setProject((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo iniciar sesión como administrador.');
      }

      setAdmin(data.admin);
      setCredentials({ email: '', password: '' });
      if (loginOnly) {
        onAdminLogin(data.admin);
        return;
      }
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

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');
    setSuccess('');

    const projectData = {
      title: project.title.trim(),
      description: project.description.trim(),
      tags: project.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      url: project.url.trim(),
    };

    try {
      const response = await fetch(apiUrl('/api/projects'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo guardar el proyecto.');
      }

      setAdminProjects((current) => [data, ...current]);
      onProjectCreated(data);
      setProject(emptyProject);
      setSuccess('Proyecto agregado y guardado en MongoDB.');
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el servidor. Inténtalo de nuevo.'
          : requestError.message
      );
    } finally {
      setPending(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`¿Eliminar el proyecto "${project.title}"?`)) return;

    setDeletingProjectId(project._id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(apiUrl(`/api/projects/${project._id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo eliminar el proyecto.');
      }

      setAdminProjects((current) => current.filter((item) => item._id !== project._id));
      onProjectDeleted(project._id);
      setSuccess('Proyecto eliminado.');
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el servidor. Inténtalo de nuevo.'
          : requestError.message
      );
    } finally {
      setDeletingProjectId('');
    }
  };

  const handleLogout = async () => {
    setPending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(apiUrl('/api/admin/logout'), {
        method: 'POST',
        credentials: 'include',
      });
      const data = await readApiJson(response);
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo cerrar la sesión.');
      }
      setAdmin(null);
      setAdminProjects([]);
      onAdminLogout();
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el servidor para cerrar la sesión.'
          : requestError.message
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section id="administracion" className="section admin-section">
      <SectionTitle
        eyebrow="Administración"
        title={loginOnly ? 'Acceso de administrador' : 'Administrar proyectos'}
      />
      <div className="admin-card">
        {admin && !loginOnly ? (
          <>
            <div className="admin-heading">
              <div>
                <p className="account-kicker">Sesión de administrador</p>
                <p className="admin-email">{admin.email}</p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={handleLogout} disabled={pending}>
                Cerrar sesión
              </button>
            </div>
            <form className="admin-form" onSubmit={handleCreateProject}>
              <label className="account-field">
                Nombre del proyecto
                <input
                  name="title"
                  value={project.title}
                  onChange={updateProject}
                  maxLength={120}
                  required
                />
              </label>
              <label className="account-field">
                Descripción
                <textarea
                  name="description"
                  value={project.description}
                  onChange={updateProject}
                  maxLength={1000}
                  rows={4}
                  required
                />
              </label>
              <label className="account-field">
                Tecnologías o etiquetas
                <input
                  name="tags"
                  value={project.tags}
                  onChange={updateProject}
                  placeholder="React, CSS, Node.js"
                />
                <span className="account-hint">Escribe las etiquetas separadas por comas.</span>
              </label>
              <label className="account-field">
                Enlace del proyecto (opcional)
                <input
                  type="url"
                  name="url"
                  value={project.url}
                  onChange={updateProject}
                  placeholder="https://ejemplo.com"
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={pending}>
                {pending ? 'Guardando...' : 'Agregar proyecto'}
              </button>
            </form>
            {error && <p className="account-error" role="alert">{error}</p>}
            {success && <p className="admin-success" role="status">{success}</p>}
            <div className="admin-projects">
              <h3>Proyectos guardados</h3>
              {adminProjects.length ? (
                <ul className="admin-project-list">
                  {adminProjects.map((item) => (
                    <li className="admin-project-item" key={item._id}>
                      <span>{item.title}</span>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => handleDeleteProject(item)}
                        disabled={pending || Boolean(deletingProjectId)}
                      >
                        {deletingProjectId === item._id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin-intro">Todavía no hay proyectos guardados.</p>
              )}
            </div>
          </>
        ) : (
          <form className="admin-form" onSubmit={handleLogin}>
            <p className="admin-intro">
              Inicia sesión con la cuenta configurada como administradora para agregar proyectos
              al portafolio.
            </p>
            <label className="account-field">
              Correo electrónico
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={credentials.email}
                onChange={updateCredentials}
                required
              />
            </label>
            <label className="account-field">
              Contraseña
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={updateCredentials}
                required
              />
            </label>
            {error && <p className="account-error" role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default AdminForm;
