// Hooks para guardar estado, ejecutar efectos y reutilizar cálculos.
import { useMemo, useState, useEffect } from 'react';
// Estilos generales de la aplicación.
import './styles/App.css';
// Componentes que componen la estructura y las secciones de la página.
import Navbar from './elements/Navbar';
import Header from './elements/HeaderLayout';
import Footer from './elements/Footer';
import Hero from './elements/Hero';
import About from './elements/About';
import Skills from './elements/Skills';
import ProjectCard from './elements/ProjectCard';
import SectionTitle from './elements/SectionTitle';
import Contact from './elements/Contact';
import AdminForm from './elements/AdminForm';
// Datos usados para la navegación, los proyectos y las habilidades.
import { navigation } from './data/navigation';
import { projects } from './data/projects';
import { skills } from './data/skills';
import { apiUrl, readApiJson } from './api';

function App() {
  const [accessMode, setAccessMode] = useState(null);
  const [adminAccount, setAdminAccount] = useState(null);
  // Sección resaltada en el menú, texto buscado y estado del menú móvil.
  const [activeSection, setActiveSection] = useState('inicio');
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectItems, setProjectItems] = useState(projects);
  const [projectsError, setProjectsError] = useState('');
  const visibleNavigation = useMemo(
    () => (accessMode === 'admin'
      ? [
        ...navigation.filter((item) => item.id === 'administracion'),
        ...navigation.filter((item) => item.id !== 'administracion'),
      ]
      : navigation.filter((item) => item.id !== 'administracion')),
    [accessMode]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrl('/api/projects'), { signal: controller.signal })
      .then(async (response) => {
        const data = await readApiJson(response);
        if (!response.ok) {
          throw new Error(data.error || 'No se pudieron cargar los proyectos guardados.');
        }
        if (!Array.isArray(data)) {
          throw new Error('La respuesta del servidor para los proyectos no es válida.');
        }
        setProjectItems([
          ...projects,
          ...data.map((project) => ({ ...project, id: project._id })),
        ]);
        setProjectsError('');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setProjectsError(
          error instanceof TypeError
            ? 'No se pudieron cargar los proyectos nuevos desde el servidor.'
            : error.message
        );
      });

    return () => controller.abort();
  }, []);

  // Filtra proyectos por título, descripción o etiqueta.
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projectItems;

    return projectItems.filter((project) => {
      const hayCoincidenciaTitulo = project.title.toLowerCase().includes(query);
      const hayCoincidenciaDescripcion = project.description.toLowerCase().includes(query);
      const hayCoincidenciaTag = project.tags.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      return hayCoincidenciaTitulo || hayCoincidenciaDescripcion || hayCoincidenciaTag;
    });
  }, [projectItems, search]);

  // Filtra las habilidades por nombre usando el mismo texto de búsqueda.
  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return skills;

    return skills.filter((skill) =>
      skill.name.toLowerCase().includes(query)
    );
  }, [search]);

  // Detecta qué sección está visible y actualiza el elemento activo del menú.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        threshold: [0.35, 0.7],
      }
    );

    visibleNavigation.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [visibleNavigation]);

  // Desplaza hasta una sección elegida y cierra el menú móvil.
  const handleNavigate = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const handleReturnToAccess = () => {
    setAccessMode(null);
    setMobileMenuOpen(false);
  };

  if (accessMode === null || accessMode === 'admin-login') {
    return (
      <main className="access-screen">
        <section className="access-card">
          {accessMode === null ? (
            <>
              <p className="eyebrow">Portafolio personal</p>
              <h1>¿Cómo deseas entrar?</h1>
              <p className="access-description">
                Puedes explorar el portafolio como invitado o ingresar como administrador.
              </p>
              <div className="access-options">
                <button
                  className="access-option"
                  type="button"
                  onClick={() => setAccessMode('guest')}
                >
                  <strong>Invitado</strong>
                  <span>Ver el portafolio sin el panel de administración.</span>
                </button>
                <button
                  className="access-option"
                  type="button"
                  onClick={() => setAccessMode(adminAccount ? 'admin' : 'admin-login')}
                >
                  <strong>Administrador</strong>
                  <span>Iniciar sesión para administrar proyectos.</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                className="access-back"
                type="button"
                onClick={() => setAccessMode(null)}
              >
                Volver
              </button>
              <AdminForm
                loginOnly
                onAdminLogin={(admin) => {
                  setAdminAccount(admin);
                  setActiveSection('administracion');
                  setAccessMode('admin');
                }}
              />
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    // Contenedor general; la clase cambia si el menú móvil está abierto.
    <div className={`app-shell ${mobileMenuOpen ? 'menu-open' : ''}`}>
      {/* Navegación lateral y control para abrir o cerrar el menú. */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        items={visibleNavigation}
        isOpen={mobileMenuOpen}
        onToggle={() => setMobileMenuOpen((prev) => !prev)}
        onReturnToAccess={handleReturnToAccess}
      />

      <div className="app-content">
        {/* Cabecera con buscador conectado al estado search. */}
        <Header search={search} onSearchChange={setSearch} />

        {/* Contenido principal del portafolio. */}
        <main className="main-content">
          {accessMode === 'admin' && (
            <AdminForm
              authenticatedAdmin={adminAccount}
              onAdminLogout={() => {
                setAdminAccount(null);
                setAccessMode('guest');
                setActiveSection('inicio');
              }}
              onProjectCreated={(project) => {
                setProjectItems((current) => [...current, { ...project, id: project._id }]);
                setProjectsError('');
              }}
              onProjectDeleted={(projectId) => {
                setProjectItems((current) => current.filter((project) => project.id !== projectId));
              }}
            />
          )}

          {/* Presentación principal. */}
          <Hero />

          {/* Información sobre el propietario del portafolio. */}
          <About />

          {/* Habilidades filtradas según lo escrito en el buscador. */}
          <Skills skills={filteredSkills} />

          {/* Muestra los proyectos encontrados o un aviso si no hay resultados. */}
          <section id="proyectos" className="section">
            <SectionTitle eyebrow="Proyectos" title="Proyectos" />
            {filteredProjects.length > 0 ? (
              <div className="project-grid">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.description}
                    tags={project.tags}
                    url={project.url}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">No se encontraron resultados para tu búsqueda.</div>
            )}
          </section>
          {projectsError && <p className="projects-load-error" role="status">{projectsError}</p>}

          {/* Formas de ponerse en contacto. */}
          <Contact />
        </main>

        {/* Acceso flotante para iniciar una conversación por WhatsApp. */}
        <a
          href="https://wa.me/584129224448?text=Hola%20Jovanny%2C%20me%20gustar%C3%ADa%20hablar%20sobre%20un%20proyecto."
          className="whatsapp-float"
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por WhatsApp"
        >
          <span>WhatsApp</span>
        </a>

        {/* Pie de página. */}
        <Footer />
      </div>
    </div>
  );
}

// Permite importar este componente desde el punto de entrada de React.
export default App;
