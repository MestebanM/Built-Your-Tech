import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import './graficasPage2.css';
import { CartContext } from './CartContext';
import Eliminar from './Eliminar'; // Importamos el componente Eliminar

Chart.register(...registerables);

const GraficasPage2 = ({ user, onLogoutClick, onLoginClick }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData, setSalesData] = useState([]); // Estado para los datos de la tabla
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

  // Función para obtener datos detallados de ventas para la tabla
  const fetchSalesData = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/compras-detalladas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await response.json();
      if (data.success) {
        setSalesData(data.data);
        const total = data.data.reduce((acc, item) => acc + item.total, 0);
        setTotalGeneral(total);
      } else {
        console.error('Error obteniendo datos de ventas:', data.message);
      }
    } catch (error) {
      console.error('Error conectando al backend:', error);
    }
  }, [startDate, endDate]);

  // Función para obtener datos agrupados de ventas para la gráfica
  const fetchChartData = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/ventas-agrupadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await response.json();
      if (data.success) {
        renderChart(data.data);
      } else {
        console.error('Error obteniendo datos para la gráfica:', data.message);
      }
    } catch (error) {
      console.error('Error conectando al backend:', error);
    }
  }, [startDate, endDate]);

  // Función para renderizar la gráfica
  const renderChart = (data) => {
    const labels = data.map((item) => item.fecha);
    const values = data.map((item) => item.total_ventas);

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
            label: 'Total Vendido por Fecha',
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
              text: 'Fechas',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Vendido',
            },
          },
        },
      },
    });
  };

  // Efecto para actualizar los datos al cambiar las fechas
  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData();
      fetchChartData();
    }
  }, [startDate, endDate, fetchSalesData, fetchChartData]);

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
            <Link to="/users" className="navbar-button">Profe</Link>
              <div className="dropdown-container">
                <button className="navbar-button">Ventas</button>
                <div className="dropdown-content">
                  <Link to="/graficas" className="dropdown-item">
                    Ventas Generales
                  </Link>
                  <Link to="/graficas2" className="dropdown-item">
                    Ventas por Fecha
                  </Link>
                </div>
              </div>
              <div className="dropdown-container">
                <button className="navbar-button">Compras</button>
                <div className="dropdown-content">
                  <Link to="/compras" className="dropdown-item">
                    Compra
                  </Link>
                  <Link to="/caracompras" className="dropdown-item">
                    Características de Compra
                  </Link>
                </div>
              </div>
              <Link to="/users" className="navbar-button">
                Usuarios
              </Link>
              <Link to="/add-product" className="navbar-button">
                Productos
              </Link>
            </>
          )}
          <button className="navbar-button" onClick={() => navigate('/chat')}>
            Asesoría IA
          </button>
          {user ? (
            <div className="user-info">
              <button className="navbar-button">{user.name}</button>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleLogout}>
                  Cerrar sesión
                </button>
                <button className="dropdown-item" onClick={() => setShowEliminar(true)}>
                  Eliminar cuenta
                </button>
              </div>
            </div>
          ) : (
            <button className="navbar-button" onClick={onLoginClick}>
              Iniciar sesión
            </button>
          )}
          <Link to="/cart">
            <div className="cart-button">
              <span role="img" aria-label="cart">
                &#128722;
              </span>
              <span className="cart-count">{getTotalItems()}</span>
            </div>
          </Link>
        </div>
      </div>

      {showEliminar && <Eliminar onClose={handleEliminarClose} user={user} />}

      <div className="content">
        <div className="content-grid">
          <div className="table-section">
            <h2>Ventas por Fecha</h2>
            <div className="filters-section2">
              <div className="date-filter">
                <label htmlFor="startDate" className="date-label">Fecha inicial</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Fecha Inicio"
                />
              </div>
              <div className="date-filter">
                <label htmlFor="endDate" className="date-label">Fecha final</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Fecha Fin"
                />
              </div>
              <button
                className="search-button"
                onClick={() => {
                  fetchSalesData();
                  fetchChartData();
                }}
              >
                🔍
              </button>
            </div>
            <div className="total-section" style={{ textAlign: 'center', marginTop: '20px' }}>
              <h3>Total: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalGeneral)}</h3>
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
                      <td>{item.id_producto}</td>
                      <td>{item.producto}</td>
                      <td>{item.cantidad}</td>
                      <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precio)}</td>
                      <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.total)}</td>
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

