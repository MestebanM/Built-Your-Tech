import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CaraCompra.css';
import { CartContext } from './CartContext';
import Eliminar from './Eliminar';


const CaraCompra = ({ user, onLogoutClick, onLoginClick }) => {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState({
    id_producto_compra: '',
    id_compra: '',
    producto_id: '',
    cantidad: ''
  });
  const [isEditable, setIsEditable] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isIdSearched, setIsIdSearched] = useState(false);
  const [allCompras, setAllCompras] = useState([]);
  const [showEliminar, setShowEliminar] = useState(false);

  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);

  const isAdmin = user && user.role === 1;
  const handleEliminarClose = () => {
    setShowEliminar(false);
  };


  const fetchAllCompras = async () => {
    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/cara_compras/');
      const data = await response.json();
      console.log('Datos de compras:', data);
      if (Array.isArray(data)) {
        setAllCompras(data);
      } else {
        setAllCompras([]);
      }
    } catch (error) {
      setAllCompras([]); // In case of error
    }
  };

  useEffect(() => {
    fetchAllCompras();
  }, []);

  const handleSearch = async () => {
    if (!userId.trim()) { // Si el campo está vacío, no realiza la consulta
      alert('Por favor ingrese un ID de compra válido.');
      return;
    }

    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/cara_compras/${userId}`);
      if (!response.ok) throw new Error('Compra no encontrada');
      const data = await response.json();
      setUserData({
        ID_PRODUCTO_COMPRA: data.ID_PRODUCTO_COMPRA,
        ID_COMPRA: data.ID_COMPRA,
        PRODUCTO_ID: data.PRODUCTO_ID,
        CANTIDAD: data.CANTIDAD
      });
      setIsEditable(false);
      setShowConfirmButtons(false);
      setIsIdSearched(true);
      fetchAllCompras();
    } catch (error) {
      setUserData({
        ID_PRODUCTO_COMPRA: '',
        ID_COMPRA: '',
        PRODUCTO_ID: '',
        CANTIDAD: ''
      });
      setIsEditable(false);
      setIsIdSearched(false);
      alert('Compra no encontrada');
    }
  };

  const handleCreate = () => {
    setUserData({
      id_producto_compra: '',
      id_compra: '',
      producto_id: '',
      cantidad: ''
    });
    setUserId('');
    setIsEditable(true);
    setShowConfirmButtons(true);
    setIsIdSearched(false);
    setConfirmationMessage('¿Seguro que quieres crear la compra?');
  };

  const handleCreateConfirm = async () => {

    console.log('ENTREEEEEEEEEE 2222');
    try {
      console.log('Datos enviados al backend:', {
        id_compra: userData.ID_COMPRA,
        producto_id: userData.PRODUCTO_ID,
        cantidad: userData.CANTIDAD,
      });

      // Validación: Comprueba si los campos están completos
      if (!userData.ID_COMPRA || !userData.PRODUCTO_ID || !userData.CANTIDAD) {
        alert('Por favor completa todos los campos antes de crear el registro.');
        return;
      }

      // Asegúrate de convertir los valores a números antes de enviarlos
      const payload = {
        id_compra: Number(userData.ID_COMPRA), // Convertir a número
        producto_id: Number(userData.PRODUCTO_ID), // Convertir a número
        cantidad: Number(userData.CANTIDAD), // Convertir a número
      };

      console.log('Payload convertido a números:', payload);

      // Enviar datos al backend
      const response = await fetch('https://bdbuildyourteach.dtechne.com/cara_compras/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Manejo de la respuesta
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la creación:', errorText);
        throw new Error('Error al crear el registro');
      }

      const data = await response.json();
      alert(data.message || 'Registro creado exitosamente.');

      // Reinicia los datos del formulario después de la creación
      setUserData({ id_producto_compra: 0, id_compra: 0, producto_id: 0, cantidad: 0 });
      fetchAllCompras(); // Actualizar lista de compras
    } catch (error) {
      console.error('Error al crear el registro:', error);
      alert('Error al crear el registro.');
    }
  };



  const handleEdit = () => {
    setIsEditable(true);
    setShowConfirmButtons(true);
    setIsIdSearched(false); // Bloquear Editar y Eliminar después de presionar Editar
    setConfirmationMessage('¿Seguro que quieres confirmar los cambios?');
  };

  const handleUpdate = async () => {
    try {
      if (!userData.ID_COMPRA || !userData.PRODUCTO_ID || !userData.CANTIDAD) {
        alert('Por favor completa todos los campos antes de actualizar el registro.');
        return;
      }

      const payload = {
        id_compra: parseInt(userData.ID_COMPRA, 10),
        producto_id: parseInt(userData.PRODUCTO_ID, 10),
        cantidad: parseInt(userData.CANTIDAD, 10),
      };

      console.log('Datos enviados al backend:', payload);

      const response = await fetch(`https://bdbuildyourteach.dtechne.com/cara_compras/${userId}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        alert(errorData.message || 'Error al actualizar el registro.');
        return;
      }

      const data = await response.json();
      alert(data.message || 'Registro actualizado exitosamente.');
      fetchAllCompras();
    } catch (error) {
      console.error('Error al actualizar el registro:', error);
      alert('Error al actualizar el registro.');
    }
  };

  const handleDelete = () => {
    setShowConfirmButtons(true);
    setIsIdSearched(false); // Bloquear Editar y Eliminar después de presionar Eliminar
    setConfirmationMessage('¿Seguro que quieres eliminar la compra?');
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/cara_compras/${userId}/eliminar`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el registro');
      const data = await response.json();
      alert(data.message || 'Registro eliminado exitosamente.');
      setUserData({ id_producto_compra: '', id_compra: '', producto_id: '', cantidad: '' });
      fetchAllCompras();
    } catch (error) {
      alert('Error al eliminar el registro.');
    }
  };

  const handleConfirm = () => {
    setShowConfirmationModal(true);
  };

  const handleCancel = () => {
    setIsEditable(false);
    setShowConfirmButtons(false);
    setShowConfirmationModal(false);
    setUserData({
      id_producto_compra: '',
      id_compra: '',
      producto_id: '',
      cantidad: ''
    });
    setUserId('');
  };

  const finalConfirm = () => {
    setShowConfirmationModal(false);

    if (confirmationMessage === '¿Seguro que quieres eliminar la compra?') {
      handleDeleteConfirm();
    } else if (confirmationMessage === '¿Seguro que quieres crear la compra?') {
      handleCreateConfirm();
    } else if (confirmationMessage === '¿Seguro que quieres confirmar los cambios?') {
      handleUpdate();
    }

    // Limpia los datos y deshabilita botones, igual que handleCancel
    setUserData({
      id_producto_compra: '',
      id_compra: '',
      producto_id: '',
      cantidad: ''
    });
    setUserId('');
    setIsEditable(false);
    setShowConfirmButtons(false);
    setIsIdSearched(false); // Deshabilita botones Editar y Eliminar
  };

  const handleLogout = () => {
    onLogoutClick();
    navigate('/');
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
                <button className="dropdown-item" onClick={() => setShowEliminar(true)}>Eliminar cuenta</button>
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

      {showEliminar && <Eliminar onClose={handleEliminarClose} user={user} />}


      <div className="users-content-container">
        <div className="users-content-left">
          <h2>Gestión de Compras</h2>

          <div className="search-section">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="ID de compra"
                value={userId}
                onChange={(e) => {
                  const id = e.target.value;

                  // Permitir solo números
                  if (/^\d*$/.test(id)) {
                    setUserId(id);

                    // Limpia las casillas si el campo se vacía
                    if (id.trim() === '') {
                      setUserData({
                        id_producto_compra: '',
                        id_compra: '',
                        producto_id: '',
                        cantidad: '',
                      });
                      setIsIdSearched(false); // Bloquea los botones Editar y Eliminar
                    }
                  }
                }}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-button">🔍</button>
            </div>
          </div>


          <div className="action-buttons">
            <button onClick={handleCreate} disabled={isIdSearched || showConfirmButtons}>Crear</button>
            <button onClick={handleEdit} disabled={!isIdSearched || showConfirmButtons}>Editar</button>
            <button onClick={handleDelete} disabled={!isIdSearched || showConfirmButtons}>Eliminar</button>
          </div>

          <div className="user-details">
            <div className="user-field">
              <label>ID Producto Compra:</label>
              <input
                type="text"
                value={userData.PRODUCTO_ID || ''} // Fallback para evitar undefined
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) { // Permite solo números
                    setUserData({ ...userData, PRODUCTO_ID: value });
                  }
                }}
                readOnly={!isEditable}
                className="user-input"
              />
            </div>
            <div className="user-field">
              <label>ID Compra:</label>
              <input
                type="text"
                value={userData.ID_COMPRA || ''} // Fallback para evitar undefined
                onChange={(e) => setUserData({ ...userData, ID_COMPRA: e.target.value })}
                readOnly={!isEditable}
                className="user-input" // Agregada la clase
              />
            </div>
            <div className="user-field">
              <label>ID Producto:</label>
              <input
                type="text"
                value={userData.PRODUCTO_ID || ''} // Fallback para evitar undefined
                onChange={(e) => setUserData({ ...userData, PRODUCTO_ID: e.target.value })}
                readOnly={!isEditable}
                className="user-input" // Agregada la clase
              />
            </div>
            <div className="user-field">
              <label>Cantidad:</label>
              <input
                type="text"
                value={userData.CANTIDAD || ''} // Fallback para evitar undefined
                onChange={(e) => setUserData({ ...userData, CANTIDAD: e.target.value })}
                readOnly={!isEditable}
                className="user-input" // Agregada la clase
              />
            </div>
          </div>


          {showConfirmButtons && (
            <div className="confirm-buttons">
              <button onClick={handleCancel}>Cancelar</button>
              <button onClick={handleConfirm}>Confirmar</button>
            </div>
          )}

          {showConfirmationModal && (
            <div className="confirmation-modal">
              <p>{confirmationMessage}</p>
              <button
                onClick={() => {
                  handleCancel();
                  setIsIdSearched(false); // Bloquear botones Editar y Eliminar
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  finalConfirm();
                  setIsIdSearched(false); // Bloquear botones Editar y Eliminar
                }}
              >
                Confirmar
              </button>
            </div>
          )}

        </div>

        <div className="users-content-right">
          <h2>Todos las Compras</h2>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID PRODUCTO COMPRA</th>
                  <th>ID COMPRA</th>
                  <th>ID PRODUCTO</th>
                  <th>CANTIDAD</th>
                </tr>
              </thead>
              <tbody>
                {allCompras.length > 0 ? (
                  allCompras.map((compra) => (
                    <tr key={compra.ID_PRODUCTO_COMPRA}>
                      <td>{compra.ID_PRODUCTO_COMPRA}</td>
                      <td>{compra.ID_COMPRA}</td>
                      <td>{compra.PRODUCTO_ID}</td>
                      <td>{compra.CANTIDAD}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No hay compras disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaraCompra;
