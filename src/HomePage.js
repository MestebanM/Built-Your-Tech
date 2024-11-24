import React, { useState } from 'react';
import './App.css';
import { Link, useNavigate } from 'react-router-dom';
import Eliminar from './Eliminar';


function HomePage({ onLoginClick, user, onLogoutClick, onRegisterClick }) {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);

  const handleEliminarClose = () => {
    setShowEliminar(false);
  };
  

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const isAdmin = user && user.role === 1; // Verifica si el rol es 'Admin'

  const handleTryNowClick = () => {
    if (user) {
      navigate('/chat'); // Redirige a la página de chat si está autenticado
    } else {
      onLoginClick(); // Muestra el modal de inicio de sesión si no está autenticado
    }
  };

  return (
    <div className="App">
      <header className="navbar">
        <div className="logo-container">
          <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
          <span className="navbar-title">BUILD-YOUR-TECH</span>
        </div>

        <div className="header-buttons">
          <Link to="/sales" className="catalog-link">
            ¿Ya nos conoces? Accede a nuestro catálogo
          </Link>

          {user ? (
            <div className="user-info">
              <button className="user-name" onClick={toggleDropdown}>
                {user.name}
              </button>
              {dropdownVisible && (
                <div className="dropdown-menu">
                  {isAdmin && (
                    <>
                      <Link to="/add-product">
                        <button className="dropdown-item">Productos</button>
                      </Link>
                      <Link to="/users">
                        <button className="dropdown-item">Usuarios</button>
                      </Link>
                    </>
                  )}
                  <button className="dropdown-item" onClick={onLogoutClick}>
                    Cerrar sesión
                  </button>
                  <button className="dropdown-item" onClick={() => setShowEliminar(true)}>Eliminar cuenta</button>
                </div>
              )}
              {showEliminar && <Eliminar onClose={handleEliminarClose} />}
            </div>
          ) : (
            <>
              <button className="login-button" onClick={onLoginClick}>
                INICIAR SESIÓN
              </button>
              <button
                className="register-button"
                onClick={onRegisterClick} // Abre el modal correcto desde App.js
              >
                REGISTRARSE
              </button>
            </>
          )}
        </div>
      </header>

      <div className="welcome-container">
        <div className="welcome-content">
          <img src="/IAlogo.png" alt="Asesoría IA" className="welcome-logo" />
          <h1 className="welcome-title">Bienvenido a BUILD-YOUR-TECH</h1>
          <p className="welcome-description">
            ¿BUSCAS UNA COMPUTADORA QUE SE AJUSTE A TUS NECESIDADES? Nuestra IA analizará
            tus requerimientos para ofrecerte recomendaciones personalizadas.
          </p>
          <div className="welcome-buttons">
            <button className="welcome-button" onClick={handleTryNowClick}>
              Probar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
