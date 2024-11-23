import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null); // Estado para el token de reCAPTCHA
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setMessage("Por favor, completa el reCAPTCHA");
      return;
    }

    const userCredentials = {
      email,
      password,
      captcha: captchaToken,
    };

    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userCredentials),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Inicio de sesión exitoso');
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setMessage(data.message || 'Correo electrónico o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al conectar con el servidor');
    }
  };

  // Maneja el cambio de estado del reCAPTCHA
  const onChange =  () => {
    console.log('hubo un cambio');
  }

  return (
    <div className="login-form">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
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
            sitekey="6Lf1P3kqAAAAAKoWObRxFBkwGVL2_vD4utHBq67h" // Reemplaza con tu clave de sitio de reCAPTCHA
            onChange={onChange}
          />
        </div>        
        <button type="submit">Iniciar Sesión</button>
      </form>
      {message && <p>{message}</p>}
      <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
    </div>
  );
};

export default Login;