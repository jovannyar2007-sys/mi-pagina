import SectionTitle from './SectionTitle';
import ProjectCard from './ProjectCard';

function Projects({ items = [] }) {
  return (
    <section id="proyectos" className="section">
      <SectionTitle eyebrow="Proyectos" title="Proyectos" />
      <div className="project-grid">
        {items.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.title}
            description={project.description}
            tags={project.tags}
            url={project.url}
          />
        ))}
      </div>
    </section>
  );
}

export default Projects;
