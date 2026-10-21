function Boton({ texto, color }) {
  return (
    <button className={`btn neon ${color}`}>
      {texto}
    </button>
  );
}

export default Boton;