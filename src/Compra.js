//compra.js 
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Compra.css';
import { CartContext } from './CartContext';
import Eliminar from './Eliminar';


const Compra = ({ user, onLogoutClick, onLoginClick }) => {
  const [idCompra, setIdCompra] = useState('');
  const [compraData, setCompraData] = useState({
    id_usuario: '',
    fecha_compra: '',
    total: '',
    tipo_pago: '',
    direccion: '',
    telefono: '',
  });
  const [isEditable, setIsEditable] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState({
    edit: false,
    delete: false,
    create: false,
  });
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
      const response = await fetch('https://bdbuildyourteach.dtechne.com/compras/');
      const data = await response.json();
      console.log('Datos de compras:', data); // Agrega este log para depuración
      if (Array.isArray(data)) {
        const validData = data.filter((compra) => compra.ID_COMPRA); // Usa las propiedades correctas
        setAllCompras(validData);
      } else {
        console.error('Datos inesperados:', data);
        setAllCompras([]);
      }
    } catch (error) {
      console.error('Error al cargar todas las compras:', error);
      setAllCompras([]);
    }
  };

  useEffect(() => {
    fetchAllCompras();
  }, []);


  const handleSearch = async () => {
    // Validar que el campo ID de compra no esté vacío
    if (idCompra.trim() === '') {
      alert('Por favor ingrese un ID de compra válido.');
      return;
    }

    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/compras/${idCompra}`);
      if (!response.ok) throw new Error('Compra no encontrada');
      const data = await response.json();

      console.log('Datos recibidos de la API:', data);

      const formattedDate = data.FECHA_COMPRA
        ? new Date(data.FECHA_COMPRA).toISOString().split('T')[0]
        : '';

      setCompraData({
        id_usuario: data.ID_USUARIO || '',
        fecha_compra: formattedDate,
        total: data.TOTAL || '',
        tipo_pago: data.TIPO_PAGO || '',
        direccion: data.DIRECCION || '',
        telefono: data.TELEFONO || '',
      });

      setIsEditable(false);
      setShowConfirmButtons(false);
      setIsIdSearched(true);

      // Habilita los botones de editar y eliminar, deshabilita el de crear
      setButtonsDisabled({ edit: false, delete: false, create: true });
    } catch (error) {
      console.error('Error:', error);
      alert('Compra no encontrada');

      // Deshabilita editar y eliminar, habilita crear
      setButtonsDisabled({ edit: true, delete: true, create: false });
    }
  };



  const handleCreate = () => {
    setCompraData({
      id_usuario: '',
      fecha_compra: '',
      total: '',
      tipo_pago: '',
      direccion: '',
      telefono: ''
    });
    setIdCompra(''); // Resetea el ID de compra
    setIsEditable(true);
    setShowConfirmButtons(true);
    setIsIdSearched(false);
    setConfirmationMessage('¿Seguro que quieres crear la compra?');
  };


  const handleCreateConfirm = async () => {
    if (!compraData.id_usuario || !compraData.fecha_compra || !compraData.total || !compraData.tipo_pago || !compraData.direccion || !compraData.telefono) {
      alert("Por favor completa todos los campos antes de crear la compra.");
      return;
    }

    try {
      // Verificar si el usuario existe
      console.log("Verificando si el usuario existe:", compraData.id_usuario);
      const userResponse = await fetch(`https://bdbuildyourteach.dtechne.com/usuarios/${compraData.id_usuario}`);
      if (!userResponse.ok) {
        alert("El usuario ingresado no existe.");
        console.log("El usuario ingresado no existe:", compraData.id_usuario);
        return;
      }

      // Crear la compra
      const payload = {
        id_usuario: compraData.id_usuario,
        fecha_compra: new Date(compraData.fecha_compra).toISOString(), // Formatear fecha a ISO
        total: compraData.total,
        tipo_pago: compraData.tipo_pago,
        direccion: compraData.direccion,
        telefono: compraData.telefono,
      };
      console.log("Payload enviado al backend:", payload); // <-- Log para verificar

      const response = await fetch('https://bdbuildyourteach.dtechne.com/compra/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error en la creación:', errorText);
        throw new Error('Error al crear la compra');
      }

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      alert(data.message || 'Compra creada exitosamente.');
      setCompraData({
        id_usuario: '',
        fecha_compra: '',
        total: '',
        tipo_pago: '',
        direccion: '',
        telefono: ''
      });
      setIsEditable(false);
      setShowConfirmButtons(false);
      fetchAllCompras(); // Actualizar la lista completa de compras
    } catch (error) {
      console.log('Error al crear la compra:', error.message);
      alert('Error al crear la compra.');
    }
  };

  const handleEdit = () => {
    setIsEditable(true);
    setShowConfirmButtons(true);
    setConfirmationMessage('¿Seguro que quieres confirmar los cambios?');
  };

  const handleUpdate = async () => {
    if (!compraData.id_usuario || !compraData.fecha_compra || !compraData.total || !compraData.tipo_pago || !compraData.direccion || !compraData.telefono) {
      alert("Por favor completa todos los campos antes de actualizar la compra.");
      return;
    }
    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/compra/${idCompra}/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Error al actualizar la compra.');
        return;
      }

      const data = await response.json();
      alert(data.message || 'Compra actualizada exitosamente.');
      setIsEditable(false);
      setShowConfirmButtons(false);
      fetchAllCompras(); // Actualizar la lista de compras
    } catch (error) {
      console.error('Error al actualizar la compra:', error);
      alert('Error al actualizar la compra.');
    }
  };

  const handleDelete = () => {
    setShowConfirmButtons(true);
    setConfirmationMessage('¿Seguro que quieres eliminar la compra?');
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/compra/${idCompra}/eliminar`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar la compra');
      const data = await response.json();
      alert(data.message || 'Compra eliminada exitosamente.');
      setCompraData({ // Limpia los datos correctamente
        id_usuario: '',
        fecha_compra: '',
        total: '',
        tipo_pago: '',
        direccion: '',
        telefono: '',
      });
      setIsEditable(false);
      setShowConfirmButtons(false);
      fetchAllCompras(); // Actualizar la lista de compras
    } catch (error) {
      console.error('Error al eliminar la compra:', error);
      alert('Error al eliminar la compra.');
    }
  };

  const handleLogout = () => {
    onLogoutClick();
    navigate('/');
  };

  const handleConfirm = () => {
    setShowConfirmationModal(true);
    setButtonsDisabled({ edit: true, delete: true, create: false }); // Bloquea Editar/Eliminar y habilita Crear
  };


  const handleCancel = () => {
    setIsEditable(false);
    setShowConfirmButtons(false);
    setShowConfirmationModal(false);
    setCompraData({
      id_usuario: '',
      fecha_compra: '',
      total: '',
      tipo_pago: '',
      direccion: '',
      telefono: ''
    });
    setIdCompra('');
    setButtonsDisabled({ edit: true, delete: true, create: false }); // Bloquea Editar/Eliminar y habilita Crear
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
    fetchAllCompras(); // Actualiza la lista de compras tras cualquier acción
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
              <Link to="/users" className="navbar-button">Profe</Link>
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
        <div className="users-content-top">
          <h2>Gestión de Compras</h2>

          <div className="search-section">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="ID de compra"
                value={idCompra}
                onChange={(e) => {
                  const id = e.target.value;

                  // Permitir solo números
                  if (/^\d*$/.test(id)) {
                    setIdCompra(id);

                    setShowConfirmButtons(false);
                    setIsEditable(false);
                    setCompraData({
                      id_usuario: '',
                      fecha_compra: '',
                      total: '',
                      tipo_pago: '',
                      direccion: '',
                      telefono: '',
                    });
                    setIsIdSearched(false);

                    // Si el campo está vacío, deshabilita Editar/Eliminar y habilita Crear
                    if (id.trim() === '') {
                      setButtonsDisabled({ edit: true, delete: true, create: false });
                    } else {
                      setButtonsDisabled({ edit: false, delete: false, create: true });
                    }
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
              disabled={buttonsDisabled.create}
            >
              Crear
            </button>
            <button
              className="action-button"
              onClick={handleEdit}
              disabled={buttonsDisabled.edit || !isIdSearched}
            >
              Editar
            </button>
            <button
              className="action-button"
              onClick={handleDelete}
              disabled={buttonsDisabled.delete || !isIdSearched}
            >
              Eliminar
            </button>
          </div>

          <div className="user-details">
            <div className="user-field">
              <label>ID Usuario:</label>
              <input
                type="text"
                value={compraData.id_usuario || ''} // Fallback para evitar undefined
                onChange={(e) => setCompraData({ ...compraData, id_usuario: e.target.value })}
                readOnly={!isEditable}
                className="user-input"
              />
            </div>

            <div className="user-field">
              <label>Fecha Compra:</label>
              <input
                type="date" // Cambiar a "date" para facilitar el ingreso de fechas válidas
                value={compraData.fecha_compra || ''}
                onChange={(e) => setCompraData({ ...compraData, fecha_compra: e.target.value })}
                readOnly={!isEditable}
                className="user-input"
              />
            </div>

            <div className="user-field">
              <label>Total:</label>
              <input
                type="text"
                value={compraData.total || ''}
                onChange={(e) => setCompraData({ ...compraData, total: e.target.value })}
                readOnly={!isEditable}
                className="user-input"
              />
            </div>

            <div className="user-field">
              <label>Tipo de Pago:</label>
              <input
                type="text"
                value={compraData.tipo_pago || ''}
                onChange={(e) => setCompraData({ ...compraData, tipo_pago: e.target.value })}
                readOnly={!isEditable}
                className="user-input"
              />
            </div>
          </div>

          {showConfirmButtons && (
            <div className="confirm-buttons">
              <button className="cancel-button" onClick={() => {
                handleCancel();
                setShowConfirmButtons(false);
              }}>Cancelar</button>
              <button className="confirm-button" onClick={() => {
                handleConfirm();
                setShowConfirmButtons(false);
              }}>Confirmar</button>
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

        <div className="users-content-bottom">
          <h2>Todos las Compras</h2>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID COMPRA</th>
                  <th>ID USUARIO</th>
                  <th>FECHA COMPRA</th>
                  <th>TOTAL</th>
                  <th>TIPO PAGO</th>
                </tr>
              </thead>
              <tbody>
                {allCompras.length > 0 ? (
                  allCompras.map((compra, index) => (
                    <tr key={compra.ID_COMPRA || `compra-${index}`}>
                      <td>{compra.ID_COMPRA}</td>
                      <td>{compra.ID_USUARIO}</td>
                      <td>{compra.FECHA_COMPRA}</td>
                      <td>{compra.TOTAL}</td>
                      <td>{compra.TIPO_PAGO}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No hay compras disponibles</td>
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

export default Compra;
