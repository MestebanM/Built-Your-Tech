import React, { useState } from 'react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); 
  const [token, setToken] = useState(''); 
  const [isTokenSent, setIsTokenSent] = useState(false); 
  const [isVerified, setIsVerified] = useState(false); 

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }


    const captchaToken = await grecaptcha.enterprise.execute('6LdwM3kqAAAAABwDCeynWjWDoSvSadEoJtItgLn3', { action: 'REGISTER' });

    const userData = {
      name,
      email,
      password,
      captcha: captchaToken,
    };

    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Usuario registrado, por favor revisa tu correo para confirmar el registro.');
        setIsTokenSent(true); 
      } else {
        setMessage(`Error en el registro: ${data.message || 'Inténtalo de nuevo'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al conectar con el servidor');
    }
  };

  return (
    <div className="register-form">
      <h2>Crear Cuenta</h2>
      {!isTokenSent && !isVerified ? (
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Registrarse</button>
        </form>
      ) : !isVerified ? (
        <form onSubmit={handleTokenVerification}>
          <input
            type="text"
            placeholder="Ingresa el token de verificación"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <button type="submit">Verificar</button>
        </form>
      ) : (
        <p>{message}</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
