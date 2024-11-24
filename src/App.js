import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { IAProvider } from './IAContext';
import { CartContext } from './CartContext';
import HomePage from './HomePage';
import SalesPage from './SalesPage';
import ChatPage from './ChatPage';
import CartPage from './CartPage';
import AddProductPage from './AddProductPage';
import Cambiocontra from './Cambiocontra';
import ProtectedRoute from './ProtectedRoute';
import UsersPage from './UsersPage';
import { FaSignOutAlt } from 'react-icons/fa';
import ReCAPTCHA from "react-google-recaptcha";
import Compra from './Compra';
import CaraCompra from './CaraCompra';
import GraficasPage from './graficasPage';
import GraficasPage2 from './graficasPage2';
import GraficasPage3 from './graficasPage3';



function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const { clearCart } = useContext(CartContext);
  const [isRegistering, setIsRegistering] = useState(false);



  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    clearCart(); // Limpia el carrito al cerrar sesión
  };

  const handleRegisterClick = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setMessage('');
    setCaptchaToken(null);
  };

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const hasUpperCase = /[A-Z]/;
    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!hasUpperCase.test(password)) {
      return 'La contraseña debe tener al menos una letra mayúscula';
    }
    if (!hasNumber.test(password)) {
      return 'La contraseña debe tener al menos un número';
    }
    if (!hasSpecialChar.test(password)) {
      return 'La contraseña debe tener al menos un carácter especial';
    }
    return '';
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setMessage("Por favor, completa el reCAPTCHA");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }

    const userData = { name, email, password, captcha: captchaToken };

    try {
      setIsRegistering(true); // Desactiva el botón
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.');
      } else {
        setMessage(`Error en el registro: ${data.message || 'Inténtalo de nuevo'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al conectar con el servidor');
    } finally {
      setIsRegistering(false); // Reactiva el botón al finalizar
    }
  };


  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setMessage("Por favor, completa el reCAPTCHA");
      return;
    }

    const credentials = { email, password, captcha: captchaToken };

    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowLoginModal(false);
      } else {
        setMessage(`Error al iniciar sesión: ${data.message || 'Inténtalo de nuevo'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al conectar con el servidor');
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  return (
    <IAProvider>
      <Router>
        <div className="navbar">
          <div className="logo-container">
            <img src="logo.png" alt="Logo" className="navbar-logo" />
            <h1 className="navbar-title">Build Your Tech</h1>
          </div>
          <div className="header-buttons">
            {user ? (
              <div className="user-menu">
                <button className="logout-icon-button" onClick={handleLogout}>
                  <FaSignOutAlt size={24} />
                </button>
              </div>
            ) : (
              <button className="login-button" onClick={handleLoginClick}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Un solo bloque <Routes> para todas las rutas */}
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onLoginClick={handleLoginClick}
                user={user}
                onLogoutClick={handleLogout}
                onRegisterClick={() => setShowRegisterModal(true)} // Modal completo para registro
              />
            }
          />
          <Route
            path="/graficas2"
            element={
              <ProtectedRoute>
                <GraficasPage2
                  user={user}
                  onLogoutClick={handleLogout}
                  onLoginClick={handleLoginClick}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={<SalesPage onLoginClick={handleLoginClick} user={user} onLogoutClick={handleLogout} />}
          />
          <Route
            path="/chat"
            element={<ChatPage onLoginClick={handleLoginClick} user={user} onLogoutClick={handleLogout} />}
          />
          <Route
            path="/cart"
            element={<CartPage user={user} onLoginClick={handleLoginClick} onLogoutClick={handleLogout} />}
          />
          <Route
            path="/add-product"
            element={<ProtectedRoute><AddProductPage user={user} onLogoutClick={handleLogout} /></ProtectedRoute>}
          />
          <Route
            path="/users"
            element={<ProtectedRoute user={user}><UsersPage user={user} onLogoutClick={handleLogout} /></ProtectedRoute>}
          />
          {/* Rutas de Compra y CaraCompra correctamente dentro del mismo bloque <Routes> */}
          <Route
            path="/compras"
            element={<ProtectedRoute><Compra user={user} onLogoutClick={handleLogout} /></ProtectedRoute>}
          />
          <Route
            path="/caracompras"
            element={<ProtectedRoute><CaraCompra user={user} onLogoutClick={handleLogout} /></ProtectedRoute>}
          />
          <Route
            path="/graficas"
            element={<ProtectedRoute><GraficasPage user={user} onLogoutClick={handleLogout} /></ProtectedRoute>}
          />
          <Route
            path="/graficas3"
            element={<ProtectedRoute><GraficasPage3 user={user} onLogoutClick={handleLogout} /></ProtectedRoute>}
          />

          <Route path="/cambiocontra" element={<Cambiocontra />} />
        </Routes>

        {showLoginModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close-button" onClick={closeModal}>&times;</span>
              <h2>Iniciar Sesión</h2>
              <form onSubmit={handleLoginSubmit}>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className='recaptcha'>
                  <ReCAPTCHA
                    sitekey="6Lf1P3kqAAAAAKoWObRxFBkwGVL2_vD4utHBq67h"
                    onChange={handleCaptchaChange}
                  />
                </div>
                <button type="submit">Iniciar Sesión</button>
              </form>
              <p>
                ¿No tienes cuenta?{' '}
                <span className="register-link" onClick={handleRegisterClick}>
                  Regístrate aquí
                </span>
              </p>
              <p>
                <Link
                  to="/cambiocontra"
                  className="register-link"
                  onClick={() => setShowLoginModal(false)}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>

              {message && <p>{message}</p>}
            </div>
          </div>
        )}

        {showRegisterModal && (
          <div className="modal">
            <div className="register-modal-content">
              <span className="close-button" onClick={closeModal}>&times;</span>
              <h2>Crear Cuenta</h2>
              <form onSubmit={handleRegisterSubmit}>
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div className='recaptcha'>
                  <ReCAPTCHA
                    sitekey="6Lf1P3kqAAAAAKoWObRxFBkwGVL2_vD4utHBq67h"
                    onChange={handleCaptchaChange}
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="register-button" disabled={isRegistering}>
                    {isRegistering ? "Registrando..." : "Registrarse"}
                  </button>
                </div>
              </form>
              {message && <p>{message}</p>}
            </div>
          </div>
        )}
      </Router>
    </IAProvider>
  );
}

export default App;
