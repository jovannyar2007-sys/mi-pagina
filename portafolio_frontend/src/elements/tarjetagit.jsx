import { useState, useEffect } from 'react';

function ListaGit() {
  const [repositorios, setRepositorios] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://api.github.com/users/SlinkAlex/repos')
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudieron cargar los repositorios');
        }
        return response.json();
      })
      .then((data) => setRepositorios(data))
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar los repositorios en este momento.');
      });
  }, []);

  return (
    <div>
      {error ? <p>{error}</p> : null}
      {!error && repositorios.length === 0 ? <p>Cargando repositorios...</p> : null}
      {repositorios.map((repo) => (
        <div key={repo.id}>
          <h2>{repo.name}</h2>
          <p>{repo.html_url}</p>
        </div>
      ))}
    </div>
  );
}

export default ListaGit;