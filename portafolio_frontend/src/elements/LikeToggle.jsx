// Alterna el estado de "me gusta" y actualiza el texto del boton.
import { useState } from 'react';

function LikeToggle() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="like-toggle">
      <span>{isLiked ? '¡Me gusta!' : 'No me gusta'}</span>
      <button type="button" className="btn btn-secondary" onClick={() => setIsLiked((prev) => !prev)}>
        {isLiked ? 'Quitar me gusta' : 'Me gusta'}
      </button>
    </div>
  );
}

export default LikeToggle;
