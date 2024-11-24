import React, { useEffect, useState } from 'react';
import './Eliminar.css';

const Eliminar = ({ onClose }) => {
    const [message, setMessage] = useState(''); // Mensaje dinámico

    // Manejar el evento de la tecla "Escape"
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onClose]);

    // Acción para confirmar eliminación
    const handleConfirm = () => {
        setMessage('Lamentamos ver eso. Esperamos vuelvas en algún momento.');
        setTimeout(() => {
            onClose(); // Cierra el recuadro después de 3 segundos
        }, 3000);
    };

    // Acción para cancelar eliminación
    const handleCancel = () => {
        setMessage('¡Nos alegra ver eso!');
        setTimeout(() => {
            onClose(); // Cierra el recuadro después de 3 segundos
        }, 3000);
    };

    // Cerrar el recuadro al hacer clic fuera del modal
    const handleOverlayClick = (e) => {
        if (e.target.className === 'eliminar-overlay') {
            onClose();
        }
    };

    return (
        <>
            <div className="eliminar-overlay" onClick={handleOverlayClick}></div>
            <div className="eliminar-modal">
                <p className="eliminar-message">¿Estás seguro que quieres eliminar tu cuenta?</p>
                <div className="eliminar-buttons">
                    <button className="eliminar-confirm" onClick={handleConfirm}>
                        Confirmar
                    </button>
                    <button className="eliminar-cancel" onClick={handleCancel}>
                        Cancelar
                    </button>
                </div>
                {message && <p className="eliminar-feedback">{message}</p>}
            </div>
        </>
    );
};

export default Eliminar;
