import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import './graficasPage3.css';
import { CartContext } from './CartContext';
import Eliminar from './Eliminar';

Chart.register(...registerables);

const GraficasPage3 = ({ user, onLogoutClick, onLoginClick }) => {
  const [searchId, setSearchId] = useState('');
  const [productInfo, setProductInfo] = useState(null);
  const { getTotalItems } = useContext(CartContext); // Usar CartContext para obtener el total de productos en el carrito
  const navigate = useNavigate();
  const isAdmin = user && user.role === 1;
  const chartRef = useRef(null); // Usar useRef para la instancia de Chart
  const [showEliminar, setShowEliminar] = useState(false);


  useEffect(() => {
    // Obtener los productos más vendidos desde el backend
    fetch('https://bdbuildyourteach.dtechne.com/api/top-products')
      .then((response) => response.json())
      .then((data) => {
        // Concatenar ID y nombre para las etiquetas de la gráfica
        const labels = data.map((product) => `${product.id} - ${product.nombre}`);
        const salesData = data.map((product) => product.cantidad_total_vendida);

        // Destruir la gráfica previa si existe
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Crear la nueva gráfica con los datos del servidor
        const ctx = document.getElementById('salesChart').getContext('2d');
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Ventas',
                data: salesData,
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
                  text: 'Productos (ID - Nombre)',
                },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Cantidad Vendida',
                },
              },
            },
          },
        });
      })
      .catch((err) => console.error('Error al obtener los datos:', err));
  }, []);


  const handleEliminarClose = () => {
    setShowEliminar(false);
  };


  const handleSearch = () => {
    if (searchId.trim() === '') return;

    fetch(`https://bdbuildyourteach.dtechne.com/api/product/${searchId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }
        return response.json();
      })
      .then((data) => {
        setProductInfo({
          name: data.nombre,
          price: data.precio,
          quantity: data.cantidad_vendida,
          total: data.total_generado,
        });
      })
      .catch((err) => {
        console.error(err);
        setProductInfo(null);
      });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setSearchId(value); // Solo permite números
    }
  };

  return (
    <div className="graficas-page">
      <div className="graficas-header">
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
          {user ? (
            <div className="user-info">
              <button className="navbar-button user-name">{user.name}</button>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={onLogoutClick}>Cerrar sesión</button>
                <button className="dropdown-item" onClick={() => setShowEliminar(true)}>Eliminar cuenta</button>
              </div>
            </div>
          ) : (
            <button className="navbar-button">
              <span className="user-icon">&#128100;</span> INICIAR SESIÓN
            </button>
          )}
          <Link to="/cart">
            <div className="cart-button">
              <span role="img" aria-label="cart">&#128722;</span>
              {getTotalItems() > 0 && <span className="cart-count">{getTotalItems()}</span>}
            </div>
          </Link>
        </div>
      </div>

      {showEliminar && <Eliminar onClose={handleEliminarClose} user={user} />}



      <div className="content">
        <div className="search-section">
          <h2>Buscar Producto</h2>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Ingrese el nombre del producto"
              value={searchId}
              onChange={handleInputChange}
            />
            <button onClick={handleSearch} disabled={!searchId.trim()}>
              🔍
            </button>
          </div>
          <div className="product-details">
            <label>Nombre Producto:</label>
            <input type="text" value={productInfo?.name || ''} disabled />
            <label>Precio:</label>
            <input type="text" value={productInfo ? `$${productInfo.price}` : ''} disabled />
            <label>Cantidad Vendida:</label>
            <input type="text" value={productInfo?.quantity || ''} disabled />
            <label>Total Generado:</label>
            <input type="text" value={productInfo ? `$${productInfo.total}` : ''} disabled />
          </div>
        </div>

        <div className="chart-section">
          <canvas id="salesChart"></canvas>
        </div>
      </div>

    </div>
  );
};

export default GraficasPage3;
