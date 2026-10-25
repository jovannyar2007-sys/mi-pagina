// Mantiene el mismo formato para los titulos de las secciones.
function SectionTitle({ eyebrow, title, align = 'left' }) {
  return (
    <div className={`section-title ${align === 'center' ? 'center' : ''}`}>
      {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
      <h3>{title}</h3>
    </div>
  );
}

export default SectionTitle;
