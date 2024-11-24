import React, { useContext, useState } from 'react';
import { CartContext } from './CartContext';
import './CartPage.css';
import { useNavigate } from 'react-router-dom';
import Pago from './Pago';

const CartPage = ({ user, onLoginClick, onLogoutClick }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [showPago, setShowPago] = useState(false);

  const handlePaymentClick = () => {
    setShowPago(true);
  };

  const closePago = () => {
    setShowPago(false);
  };

  const onPaymentSuccess = () => {
    clearCart();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return formatCurrency(price);
    } else if (typeof price === 'string') {
      return formatCurrency(parseFloat(price.replace('$', '')) || 0);
    } else {
      console.error('Formato de precio inválido:', price);
      return formatCurrency(0);
    }
  };

  const getTotalCost = () => {
    return cartItems.reduce((total, item) => {
      let price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace('$', '')) || 0 
        : item.price || 0;
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const totalCost = getTotalCost();
  const iva = totalCost * 0.19;  // IVA 19%
  const priceWithoutIva = totalCost - iva;  // Precio sin IVA

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="logo-button" onClick={() => navigate('/')}>
          <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
          <span className="navbar-title">BUILD-YOUR-TECH</span>
        </button>
        <button className="back-button" onClick={() => navigate('/sales')}>X</button>
      </div>
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <p className="empty-cart-message">No hay productos en el carrito.</p>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item, index) => {
                const itemTotalCost = item.price * item.quantity; // Calcular costo total del producto
                const itemIva = itemTotalCost * 0.19; // IVA 19% para este producto
                const itemPriceWithoutIva = itemTotalCost - itemIva; // Precio sin IVA para este producto

                return (
                  <div key={index} className="cart-item">
                    <div className="cart-item-left">
                      <img src={item.img} alt={item.description} className="cart-item-img" />
                      <div className="cart-item-details">
                        <p className="cart-item-description">{item.description}</p>
                        <p>Precio sin IVA: {formatPrice(itemPriceWithoutIva)}</p>
                        <p>IVA (19%): {formatPrice(itemIva)}</p>
                        <p className="cart-item-price">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="remove-button" onClick={() => removeFromCart(index)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
              {/* Mostrar Precio y IVA en la misma línea */}
              <div className="cart-summary">
              <h3><p>Precio: {formatCurrency(priceWithoutIva)} </p>
                <p>IVA (19%): {formatCurrency(iva)}</p>
                </h3>
              </div>
              <div className="cart-summary">
              <h3>Total: {formatCurrency(totalCost)}</h3>
              <button className="payment-button" onClick={handlePaymentClick}>Pagar</button>
            </div>
          </>
        )}
      </div>
      {showPago && (
        <Pago
          onClose={closePago}
          totalAmount={totalCost}
          user={user}
          cartItems={cartItems}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
};

export default CartPage;
