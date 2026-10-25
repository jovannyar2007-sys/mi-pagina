// Muestra un aviso cuando hay mensajes nuevos sin leer.
function Mensaje({mensajesNuevos}) {
    return (
        <div>
            <h1>tus mensajes</h1>
            {mensajesNuevos > 0 &&(<h2>tienes {mensajesNuevos} mensajes sin leer</h2>)}
        </div>
    );
}

export default Mensaje; 