// Ejemplo de inicio y cierre de sesion con un estado local.
import { useState } from 'react';

function Saludo() {
    const [isloggedIn, setIsLoggedIn] = useState(false);

    return (
        <div>
            {isloggedIn ? (
                <h1>Bienvenido de nuevo!</h1>
            ) : (
                <p>Por favor, inicia sesión.</p>
            )}
            <button onClick={() => setIsLoggedIn(!isloggedIn)}>
                {isloggedIn ? 'Cerrar Sesión' : 'Iniciar Sesión'}
            </button>
        </div>
    )
}

export default Saludo;