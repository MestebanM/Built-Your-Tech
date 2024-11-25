import React, { useContext, useState, useEffect } from 'react';
import './App.css';
import './Eliminar.css'; // Importa el CSS del componente Eliminar
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import Calificacion from './Calificacion'; // Componente de calificación
import Eliminar from './Eliminar'; // Importa el componente de eliminación

function SalesPage({ onLoginClick, user, onLogoutClick }) {
  const { addToCart, getTotalItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [dropdownPurchasesVisible, setDropdownPurchasesVisible] = useState(false); // Para el menú de Compras
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
  const [selectedProduct, setSelectedProduct] = useState(null); // Producto seleccionado
  const [showEliminar, setShowEliminar] = useState(false); // Estado para controlar el modal de eliminación

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const togglePurchasesDropdown = () => {
    setDropdownPurchasesVisible(!dropdownPurchasesVisible);
  };

  const isAdmin = user && user.role === 1;

  const handleIaClick = () => {
    if (user) {
      navigate('/chat');
    } else {
      onLoginClick();
    }
  };

  useEffect(() => {
    fetch('https://bdbuildyourteach.dtechne.com/backend/productos/')
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener los productos");
        return response.json();
      })
      .then(data => {
        const normalizedProducts = data.slice(0, 69).map(product => ({
          id: product.id || "Sin ID",
          nombre: product.description || "Producto sin nombre",
          procesador: product.info?.procesador || "No especificado",
          ram: product.info?.ram || "No especificado",
          almacenamiento: product.info?.almacenamiento || "No especificado",
          grafica: product.info?.grafica || "No especificado",
          imagen: product.img || "url_de_imagen_por_defecto.jpg",
          precio: product.price
            ? parseFloat(product.price.replace(/[^0-9.]/g, ''))
            : 0,
          descripcion: product.description || "Sin descripción",
        }));
        setProducts(normalizedProducts);
      })
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleAddToCart = (product) => {
    if (user) {
      const productToAdd = {
        id: product.id || "Sin ID",
        description: product.nombre || "Producto sin nombre",
        img: product.imagen || "url_de_imagen_por_defecto.jpg",
        price: product.precio || "0",
        quantity: 1,
      };
      addToCart(productToAdd);
    } else {
      onLoginClick();
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleEliminarClose = () => {
    setShowEliminar(false);
  };

  return (
    <div className="App">
      <header className="navbar">
        <button className="logo-button" onClick={() => navigate('/')}>
          <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
          <span className="navbar-title">BUILD-YOUR-TECH</span>
        </button>
        <div className="header-buttons">
          {isAdmin && (
            <>
            <Link to="/users" className="navbar-button">Usuarios</Link>
              <div className="dropdown-container">
                <button className="navbar-button">Ventas</button>
                <div className="dropdown-content">
                  <Link to="/graficas" className="dropdown-item">Ventas Generales</Link>
                  <Link to="/graficas2" className="dropdown-item">Ventas por Fecha</Link>
                </div>
              </div>
              <div className="dropdown-container">
                <button
                  className="navbar-button"
                  onClick={togglePurchasesDropdown}
                >
                  Compras
                </button>
                {dropdownPurchasesVisible && (
                  <div className="dropdown-content">
                    <Link to="/compras" className="dropdown-item">Compra</Link>
                    <Link to="/caracompras" className="dropdown-item">Características de Compra</Link>
                  </div>
                )}
              </div>
              <Link to="/users" className="navbar-button">Usuarios</Link>
              <Link to="/add-product" className="navbar-button">Productos</Link>
            </>
          )}
          <button className="navbar-button" onClick={handleIaClick}>
            <img src="/IAlogo.png" alt="Asesoría IA" className="ia-icon-navbar" />
            <span>Asesoría IA</span>
          </button>
          {user ? (
            <div className="user-info">
              <button className="navbar-button user-name" onClick={toggleDropdown}>
                {user.name}
              </button>
              {dropdownVisible && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={onLogoutClick}>
                    Cerrar sesión
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => setShowEliminar(true)}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar-button" onClick={onLoginClick}>
              <span className="user-icon">&#128100;</span> INICIAR SESIÓN
            </button>
          )}
          <Link to="/cart">
            <div className="cart-button">
              <span role="img" aria-label="cart">&#128722;</span>
              {getTotalItems() > 0 && (
                <span className="cart-count">{getTotalItems()}</span>
              )}
            </div>
          </Link>
        </div>
      </header>

      <div className="hero">
        <img src="/BYT.jpg" alt="Logo" className="logo" />
        <div className="combined-content">
          <p className="slogan">Computadores a tu medida guiado por innovación</p>
          <p className="intro-message">
            ¿BUSCAS UNA COMPUTADORA QUE SE AJUSTE A TUS NECESIDADES? Nuestra IA analizará tus requerimientos para ofrecerte recomendaciones personalizadas. Con BUILD-YOUR-TECH, recibirás asesoría para elegir el equipo ideal, maximizando el valor de tu inversión y ajustándose a tus actividades y presupuesto. ¡Descubre nuestros productos y encuentra lo que realmente necesitas!
          </p>
          <button className="ia-button" onClick={handleIaClick}>
            <img src="/IAlogo.png" alt="Asesoría IA" className="ia-icon" />
            <span className="ia-label">Asesoría IA</span>
          </button>
        </div>
      </div>

      <div className="products-bar">
        <h2 className="products-title">EXPLORA NUESTRO CATÁLOGO</h2>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={product.imagen || "url_de_imagen_por_defecto.jpg"}
              alt={product.nombre || "Sin nombre"}
              className="product-img"
            />
            <div className="product-info">
              <p className="product-description">{product.nombre || "Producto sin nombre"}</p>
              <p className="product-price">
                {product.precio && !isNaN(product.precio)
                  ? formatCurrency(product.precio)
                  : "$0"}
              </p>
              <div className="product-details">
                <p><strong>Procesador:</strong> {product.procesador || "No especificado"}</p>
                <p><strong>RAM:</strong> {product.ram || "No especificado"}</p>
                <p><strong>Almacenamiento:</strong> {product.almacenamiento || "No especificado"}</p>
                <p><strong>Gráfica:</strong> {product.grafica || "No especificado"}</p>
              </div>
              <button
                className="add-to-cart"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Calificacion
          product={selectedProduct}
          closeModal={closeModal}
          user={user}
        />
      )}

      {showEliminar && <Eliminar onClose={handleEliminarClose} user={user} />}


      <footer className="footer">
        <div className="footer-section">
          <h3>Sobre Build Your Tech</h3>
          <ul>
            <li>Sobre nosotros</li>
            <li>Contáctanos</li>
            <li>Vacantes</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Ayuda</h3>
          <ul>
            <li>Preguntas frecuentes</li>
            <li>Cómo comprar</li>
            <li>Política de devoluciones</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Comunidad</h3>
          <ul>
            <li>Blog</li>
            <li>Sorteos</li>
            <li>Afíliate</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <span>Facebook</span>
            <span>Twitter</span>
            <span>Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SalesPage;
