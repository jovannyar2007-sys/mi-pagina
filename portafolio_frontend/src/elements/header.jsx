// Encabezado sencillo que muestra un saludo personalizado.
function Header({ nombre = 'Jovanny' }) {
  return (
    <header className="site-header">
      <h1>Bienvenido, {nombre}</h1>
    </header>
  );
}

export default Header;