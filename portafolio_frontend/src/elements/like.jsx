import { useState } from 'react';

function Like() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div>
      <h2>{isLiked ? '¡Me gusta!' : 'No me gusta'}</h2>
      <button onClick={() => setIsLiked((prev) => !prev)}>
        {isLiked ? 'Quitar me gusta' : 'Me gusta'}
      </button>
    </div>
  );
}

export default Like;