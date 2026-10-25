// Desplaza la pagina suavemente al inicio cuando se monta el componente.
import { useEffect } from 'react';

function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return null;
}

export default ScrollToTop;
