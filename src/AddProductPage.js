// AddProductPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AddProductPage.css';
import { CartContext } from './CartContext';

const AddProductPage = ({ user, onLogoutClick, onLoginClick }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [productId, setProductId] = useState('');
  const [productData, setProductData] = useState({
    producto: '',
    descripcion: '',
    precio: '',
    procesador: '',
    ram: '',
    almacenamiento: '',
    grafica: '',
    imagenUrl: '',
    tipo_producto: '', // Agregado aquí
  });
  const [isEditable, setIsEditable] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isIdSearched, setIsIdSearched] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);

  const isAdmin = user && user.role === 1;

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };


  const fetchAllProducts = useCallback(async () => {
    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/api/productos');
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error al cargar todos los productos:', error);
      setAllProducts(generatePlaceholderProducts());
    }
  }, []); // La función no cambia porque no tiene dependencias

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]); // Ahora puedes incluirla sin problemas

  const generatePlaceholderProducts = () => {
    const placeholderProducts = [];
    for (let i = 1; i <= 10; i++) {
      placeholderProducts.push({
        id: i,
        producto: `Producto ${i}`,
        descripcion: `Descripción del producto ${i}`,
        precio: `$${i * 10}`,
        procesador: `Procesador ${i}`,
        ram: `${i * 2} GB`,
        almacenamiento: `${i * 50} GB`,
        grafica: `Gráfica ${i}`,
        imagenUrl: `http://example.com/image${i}.jpg`,
        tipo_producto: `Tipo ${i}`, // Agregado aquí
      });
    }
    return placeholderProducts;
  };

  const handleSearch = async () => {
    if (productId.trim() === '') {
      alert('Por favor ingrese un ID de producto válido.');
      return;
    }

    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/api/productos/${productId}`);
      if (!response.ok) {
        throw new Error('Producto no encontrado');
      }
      const data = await response.json();
      setProductData({
        producto: data.producto,
        descripcion: data.descripcion,
        precio: data.precio,
        procesador: data.procesador,
        ram: data.ram,
        almacenamiento: data.almacenamiento,
        grafica: data.grafica,
        imagenUrl: data.imagenUrl,
        tipo_producto: data.tipo_producto,
      });
      setIsEditable(false);
      setShowConfirmButtons(false);
      setIsIdSearched(true);
    } catch (error) {
      console.error('Error:', error);
      setProductData({
        producto: '',
        descripcion: '',
        precio: '',
        procesador: '',
        ram: '',
        almacenamiento: '',
        grafica: '',
        imagenUrl: '',
        tipo_producto: '',
      });
      setIsEditable(false);
      alert('Producto no encontrado');
    }
  };


  const handleCreate = () => {
    setProductData({
      producto: '',
      descripcion: '',
      precio: '',
      procesador: '',
      ram: '',
      almacenamiento: '',
      grafica: '',
      imagenUrl: '',
      tipo_producto: '',
    });
    setProductId('');
    setIsEditable(true);
    setShowConfirmButtons(true);
    setIsIdSearched(false);
    setConfirmationMessage('¿Seguro que quieres crear el nuevo producto?');
  };

  const handleEdit = () => {
    setIsEditable(true);
    setShowConfirmButtons(true);
    setConfirmationMessage('¿Seguro que quieres confirmar los cambios?');
  };

  const handleDelete = () => {
    setShowConfirmButtons(true);
    setConfirmationMessage('¿Seguro que quieres eliminar el producto?');
  };

  const handleConfirm = () => {
    setShowConfirmationModal(true);
  };

  const handleCancel = () => {
    setIsEditable(false);
    setShowConfirmButtons(false);
    setShowConfirmationModal(false);
    setProductData({
      producto: '',
      descripcion: '',
      precio: '',
      procesador: '',
      ram: '',
      almacenamiento: '',
      grafica: '',
      imagenUrl: '',
      tipo_producto: '',
    });
    setProductId('');
    setIsIdSearched(false); // Deshabilitar "Editar" y "Eliminar"
  };


  const validateFields = (data) => {
    return Object.values(data).every((value) => value !== '');
  };

  const handleCreateConfirm = async () => {
    if (!validateFields(productData)) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/api/productos/crear/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }

      const data = await response.json();
      alert(data.success || 'Producto creado exitosamente');
      setProductData({
        producto: '',
        descripcion: '',
        precio: '',
        procesador: '',
        ram: '',
        almacenamiento: '',
        grafica: '',
        imagenUrl: '',
        tipo_producto: '',
      });
      setProductId('');
      setIsEditable(false);
      setShowConfirmButtons(false);
    } catch (error) {
      console.error('Error al crear el producto:', error);
      alert('Error al crear el producto');
    }
  };

  const handleUpdate = async () => {
    if (!validateFields(productData)) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/api/productos/${productId}/editar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      const data = await response.json();
      alert(data.success || 'Producto actualizado');
      setIsEditable(false);
      setShowConfirmButtons(false);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alert('Error al actualizar el producto');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/api/productos/${productId}/eliminar/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      const data = await response.json();
      alert(data.success || 'Producto eliminado');
      setProductData({
        producto: '',
        descripcion: '',
        precio: '',
        procesador: '',
        ram: '',
        almacenamiento: '',
        grafica: '',
        imagenUrl: '',
        tipo_producto: '',
      });
      setProductId('');
      setIsEditable(false);
      setShowConfirmButtons(false);
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  const finalConfirm = async () => {
    setShowConfirmationModal(false); // Cerrar modal de confirmación

    try {
      if (confirmationMessage === '¿Seguro que quieres eliminar el producto?') {
        await handleDeleteConfirm(); // Asegúrate de que esta función sea compatible con `async/await`
      } else if (confirmationMessage === '¿Seguro que quieres crear el nuevo producto?') {
        await handleCreateConfirm();
      } else if (confirmationMessage === '¿Seguro que quieres confirmar los cambios?') {
        await handleUpdate();
      }

      // Resetear estados tras la acción
      setIsIdSearched(false);
      setProductId('');
      setProductData({
        producto: '',
        descripcion: '',
        precio: '',
        procesador: '',
        ram: '',
        almacenamiento: '',
        grafica: '',
        imagenUrl: '',
        tipo_producto: '', // Asegurar que el tipo_producto también se resetee
      });

      // Refrescar la lista de productos tras realizar la acción
      await fetchAllProducts();
    } catch (error) {
      console.error('Error en finalConfirm:', error);
    }
  };

  const handleLogout = () => {
    onLogoutClick();
    navigate('/');
  };

  return (
    <div className="add-product-page">
      <div className="add-product-header">
        <button className="logo-button" onClick={() => navigate('/')}>
          <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
          <span className="navbar-title">BUILD-YOUR-TECH</span>
        </button>
        <div className="header-buttons">
          {isAdmin && (
            <>
              <div className="navbar-dropdown">
                <button
                  className="navbar-button"
                  onClick={() => setDropdownVisible((prev) => !prev)}
                >
                   <span>Ventas</span>
                </button>
                {dropdownVisible && (
                  <div className="dropdown-options">
                    <button
                      className="dropdown-button"
                      onClick={() => navigate('/graficas')}
                    >
                      Ventas Generales
                    </button>
                    <button
                      className="dropdown-button"
                      onClick={() => navigate('/graficas2')}
                    >
                      Ventas por Fecha
                    </button>
                  </div>
                )}
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
              <button className="navbar-button" onClick={toggleDropdown}>
                {user.name}
              </button>
              {dropdownVisible && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
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

      <div className="add-product-content">
        <h2>Gestión de Productos</h2>

        <div className="product-management-section">
          <div className="search-section">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="ID de producto"
                value={productId}
                onChange={(e) => {
                  const id = e.target.value;

                  // Permitir solo números
                  if (/^\d*$/.test(id)) {
                    setProductId(id);
                    setShowConfirmButtons(false);
                    setIsEditable(false);
                    setProductData({
                      producto: '',
                      descripcion: '',
                      precio: '',
                      procesador: '',
                      ram: '',
                      almacenamiento: '',
                      grafica: '',
                      imagenUrl: '',
                      tipo_producto: '',
                    });
                    setIsIdSearched(false);
                  }
                }}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-button">
                🔍
              </button>
            </div>
          </div>


          <div className="action-buttons">
            <button
              className="action-button"
              onClick={handleCreate}
              disabled={isIdSearched}
            >
              Crear
            </button>
            <button
              className="action-button"
              onClick={handleEdit}
              disabled={!isIdSearched}
            >
              Editar
            </button>
            <button
              className="action-button"
              onClick={handleDelete}
              disabled={!isIdSearched}
            >
              Eliminar
            </button>
          </div>

          <div className="product-details-columns">
            {/* Primera columna */}
            <div className="product-column">
              <div className="product-field">
                <label>Producto:</label>
                <input
                  type="text"
                  value={productData.producto}
                  onChange={(e) => setProductData({ ...productData, producto: e.target.value })}
                  readOnly={!isEditable}
                  className="product-input"
                />
              </div>
              <div className="product-field">
                <label>Procesador:</label>
                <input
                  type="text"
                  value={productData.procesador}
                  onChange={(e) => setProductData({ ...productData, procesador: e.target.value })}
                  readOnly={!isEditable}
                  className="product-input"
                />
              </div>
              <div className="product-field">
                <label>Gráfica:</label>
                <input
                  type="text"
                  value={productData.grafica}
                  onChange={(e) => setProductData({ ...productData, grafica: e.target.value })}
                  readOnly={!isEditable}
                  className="product-input"
                />
              </div>
            </div>

            {/* Segunda columna con campos ajustados */}
            <div className="product-column">
              <div className="product-field small">
                <label>Precio:</label>
                <input
                  type="text"
                  value={productData.precio}
                  onChange={(e) => setProductData({ ...productData, precio: e.target.value })}
                  readOnly={!isEditable}
                  className="product-input-small"
                />
              </div>
              <div className="product-field small">
                <label>RAM:</label>
                <input
                  type="text"
                  value={productData.ram}
                  onChange={(e) => setProductData({ ...productData, ram: e.target.value })}
                  readOnly={!isEditable}
                  className="product-input-small"
                />
              </div>
              <div className="product-field small">
                <label>Almacenamiento:</label>
                <input
                  type="text"
                  value={productData.almacenamiento}
                  onChange={(e) => setProductData({ ...productData, almacenamiento: e.target.value })}
                  readOnly={!isEditable}
                  className="product-input-small"
                />
              </div>
            </div>

            {/* Tercera columna */}
            <div className="product-column">
              <div className="product-field">
                <label>Imagen URL:</label>
                {isEditable ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]; // Obtén el archivo cargado
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            // Convierte la imagen a Base64 y elimina el prefijo
                            const base64String = reader.result.split(',')[1];
                            setProductData({ ...productData, imagenUrl: base64String });
                          };
                          reader.readAsDataURL(file); // Convierte la imagen a Base64
                        }
                      }}
                      className="product-input"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    value={productData.imagenUrl}
                    readOnly
                    className="product-input"
                  />
                )}
              </div>
              <div className="product-field">
                <label>Tipo de Producto:</label> {/* Nuevo campo */}
                <input
                  type="text"
                  value={productData.tipo_producto}
                  onChange={(e) => setProductData({ ...productData, tipo_producto: e.target.value })}
                  readOnly={!isEditable}
                  className="product-input"
                />
              </div>
              <div className="product-field">
                <label>Descripción:</label>
                <textarea
                  value={productData.descripcion}
                  onChange={(e) => setProductData({ ...productData, descripcion: e.target.value })}
                  readOnly={!isEditable}
                  className="description-input"
                />
              </div>
            </div>
          </div>

          {showConfirmButtons && (
            <div className="confirm-buttons">
              <button className="cancel-button" onClick={handleCancel}>Cancelar</button>
              <button className="confirm-button" onClick={handleConfirm}>Confirmar</button>
            </div>
          )}

          {showConfirmationModal && (
            <div className="confirmation-modal">
              <p>{confirmationMessage}</p>
              <button className="cancel-button" onClick={handleCancel}>Cancelar</button>
              <button className="confirm-button" onClick={finalConfirm}>Confirmar</button>
            </div>
          )}
        </div>

        <h2>Todos los Productos</h2>
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Procesador</th>
                <th>RAM</th>
                <th>Almacenamiento</th>
                <th>Gráfica</th>
                <th>Imagen</th>
                <th>Tipo de Producto</th> {/* Nueva columna */}
              </tr>
            </thead>
            <tbody>
              {allProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.producto}</td>
                  <td>{product.descripcion}</td>
                  <td>{product.precio}</td>
                  <td>{product.procesador}</td>
                  <td>{product.ram}</td>
                  <td>{product.almacenamiento}</td>
                  <td>{product.grafica}</td>
                  <td title={product.imagenUrl}>
                    {product.imagenUrl.length > 50
                      ? `${product.imagenUrl.substring(0, 50)}...`
                      : product.imagenUrl}
                  </td>
                  <td>{product.tipo_producto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
