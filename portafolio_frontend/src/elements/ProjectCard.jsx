function ProjectCard({ title, description, tags, url }) {
  return (
    <article className="project-card">
      <div className="project-card-header">
        <span className="project-badge">Proyecto</span>
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="tag-list">
        {tags.map((tag) => (
          <span key={tag} className="tag-item">{tag}</span>
        ))}
      </div>
      {url && (
        <a className="project-link" href={url} target="_blank" rel="noreferrer">
          Ver proyecto
        </a>
      )}
    </article>
  );
}

export default ProjectCard;
