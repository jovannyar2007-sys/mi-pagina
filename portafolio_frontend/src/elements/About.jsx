import SectionTitle from './SectionTitle';

function About() {
  return (
    <section id="sobre-mi" className="section">
      <SectionTitle eyebrow="Sobre mí" title="Sobre mí" />
      <div className="about-copy">
        <p>
          Hola, me llamo Jovanny, tengo 19 años y me gusta programar. Tengo
          conocimientos en JavaScript, CSS, HTML y Python. También tengo
          conocimientos en reparación de teléfonos, un poco de computadoras y
          microsoldadura.
        </p>
        <p>
          Me gusta mucho aprender cosas nuevas y la tecnología. Me interesa la
          programación y me gustaría aprender más sobre ella. También me gusta
          hacer ejercicio, escuchar música, nadar y pasar el tiempo en la playa.
        </p>
      </div>
    </section>
  );
}

export default About;
