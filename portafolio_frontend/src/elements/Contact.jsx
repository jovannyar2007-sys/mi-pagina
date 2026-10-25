// Muestra el formulario de contacto y conserva comentarios en este navegador.
import { useEffect, useState } from 'react';
import SectionTitle from './SectionTitle';

const STORAGE_KEY = 'portfolio-comments';

function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [comments, setComments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }, [comments]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return;
    }

    const newComment = {
      id: Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev].slice(0, 8));

    const subject = encodeURIComponent(
      `Mensaje desde el portafolio${trimmedName ? ` de ${trimmedName}` : ''}`
    );

    const body = encodeURIComponent(
      `Nombre: ${trimmedName}\nCorreo: ${trimmedEmail}\n\nMensaje:\n${trimmedMessage}`
    );

    window.location.href = `mailto:jovannyar2007@gmail.com?subject=${subject}&body=${body}`;
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contacto" className="section contact-section">
      <SectionTitle eyebrow="Contacto" title="Contacto" />

      <div className="contact-grid">
        <div className="contact-panel">
          <p className="contact-intro">¿Hablamos sobre tu próximo proyecto?</p>
          <div className="contact-meta">
            <p>jovannyar2007@gmail.com</p>
            <p>+58 412 922 4448</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-field">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Escribe tu mensaje..."
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary contact-submit">
            Enviar mensaje
          </button>

          <p className="save-note">
            Los mensajes se guardan en este navegador y también se abren en tu cliente de correo para llegar a jovannyar2007@gmail.com.
          </p>
        </form>
      </div>

      {comments.length > 0 && (
        <div className="comments-panel">
          <h4>Comentarios recientes</h4>
          <div className="comments-list">
            {comments.map((comment) => (
              <article key={comment.id} className="comment-item">
                <strong>{comment.name}</strong>
                <span>{comment.email}</span>
                <p>{comment.message}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Contact;
