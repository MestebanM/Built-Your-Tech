
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import './graficasPage2.css';
import { CartContext } from './CartContext';
import Eliminar from './Eliminar'; // Importamos el componente Eliminar

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import './graficasPage2.css';


Chart.register(...registerables);

const DetalladoVentasPage = ({ user, onLogoutClick, onLoginClick }) => {

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData] = useState([
    { id: 1, nombre: 'Producto A', cantidad_total_vendida: 15, precio: 10, fecha: '2024-11-01' },
    { id: 2, nombre: 'Producto B', cantidad_total_vendida: 20, precio: 15, fecha: '2024-11-02' },
    { id: 3, nombre: 'Producto C', cantidad_total_vendida: 5, precio: 30, fecha: '2024-11-03' },
  ]);

  const navigate = useNavigate();
  const chartRef = useRef(null);
  const { getTotalItems } = useContext(CartContext); // Usar CartContext para obtener el total de productos en el carrito
  const isAdmin = user && user.role === 1;

  const [showEliminar, setShowEliminar] = useState(false); // Estado para mostrar el componente Eliminar

  const handleLogout = () => {
    onLogoutClick();
    navigate('/');
  };

  const handleEliminarClose = () => {
    setShowEliminar(false);
  };

  useEffect(() => {
    renderChart(salesData);
  }, [salesData]);

  const renderChart = (data) => {
    const labels = data.map((item) => item.nombre);
    const values = data.map((item) => item.cantidad_total_vendida);

    if (chartRef.current) {
      chartRef.current.destroy(); // Destruye la gráfica anterior si existe
    }

    const ctx = document.getElementById('salesChart').getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Cantidad Vendida',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Productos',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad Vendida',
            },
            ticks: {
              stepSize: 5,
            },
          },
        },
      },
    });
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <button className="logo-button" onClick={() => navigate('/')}>
          <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
          <span className="navbar-title">BUILD-YOUR-TECH</span>
        </button>

        <div className="header-buttons">
          {isAdmin && (
            <>
              {/* Menú Ventas */}
              <div className="dropdown-container">
                <button className="navbar-button">Ventas</button>
                <div className="dropdown-content">
                  <Link to="/graficas" className="dropdown-item">Ventas Generales</Link>
                  <Link to="/graficas2" className="dropdown-item">Ventas por Fecha</Link>
                </div>
              </div>

              {/* Menú Compras */}
              <div className="dropdown-container">
                <button className="navbar-button">Compras</button>
                <div className="dropdown-content">
                  <Link to="/compras" className="dropdown-item">Compra</Link>
                  <Link to="/caracompras" className="dropdown-item">Características de Compra</Link>
                </div>
              </div>

              <Link to="/users" className="navbar-button">Usuarios</Link>
              <Link to="/add-product" className="navbar-button">Productos</Link>
            </>
          )}
          <button className="navbar-button" onClick={() => navigate('/chat')}>Asesoría IA</button>

          {/* Usuario */}
          {user ? (
            <div className="user-info">
              <button className="navbar-button">{user.name}</button>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleLogout}>
                  Cerrar sesión
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => setShowEliminar(true)}
                >
                  Eliminar cuenta
                </button>
              </div>
            </div>
          ) : (
            <button className="navbar-button" onClick={onLoginClick}>Iniciar sesión</button>
          )}
          <Link to="/cart">
            <div className="cart-button">
              <span role="img" aria-label="cart">&#128722;</span>
              <span className="cart-count">{getTotalItems()}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mostrar el cuadro de confirmación */}
      {showEliminar && <Eliminar onClose={handleEliminarClose} />}

      {/* Contenido principal */}
      <div className="content">
        <div className="content-grid">
          {/* Tabla */}
          <div className="table-section">
            <h2>Ventas por Fecha</h2>
            <div className="filters-section">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Fecha Inicio"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Fecha Fin"
              />
              <button className="search-button" onClick={() => console.log('Buscar')}>
                🔍
              </button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>ID Producto</th>
                    <th>Producto</th>
                    <th>Cantidad Vendida</th>
                    <th>Precio</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.fecha}</td>
                      <td>{item.id}</td>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad_total_vendida}</td>
                      <td>${item.precio}</td>
                      <td>${item.cantidad_total_vendida * item.precio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfica */}
          <div className="chart-section">
            <h2>Gráfica</h2>
            <canvas id="salesChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [salesData] = useState([
        { id: 1, nombre: 'Producto A', cantidad_total_vendida: 15, precio: 10, fecha: '2024-11-01' },
        { id: 2, nombre: 'Producto B', cantidad_total_vendida: 20, precio: 15, fecha: '2024-11-02' },
        { id: 3, nombre: 'Producto C', cantidad_total_vendida: 5, precio: 30, fecha: '2024-11-03' },
        { id: 4, nombre: 'Producto D', cantidad_total_vendida: 12, precio: 25, fecha: '2024-11-04' },
        { id: 5, nombre: 'Producto E', cantidad_total_vendida: 8, precio: 18, fecha: '2024-11-05' },
        { id: 6, nombre: 'Producto F', cantidad_total_vendida: 17, precio: 22, fecha: '2024-11-06' },
        { id: 7, nombre: 'Producto G', cantidad_total_vendida: 10, precio: 35, fecha: '2024-11-07' },
        { id: 8, nombre: 'Producto H', cantidad_total_vendida: 25, precio: 12, fecha: '2024-11-08' },
        { id: 9, nombre: 'Producto I', cantidad_total_vendida: 18, precio: 16, fecha: '2024-11-09' },
        { id: 10, nombre: 'Producto J', cantidad_total_vendida: 7, precio: 19, fecha: '2024-11-10' },
    ]);

    const navigate = useNavigate();
    const chartRef = useRef(null);
    const [showGraphOptions, setShowGraphOptions] = useState(false); // Estado para el submenú

    useEffect(() => {
        renderChart(salesData);
    }, [salesData]);

    const renderChart = (data) => {
        const labels = data.map((item) => item.nombre);
        const values = data.map((item) => item.cantidad_total_vendida);

        if (chartRef.current) {
            chartRef.current.destroy(); // Destruye la gráfica anterior si existe
        }

        const ctx = document.getElementById('salesChart').getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Cantidad Vendida',
                        data: values,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Productos',
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad Vendida',
                        },
                        ticks: {
                            stepSize: 5, // Fijo para evitar ajustes automáticos
                        },
                    },
                },
            },
        });
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="graficas-page">
            {/* Barra superior */}
            <div className="graficas-header">
                <button className="logo-button" onClick={() => navigate('/')}>
                    <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
                    <span className="navbar-title">BUILD-YOUR-TECH</span>
                </button>

                <div className="header-buttons">
                    <div className="navbar-dropdown">
                        <button
                            className="navbar-button"
                            onClick={() => setShowGraphOptions(!showGraphOptions)}
                        >
                            Ventas
                        </button>
                        {showGraphOptions && (
                            <div className="dropdown-options">
                                <button
                                    className="dropdown-button"
                                    onClick={() => handleNavigation('/graficas')}
                                >
                                    Ventas Generales
                                </button>
                                <button
                                    className="dropdown-button"
                                    onClick={() => handleNavigation('/graficas2')}
                                >
                                    Ventas por Fecha
                                </button>
                            </div>
                        )}
                    </div>
                    <Link to="/compras">
                        <button className="navbar-button">Compras</button>
                    </Link>
                    <Link to="/users">
                        <button className="navbar-button">Usuarios</button>
                    </Link>
                    <Link to="/add-product">
                        <button className="navbar-button">Productos</button>
                    </Link>
                    <button className="navbar-button" onClick={() => navigate('/chat')}>Asesoría IA</button>
                    <button className="navbar-button">{user ? user.name : 'Iniciar Sesión'}</button>
                    <Link to="/cart">
                        <div className="cart-button">
                            <span role="img" aria-label="cart">🛒</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="content">
                <div className="content-grid">
                    {/* Tabla */}
                    <div className="table-section">
                        <h2>Ventas por Fecha</h2>
                        <div className="filters-section">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Fecha Inicio"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Fecha Fin"
                            />
                            <button className="search-button" onClick={() => console.log('Buscar')}>
                                🔍
                            </button>
                        </div>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>ID Producto</th>
                                        <th>Producto</th>
                                        <th>Cantidad Vendida</th>
                                        <th>Precio</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.fecha}</td>
                                            <td>{item.id}</td>
                                            <td>{item.nombre}</td>
                                            <td>{item.cantidad_total_vendida}</td>
                                            <td>${item.precio}</td>
                                            <td>${item.cantidad_total_vendida * item.precio}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Gráfica */}
                    <div className="chart-section">
                        <h2>Gráfica</h2>
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default DetalladoVentasPage;
