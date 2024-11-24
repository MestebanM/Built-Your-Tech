import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import './graficasPage2.css';
import { CartContext } from './CartContext';
import Eliminar from './Eliminar'; // Importamos el componente Eliminar

Chart.register(...registerables);

const GraficasPage2 = ({ user, onLogoutClick, onLoginClick }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData] = useState([
    { id: 1, nombre: 'Producto A', cantidad_total_vendida: 15, precio: 10, fecha: '2024-11-01' },
    { id: 2, nombre: 'Producto B', cantidad_total_vendida: 20, precio: 15, fecha: '2024-11-02' },
    { id: 3, nombre: 'Producto C', cantidad_total_vendida: 5, precio: 30, fecha: '2024-11-03' },
  ]);

  const [totalGeneral, setTotalGeneral] = useState(0); // Estado para almacenar el total general
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const { getTotalItems } = useContext(CartContext);
  const isAdmin = user && user.role === 1;

  const [showEliminar, setShowEliminar] = useState(false);

  const handleLogout = () => {
    onLogoutClick();
    navigate('/');
  };

  const handleEliminarClose = () => {
    setShowEliminar(false);
  };

  useEffect(() => {
    const calculateTotal = () => {
      const total = salesData.reduce(
        (acc, item) => acc + item.cantidad_total_vendida * item.precio,
        0
      );
      setTotalGeneral(total);
    };
    calculateTotal(); // Calcula el total al cargar los datos iniciales
    renderChart(salesData);
  }, [salesData]);

  const renderChart = (data) => {
    const labels = data.map((item) => item.nombre);
    const values = data.map((item) => item.cantidad_total_vendida);

    if (chartRef.current) {
      chartRef.current.destroy();
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
              <div className="dropdown-container">
                <button className="navbar-button">Ventas</button>
                <div className="dropdown-content">
                  <Link to="/graficas" className="dropdown-item">Ventas Generales</Link>
                  <Link to="/graficas2" className="dropdown-item">Ventas por Fecha</Link>
                </div>
              </div>
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

      {showEliminar && <Eliminar onClose={handleEliminarClose} />}

      <div className="content">
        <div className="content-grid">
          <div className="table-section">
            <h2>Ventas por Fecha</h2>
            <div className="filters-section2">
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
              <button className="search-button">
                🔍
              </button>
            </div>
            <div className="total-section" style={{ textAlign: 'center', marginTop: '20px' }}>
              <h3>Total: ${totalGeneral.toFixed(2)}</h3>
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

          <div className="chart-section2">
            <canvas id="salesChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficasPage2;
