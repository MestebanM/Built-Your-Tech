import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cambiocontra.css';

function Cambiocontra() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1 para correo, 2 para cambio de contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Función de validación de contraseña
  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const hasUpperCase = /[A-Z]/;
    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!hasUpperCase.test(password)) {
      return 'La contraseña debe tener al menos una letra mayúscula.';
    }
    if (!hasNumber.test(password)) {
      return 'La contraseña debe tener al menos un número.';
    }
    if (!hasSpecialChar.test(password)) {
      return 'La contraseña debe tener al menos un carácter especial.';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'ejemplo@correo.com') {
      setMessage('Correo verificado. Por favor, ingresa tu nueva contraseña.');
      setStep(2); // Cambiar a paso 2
    } else {
      setMessage('No se encontró una cuenta con ese correo.'); // Advertencia para el futuro backend
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    // Advertencia: Aquí se conectará al backend para cambiar la contraseña
    setMessage('Contraseña cambiada exitosamente. Redirigiendo a la página principal...');
    setTimeout(() => navigate('/'), 2000); // Redirige a la página principal después de 2 segundos
  };

  return (
    <div className="cambiocontra-container">
      <div className="navbar">
        <button className="logo-button" onClick={() => navigate('/')}>
          <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
          <span className="navbar-title">BUILD-YOUR-TECH</span>
        </button>
      </div>
      <div className="cambiocontra-content">
        <h2>{step === 1 ? 'Restablecer Contraseña' : 'Nueva Contraseña'}</h2>
        {step === 1 ? (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button type="submit">Confirmar correo</button>
              <button type="button" onClick={() => navigate('/')}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => navigate('/')}>
                Cancelar
              </button>
            </div>
          </form>
        )}
        {message && <p className="cambiocontra-message">{message}</p>}
      </div>
    </div>
  );
}

export default Cambiocontra;
