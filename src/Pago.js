import React, { useState, useEffect, useCallback } from 'react';
import './Pago.css';

// Función para formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const Pago = ({ onClose, totalAmount, user, cartItems, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("Confirmar pago");
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodClick = (method) => {
    if (!formData.address.trim() || formData.phone.length !== 10) {
      alert("Por favor, completa todos los campos correctamente.");
    } else {
      setSelectedPaymentMethod(method);
      setConfirmationText(method === 'contraentrega' ? "Confirmar envío" : "Confirmar pago");
      setShowConfirmation(true);
    }
  };

  const handleConfirmPayment = async () => {
    const compraData = {
      id_usuario: user.id,
      tipo_pago: selectedPaymentMethod,
      productos: cartItems.map(item => ({
        id: item.id,
        cantidad: item.quantity,
      })),
      total: totalAmount,
      direccion: formData.address,
      telefono: formData.phone,
    };

    // Validación de datos antes de enviar
    if (!compraData.id_usuario || !compraData.tipo_pago || !compraData.direccion || !compraData.telefono) {
      alert('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/crear-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraData),
      });

      const result = await response.json();
      console.log(result); // Verificar la respuesta en la consola

      if (result.status === 'success') {
        setShowThankYouMessage(true); // Mostrar mensaje de agradecimiento
        onPaymentSuccess(); // Vaciar el carrito
      } else {
        alert('Error al procesar la compra: ' + (result.message || 'Inténtalo de nuevo.'));
      }
    } catch (error) {
      console.error('Error al crear la compra:', error);
      alert('Error al procesar la compra.');
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  // Cerrar el modal cuando se hace clic fuera de él o se presiona ESC
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("pago-overlay")) {
      onClose(); // Cierra el modal
    }
  };

  // Memorizamos la función handleKeyPress con useCallback
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Escape") {
      onClose(); // Cierra el modal cuando se presiona ESC
    }
  }, [onClose]); // Dependencia de onClose

  useEffect(() => {
    // Agregar event listener para la tecla ESC
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      // Limpiar el event listener cuando el componente se desmonte
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]); // Aseguramos que handleKeyPress se actualice correctamente

  return (
    <div className="pago-overlay" onClick={handleOutsideClick}>
      <div className="pago-modal">
        {showThankYouMessage ? (
          <div className="thank-you-message">
            <h2>GRACIAS por tu compra</h2>
            <p>Pronto nos pondremos en contacto contigo para confirmar el pago</p>
          </div>
        ) : showConfirmation ? (
          <div className="confirmation-modal">
            <h2>{confirmationText}</h2>
            <p>¿Estás seguro de que deseas proceder?</p>
            <p className="total-amount">Total a pagar: {formatCurrency(totalAmount)}</p>
            <div className="button-container">
              <button type="button" className="back-button" onClick={handleCloseConfirmation}>
                Volver
              </button>
              <button type="button" className="pay-button" onClick={handleConfirmPayment}>
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>Métodos de Pago</h2>
            <label className="address-label">
              Dirección de envío
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ingresa la dirección de envío"
                required
              />
            </label>
            <label className="phone-label">
              Número de Teléfono
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Número de 10 dígitos"
                maxLength="10"
                required
              />
            </label>
            <p>Selecciona tu método de pago preferido:</p>
            <div className="payment-options">
              <button
                className="payment-button"
                onClick={() => handlePaymentMethodClick('transferencia')}
                disabled={!formData.address.trim() || formData.phone.length !== 10}
              >
                Pago Electrónico
              </button>
              <button
                className="payment-button"
                onClick={() => handlePaymentMethodClick('contraentrega')}
                disabled={!formData.address.trim() || formData.phone.length !== 10}
              >
                Pago Contraentrega
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Pago;
