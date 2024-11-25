import React, { useEffect, useState } from 'react';
import './Eliminar.css';

const Eliminar = ({ user }) => {
    const [message, setMessage] = useState(''); // Mensaje dinámico
    const [isModalVisible, setIsModalVisible] = useState(true); // Controlar la visibilidad del modal

    // Manejar el evento de la tecla "Escape" para cerrar el modal
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                setIsModalVisible(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    // Acción para confirmar eliminación
    const handleConfirm = async () => {
        if (!user || !user.id) {
            setMessage('Error: Usuario no identificado.');
            return;
        }

        try {
            const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/eliminar', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }), // Enviar el ID del usuario loggeado
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Tu cuenta ha sido eliminada. 😢');

                // Limpia los datos del usuario de localStorage o sessionStorage
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');

                // Mostrar el mensaje por 3 segundos antes de redirigir
                setTimeout(() => {
                    window.location.href = '/'; // Cambia '/' por la página que prefieras
                }, 3000);
            } else {
                setMessage('Hubo un problema al eliminar tu cuenta. Inténtalo más tarde.');
            }
        } catch (error) {
            console.error('Error eliminando la cuenta:', error);
            setMessage('Error en la conexión. Inténtalo más tarde.');
        }
    };

    // Acción para cancelar eliminación
    const handleCancel = () => {
        setMessage('¡Nos alegra ver eso!');
        setTimeout(() => {
            setIsModalVisible(false); // Ocultar el modal después de mostrar el mensaje
        }, 3000);
    };

    // Cerrar el modal al hacer clic fuera de él
    const handleOverlayClick = (e) => {
        if (e.target.className === 'eliminar-overlay') {
            setIsModalVisible(false);
        }
    };

    return isModalVisible ? (
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
                {message && <p className="eliminar-feedback">{message}</p>} {/* Mostrar el mensaje */}
            </div>
        </>
    ) : null;
};

export default Eliminar;

