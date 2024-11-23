import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Calificacion.css';

const Calificacion = ({ product, closeModal, user }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const modalRef = useRef(null);

  // Cargar comentarios al abrir el modal
  useEffect(() => {
    if (product) {
      fetch(`https://bdbuildyourteach.dtechne.com/backend/comments/${product.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setComments(data.comments);
          }
        })
        .catch(err => console.error('Error al cargar comentarios:', err));
    }
  }, [product]);

  const handleRatingClick = (rating) => {
    setRating(rating);
  };

  const handleCommentSubmit = () => {
    if (!user) {
      alert('Debes iniciar sesión para dejar un comentario.');
      return;
    }
    if (!comment.trim()) {
      alert('El comentario no puede estar vacío.');
      return;
    }

    const payload = {
      productId: product.id,
      userId: user.id,
      rating,
      comment,
    };

    fetch('https://bdbuildyourteach.dtechne.com/backend/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Comentario enviado correctamente.');
          setComments([...comments, { USUARIO: user.name, VALORACION: rating, COMENTARIO: comment }]);
          setComment('');
          setRating(0); // Resetear calificación después de enviar
        } else {
          alert('Error al enviar el comentario.');
        }
      })
      .catch(err => console.error('Error al enviar comentario:', err));
  };

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  }, [closeModal]);

  const handleEscPress = useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscPress);
    };
  }, [handleClickOutside, handleEscPress]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>{product.nombre}</h2>
        <p><strong>Descripción:</strong> {product.descripcion}</p>
        <p><strong>Precio:</strong> {product.precio}</p>
        {product && (
          <>
            <p><strong>Procesador:</strong> {product.procesador}</p>
            <p><strong>RAM:</strong> {product.ram}</p>
            <p><strong>Almacenamiento:</strong> {product.almacenamiento}</p>
            <p><strong>Gráfica:</strong> {product.grafica}</p>
          </>
        )}
  
        {/* Estrellas para la calificación */}
        <div className="product-rating">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`star ${index < rating ? 'filled' : ''}`}
              onClick={() => handleRatingClick(index + 1)}
            >
              &#9733;
            </span>
          ))}
        </div>
  
        <h3>Califica este producto</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe tu comentario aquí..."
        />
        <button onClick={handleCommentSubmit}>Enviar Calificación</button>
  
        <div className="previous-comments">
          <h3>Comentarios Anteriores:</h3>
          {comments.length > 0 ? (
            comments.map((com, index) => (
              <div key={index} className="comment-card">
                <p><strong>{com.USUARIO}</strong> <span>{'★'.repeat(com.VALORACION)}</span></p>
                <p>{com.COMENTARIO}</p>
              </div>
            ))
          ) : (
            <p>No hay comentarios para este producto aún.</p>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default Calificacion;
