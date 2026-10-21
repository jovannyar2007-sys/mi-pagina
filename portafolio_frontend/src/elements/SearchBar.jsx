function SearchBar({ value, onChange }) {
  return (
    <label className="search-bar" aria-label="Buscar contenido">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10.5 3a7.5 7.5 0 015.96 12.56l4.44 4.44 1.41-1.41-4.44-4.44A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"/>
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar proyectos o tecnologías..."
      />
    </label>
  );
}

export default SearchBar;
