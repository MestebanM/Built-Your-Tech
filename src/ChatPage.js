//CHATPAGE.JS
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIA } from './IAContext';
import { CartContext } from './CartContext';
import './ChatPage.css';
import Calificacion from './Calificacion';


const ChatPage = ({ user, onLoginClick, onLogoutClick }) => {
  // eslint-disable-next-line no-unused-vars
  const { updateResponses } = useIA();
  const { addToCart, getTotalItems } = useContext(CartContext);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [showAdvancedQuestions, setShowAdvancedQuestions] = useState(false);
  const [productosRecomendados, setProductosRecomendados] = useState([]);
  const [showCalificacion, setShowCalificacion] = useState(false); // Controla si el modal está abierto
  const [selectedProduct, setSelectedProduct] = useState(null);   // Producto seleccionado para el modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const clearResults = () => {
    setShowResults(false);
    setShowResultsButton(false); // Oculta el botón de mostrar resultados
    setProductosRecomendados([]); // Limpia los productos recomendados
  };


  const [formData, setFormData] = useState({
    userType: '',
    careerOrProfession: '',
    pcType: '',
    gamesOrActivities: '',

    advancedFeatures: '',
    osPreference: [],
    brandPreference: [],
    memory: [],
    storage: [],
    processorBrands: [], // Inicializa como array vacío
    processorModels: [], // Inicializa como array vacío
    gpuBrands: [], // Inicializa como array vacío
    gpuModels: [],

    needHelp: '',
    graphicNeeds: '',
    processorNeeds: '',
    ramNeeds: '',
    storageNeeds: '',

    budget: 0,
    minBudget: '',
    maxBudget: ''
  });




  const [recommendation, setRecommendation] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [formularioCreado, setFormularioCreado] = useState(false); // Estado para controlar el índice del producto mostrado
  const isEffectCalled = useRef(false); // Controla si el efecto ya fue llamado
  const [formularioId, setFormularioId] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 }); // Estado para guardar el rango de precios
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const isAdmin = user && user.role === '1';

  // Al hacer clic en un producto en ChatPage, abre el modal de la misma manera que en SalesPage
  const openCalificacionModal = (producto) => {
    if (!producto || !producto.producto_id) {
      console.error("El producto seleccionado no tiene un ID válido");
      return;
    }


    // Establecer el producto seleccionado con toda la información necesaria
    const selected = {
      id: producto.producto_id, // Usa el campo correcto del producto normalizado
      nombre: producto.nombre || "Producto sin nombre",
      procesador: producto.procesador || "No especificado",
      ram: producto.ram || "No especificado",
      almacenamiento: producto.almacenamiento || "No especificado",
      grafica: producto.grafica || "No especificado",
      imagen: producto.imagen || "url_de_imagen_por_defecto.jpg",
      precio: producto.precio || "0",
      descripcion: producto.descripcion || "Sin descripción",
    };


    setSelectedProduct(selected);

    setShowCalificacion(true); // Muestra el modal
  };


  // Asegúrate de cerrar el modal correctamente
  const closeCalificacionModal = () => {
    setSelectedProduct(null); // Limpia el producto seleccionado
    setShowCalificacion(false); // Oculta el modal
  };

  // Verificación de autenticación
  const createFormulario = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('https://bdbuildyourteach.dtechne.com/backend/create-formulario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("Formulario creado con éxito:", data.formularioId);
        setFormularioId(data.formularioId);
        setFormularioCreado(true);
      } else {
        console.error("Error al crear el formulario:", data.message);
      }
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  }, [user]); // Memoriza la función y actualízala solo cuando cambie `user`

  useEffect(() => {
    if (!isEffectCalled.current) {
      isEffectCalled.current = true; // Marca que el efecto ya fue ejecutado
      createFormulario(); // Ejecuta la creación del formulario
    }
  }, [createFormulario]); // Ahora `useEffect` depende de `createFormulario`

  // Obtener recomendaciones
  const fetchRecomendaciones = useCallback(async () => {
    clearResults(); // Limpia los resultados previos antes de obtener nuevos

    if (!formularioId) {
      console.error("Formulario ID no definido.");
      return;
    }

    try {
      setIsFetchingResults(true); // Indicar que se están cargando los resultados
      const response = await fetch(`https://bdbuildyourteach.dtechne.com/backend/recomendaciones-detalles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, formularioId }), // Enviar el userId y formularioId al backend
      });

      const data = await response.json();

      if (data.success) {
        setProductosRecomendados(data.recomendaciones); // Guardar las recomendaciones en el estado
        setShowResults(true); // Mostrar los resultados
      } else {
        console.error("Error al obtener recomendaciones del backend:", data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error en la conexión al backend:", error);
      alert("Error al conectar con el backend. Revisa la consola para más detalles.");
    } finally {
      setIsFetchingResults(false); // Indicar que se terminó la carga
      setShowResultsButton(false); // Oculta el botón al terminar
    }
  }, [user, formularioId]); // Agregar formularioId como dependencia
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };




  const handleLogout = () => {
    onLogoutClick();
    navigate('/');
  };

  // Maneja el cambio de valores del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "budget") {
      // Permite solo números en el campo de presupuesto
      const numericValue = value.replace(/\D/g, ""); // Elimina cualquier carácter que no sea número
      setFormData({ ...formData, [name]: numericValue });
    } else if (type === 'checkbox') {
      const updatedFeatures = checked
        ? [...formData[name], value]
        : formData[name].filter(feature => feature !== value);
      setFormData({ ...formData, [name]: updatedFeatures });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const [budgetError, setBudgetError] = useState('');



  useEffect(() => {
    // Llamar al backend para obtener el rango de precios
    fetch('https://bdbuildyourteach.dtechne.com/backend/productos/rango-precios')
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener el rango de precios");
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setPriceRange({
            min: data.data.precioMinimo,
            max: data.data.precioMaximo,
          });
        }
      })
      .catch(error => console.error('Error al obtener el rango de precios:', error));
  }, []);


  const handleBudgetChange = (e, field) => {
    const inputValue = e.target.value || ''; // Si el valor es undefined, se convierte en una cadena vacía

    // Eliminar caracteres no numéricos y formatear con puntos
    const numericValue = inputValue.replace(/\D/g, '');
    const formattedValue = new Intl.NumberFormat('de-DE').format(numericValue); // Formato de miles

    setFormData((prevData) => {
      const updatedData = { ...prevData, [field]: formattedValue };

      // Validar si el presupuesto mínimo es mayor que el máximo
      const minBudget = parseInt((updatedData.minBudget || '0').replace(/\./g, '')) || 0;
      const maxBudget = parseInt((updatedData.maxBudget || '0').replace(/\./g, '')) || 0;

      if (minBudget < priceRange.min || maxBudget > priceRange.max) {
        setBudgetError(
          `El presupuesto debe estar entre ${priceRange.min.toLocaleString('de-DE')} y ${priceRange.max.toLocaleString('de-DE')}.`
        );
      } else if (minBudget > maxBudget) {
        setBudgetError('El presupuesto mínimo no puede ser mayor que el presupuesto máximo.');
      } else {
        setBudgetError(''); // Si todo está bien, limpiamos los errores
      }

      return updatedData;
    });
  };





  // Validar cada paso para asegurarse de que el campo no esté vacío
  const validateStep = () => {
    if (step === 0 && !formData.userType) {
      setErrorMessage('Por favor selecciona tu perfil.');
      return false;
    }
    if (step === 1 && !formData.careerOrProfession && formData.userType !== 'Gamer' && formData.userType !== 'Uso Doméstico') {
      setErrorMessage('Por favor selecciona tu carrera o profesión.');
      return false;
    }
    if (step === 2 && !formData.pcType) {
      setErrorMessage('Por favor selecciona el tipo de computador.');
      return false;
    }
    if (step === 3 && !formData.advancedFeatures) {
      setErrorMessage('Por favor selecciona si deseas acceder a características avanzadas.');
      return false;
    }
    if (step === 4 && showAdvancedQuestions && !formData.memory.length) {
      setErrorMessage('Por favor selecciona al menos una opción de memoria RAM.');
      return false;
    }
    if (step === 5 && showAdvancedQuestions && !formData.storage.length) {
      setErrorMessage('Por favor selecciona al menos una opción de almacenamiento.');
      return false;
    }
    if (step === 6 && showAdvancedQuestions && !formData.osPreference.length) {
      setErrorMessage('Por favor selecciona al menos una opción de sistema operativo.');
      return false;
    }
    if (step === 7 && showAdvancedQuestions && !formData.brandPreference.length) {
      setErrorMessage('Por favor selecciona al menos una opción de marca.');
      return false;
    }
    if (step === 8 && (!Array.isArray(formData.processorBrands) || formData.processorBrands.length === 0)) {
      setErrorMessage("Por favor selecciona al menos una marca de procesador.");
      return false;
    }
    if (step === 9 && (!Array.isArray(formData.processorModels) || formData.processorModels.length === 0)) {
      setErrorMessage("Por favor selecciona al menos un modelo de procesador.");
      return false;
    }
    if (step === 10 && (!Array.isArray(formData.gpuBrands) || formData.gpuBrands.length === 0)) {
      setErrorMessage("Por favor selecciona al menos una marca de tarjeta gráfica.");
      return false;
    }
    if (step === 11 && !formData.gpuModels.length) {
      setErrorMessage("Por favor selecciona al menos un modelo de tarjeta gráfica.");
      return false;
    }
    if (step === 12 && !formData.needHelp) {
      setErrorMessage("Por favor selecciona si necesitas ayuda para elegir los componentes.");
      return false;
    }
    if (step === 13 && !formData.graphicNeeds) {
      setErrorMessage("Por favor selecciona una opción para tus necesidades gráficas.");
      return false;
    }
    if (step === 14 && !formData.processorNeeds) {
      setErrorMessage("Por favor selecciona una opción para el procesador.");
      return false;
    }
    if (step === 15 && !formData.ramNeeds) {
      setErrorMessage("Por favor selecciona una opción para la memoria RAM.");
      return false;
    }
    if (step === 16 && !formData.storageNeeds) {
      setErrorMessage("Por favor selecciona una opción para el almacenamiento.");
      return false;
    }
    if (step === 17 && (!formData.minBudget || isNaN((formData.minBudget || '').replace(/\./g, '')) || !formData.maxBudget || isNaN((formData.maxBudget || '').replace(/\./g, '')))) {
      setErrorMessage('Por favor ingresa un presupuesto válido.');
      return false;
    }


    setErrorMessage('');
    return true;
  };

  const prepareAnswers = () => {
    const answers = [];

    // Preguntas de selección única
    if (formData.userType) {
      answers.push({
        questionId: 10, // "¿Cuál de las siguientes opciones describe mejor tu perfil?"
        answerText: formData.userType,
      });
    }

    if (formData.careerOrProfession) {
      answers.push({
        questionId: formData.userType === "Estudiante" ? 11 : 12, // Según el perfil
        answerText: formData.careerOrProfession,
      });
    }

    if (formData.gamesOrActivities) {
      answers.push({
        questionId: 13, // "¿Qué tipo de juegos sueles jugar?"
        answerText: formData.gamesOrActivities,
      });
    }

    if (formData.activities) {
      answers.push({
        questionId: 14, // "¿Para qué actividades principales usarás el computador?"
        answerText: formData.gamesOrActivities,
      });
    }

    if (formData.pcType) {
      answers.push({
        questionId: 15, // "¿Prefieres un computador portátil o de escritorio?"
        answerText: formData.pcType,
      });
    }

    if (formData.advancedFeatures) {
      answers.push({
        questionId: 16, // "¿Quieres acceder a características avanzadas?"
        answerText: formData.advancedFeatures,
      });
    }

    if (formData.processorBrands > 0) {
      answers.push({
        questionId: 23, // "¿Prefieres alguna marca de procesadores?"
        answerText: formData.processorBrands,
      });
    }

    if (formData.gpuBrands > 0) {
      answers.push({
        questionId: 25, // "¿Tienes preferencia por la marca de la tarjeta gráfica?"
        answerText: formData.gpuBrands,
      });
    }

    if (formData.minBudget) {
      answers.push({
        questionId: 21, // "¿Cuál es tu presupuesto mínimo para el computador?"
        answerText: formData.minBudget,
      });
    }

    if (formData.maxBudget) {
      answers.push({
        questionId: 22, // "¿Cuál es tu presupuesto máximo para el computador?"
        answerText: formData.maxBudget,
      });
    }

    // Pregunta 27 - "¿Sabes lo que necesitas o necesitas guía?"
    if (formData.needHelp) {
      answers.push({
        questionId: 27, // "¿Sabes lo que necesitas o necesitas guía?"
        answerText: formData.needHelp,
      });
    }

    // Preguntas de selección múltiple
    if (formData.memory.length > 0) {
      answers.push({
        questionId: 17, // "¿Cuánta memoria RAM desea que incluya su computador?"
        options: formData.memory,
      });
    }

    if (formData.storage.length > 0) {
      answers.push({
        questionId: 20, // "¿Cuánto almacenamiento desea que incluya su computador?"
        options: formData.storage,
      });
    }

    if (formData.osPreference.length > 0) {
      answers.push({
        questionId: 18, // "Seleccione su sistema operativo de preferencia."
        options: formData.osPreference,
      });
    }

    if (formData.brandPreference.length > 0) {
      answers.push({
        questionId: 19, // "Seleccione la compañía de preferencia para su computador."
        options: formData.brandPreference,
      });
    }

    if (formData.processorModels.length > 0) {
      answers.push({
        questionId: 24, // "Elige modelos de procesadores según las marcas."
        options: formData.processorModels,
      });
    }

    if (formData.gpuModels.length > 0) {
      answers.push({
        questionId: 26, // "Elige modelos de tarjetas gráficas según las marcas."
        options: formData.gpuModels,
      });
    }

    if (formData.graphicNeeds) {
      answers.push({
        questionId: 28, // "¿Qué actividades requieren buen rendimiento gráfico?"
        answerText: formData.graphicNeeds,
      });
    }

    if (formData.processorNeeds) {
      answers.push({
        questionId: 29, // "¿Qué nivel de rendimiento de procesador necesitas?"
        answerText: formData.processorNeeds,
      });
    }

    if (formData.ramNeeds) {
      answers.push({
        questionId: 30, // "¿Qué uso le darás al computador para definir RAM?"
        answerText: formData.ramNeeds,
      });
    }

    if (formData.storageNeeds) {
      answers.push({
        questionId: 31, // "¿Cuánto espacio necesitas para guardar archivos?"
        answerText: formData.storageNeeds,
      });
    }

    return answers;
  };

  // Manejador para avanzar en el formulario y enviar la recomendación
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    clearResults();

    if (!formularioId) {
      console.error("El formularioId no está definido");
      setRecommendation("Hubo un error al procesar el formulario.");
      return;
    }

    const answers = prepareAnswers();

    try {
      setIsSubmitting(true);
      const response = await fetch("https://bdbuildyourteach.dtechne.com/backend/save-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          formularioId,
          answers,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendation("Tus respuestas han sido guardadas correctamente.");
        setShowResultsButton(true);
      } else {
        setRecommendation("Hubo un error al guardar tus respuestas.");
      }
    } catch (error) {
      console.error("Error al guardar las respuestas:", error);
      setRecommendation("Error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const resetForm = () => {
    setStep(0); // Reinicia al primer paso
    setShowAdvancedQuestions(false); // Resetea las preguntas avanzadas
    setFormData({
      userType: '',
      careerOrProfession: '',
      pcType: '',
      gamesOrActivities: '',

      advancedFeatures: '',
      osPreference: [],
      brandPreference: [],
      memory: [],
      storage: [],
      processorBrands: [], // Inicializa como array vacío
      processorModels: [], // Inicializa como array vacío
      gpuBrands: [], // Inicializa como array vacío
      gpuModels: [],

      needHelp: '',
      graphicNeeds: '',
      processorNeeds: '',
      ramNeeds: '',
      storageNeeds: '',

      budget: 0,
      minBudget: '',
      maxBudget: ''
    });
    setRecommendation(''); // Borra la recomendación actual
    setShowResults(false); // Oculta los resultados
    setShowResultsButton(false); // Oculta el botón de resultados
    setErrorMessage('');
    setErrorMessage(''); // Limpia los mensajes de error
  };


  const handleNextStep = (e) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    // Si estamos en el paso 11, salta directamente al paso 17
    if (step === 11) {
      setStep(17);
      return;
    }

    // Si estamos en el paso 3 y no seleccionaron características avanzadas
    if (step === 3 && formData.advancedFeatures === "No") {
      setStep(12); // Salta a la pregunta "¿Necesitas ayuda?"
      return;
    }

    // Si estamos en el paso 12, redirige según la selección
    if (step === 12) {
      if (formData.needHelp === "No") {
        setStep(17); // Salta directamente al presupuesto
      } else if (formData.needHelp === "Sí") {
        setStep(13); // Continua con las preguntas guiadas
      }
      return;
    }

    // Continuar al siguiente paso en otros casos
    setStep(step + 1);
  };

  const handleBack = () => {
    // Si estamos en el paso 12 y no se seleccionaron características avanzadas
    if (step === 12 && formData.advancedFeatures === 'No') {
      setStep(3); // Retrocede directamente al paso 3
      return;
    }

    // Retroceder desde el paso 13 (preguntas guiadas)
    if (step === 13 && formData.needHelp === 'Sí') {
      setStep(12); // Retrocede al paso 12
      return;
    }

    // Retroceder desde el paso 17 (presupuesto)
    if (step === 17) {
      if (formData.gpuBrands && formData.gpuBrands.length > 0) {
        setStep(11); // Si venías del paso 11, retrocede a ese paso
        return;
      } else if (formData.needHelp === 'Sí') {
        setStep(16); // Retrocede a la última pregunta guiada
      } else {
        setStep(12); // Retrocede a la pregunta "¿Necesitas ayuda?"
      }
      return;
    }

    // Retroceder al paso anterior para otros casos
    setStep((prevStep) => {
      const newStep = prevStep - 1;

      // Ajustar datos según el paso previo
      if (newStep === 0) {
        setFormData({ ...formData, userType: '' });
      } else if (newStep === 1) {
        setFormData({ ...formData, careerOrProfession: '' });
      } else if (newStep === 2) {
        setFormData({ ...formData, pcType: '' });
      } else if (newStep === 3) {
        setFormData({ ...formData, advancedFeatures: '', memory: [], storage: [] });
      } else if (newStep === 8) {
        // Limpia los datos de marcas y modelos avanzados si retrocedes al paso 8
        setFormData({
          ...formData,
          processorBrands: [],
          processorModels: [],
        });
      } else if (newStep === 10) {
        // Limpia los datos de GPU si retrocedes al paso 10
        setFormData({
          ...formData,
          gpuBrands: [],
          gpuModels: [],
        });
      }

      return newStep;
    });
  };

  // Funciones para cambiar de producto
  const handleNextProduct = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex < productosRecomendados.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePreviousProduct = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : productosRecomendados.length - 1
    );
  };


  // Pasos del formulario según la selección
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <label>¿Cómo describirías el uso principal que le darás al computador?</label>
            <select name="userType" value={formData.userType} onChange={handleInputChange}>
              <option value="">Selecciona tu perfil</option>
              <option value="Estudiante">Soy estudiante y lo usaré para actividades académicas.</option>
              <option value="Profesional">Soy profesional y necesito herramientas para mi trabajo.</option>
              <option value="Gamer">Soy gamer y busco una experiencia de alto rendimiento en juegos.</option>
              <option value="Uso Doméstico">Lo quiero para uso doméstico, como navegar por Internet y entretenimiento.</option>
            </select>
          </>
        );
      case 1:
        if (formData.userType === 'Estudiante') {
          return (
            <>
              <label>¿En qué campo de estudio estás desarrollando tu carrera académica?</label>
              <select name="careerOrProfession" value={formData.careerOrProfession} onChange={handleInputChange}>
                <option value="">Selecciona tu campo de estudio</option>
                <option value="Ingeniería">Ingeniería (civil, industrial, mecánica, entre otras).</option>
                <option value="Diseño Gráfico">Diseño gráfico o multimedia.</option>
                <option value="Ciencias de la Computación">Ciencias de la computación o programación.</option>
                <option value="Medicina">Medicina o áreas de la salud.</option>
                <option value="Derecho">Derecho.</option>
                <option value="Arquitectura">Arquitectura o diseño urbano.</option>
                <option value="Economía">Economía, administración o finanzas.</option>
                <option value="Psicología">Psicología o ciencias sociales.</option>
                <option value="Educación">Educación o formación académica.</option>
                <option value="Comunicación Social">Comunicación social, marketing o periodismo.</option>
                <option value="Filosofía">Filosofía o humanidades.</option>
                <option value="Ciencias Naturales">Ciencias naturales como química o biología.</option>
              </select>
            </>
          );
        } else if (formData.userType === 'Profesional') {
          return (
            <>
              <label>¿A qué área profesional te dedicas principalmente?</label>
              <select name="careerOrProfession" value={formData.careerOrProfession} onChange={handleInputChange}>
                <option value="">Selecciona tu área profesional</option>
                <option value="Diseño Gráfico">Diseño gráfico o multimedia.</option>
                <option value="Ingeniería">Ingeniería (civil, industrial, mecánica, entre otras).</option>
                <option value="Desarrollo de Software">Desarrollo de software o programación.</option>
                <option value="Medicina">Medicina o investigación en salud.</option>
                <option value="Arquitectura">Arquitectura o diseño urbano.</option>
                <option value="Abogacía">Abogacía o consultoría legal.</option>
                <option value="Contaduría">Contaduría o gestión financiera.</option>
                <option value="Producción Audiovisual">Producción audiovisual (fotografía o edición de video).</option>
                <option value="Docencia">Docencia o formación académica.</option>
                <option value="Psicología">Psicología o asesoramiento profesional.</option>
                <option value="Investigación">Investigación científica o académica.</option>
              </select>
            </>
          );
        } else if (formData.userType === 'Gamer') {
          return (
            <>
              <label>¿Qué tipo de videojuegos disfrutas jugar con mayor frecuencia?</label>
              <select name="gamesOrActivities" value={formData.gamesOrActivities} onChange={handleInputChange}>
                <option value="">Selecciona tu tipo de juegos</option>
                <option value="Casuales">Juegos casuales (puzzles, aventuras ligeras, etc.).</option>
                <option value="Competitivos">Juegos competitivos en línea (como e-sports y shooters).</option>
                <option value="AAA">Juegos AAA (títulos de alto rendimiento y gráficos avanzados).</option>
              </select>
            </>
          );
        } else {
          return (
            <>
              <label>¿Qué actividades básicas planeas realizar con el computador?</label>
              <select name="gamesOrActivities" value={formData.gamesOrActivities} onChange={handleInputChange}>
                <option value="">Selecciona tu uso principal</option>
                <option value="Navegar">Navegar por Internet y gestionar correos.</option>
                <option value="Streaming">Ver videos y escuchar música en plataformas de streaming.</option>
                <option value="Oficina">Realizar tareas básicas de oficina (Word, Excel, etc.).</option>
                <option value="Edición Ligera">Edición ligera de fotos y videos.</option>
              </select>
            </>
          );
        }
      case 2:
        return (
          <>
            <label>¿Qué tipo de computador prefieres según tus necesidades?</label>
            <select name="pcType" value={formData.pcType} onChange={handleInputChange}>
              <option value="">Selecciona el tipo de PC</option>
              <option value="Portátil">Prefiero un portátil por su portabilidad.</option>
              <option value="Escritorio">Prefiero un computador de escritorio por su mayor potencia.</option>
              <option value="Indiferente">No tengo preferencia, cualquiera me funcionaría.</option>
            </select>
          </>
        );
      case 3:
        return (
          <>
            <label>¿Estás interesado en un computador con características avanzadas? Esto incluye componentes como más memoria RAM, almacenamiento y opciones específicas para rendimiento.</label>
            <select
              name="advancedFeatures"
              value={formData.advancedFeatures}
              onChange={(e) => {
                handleInputChange(e);
                setShowAdvancedQuestions(e.target.value === 'Sí');
              }}
            >
              <option value="">Selecciona una opción</option>
              <option value="Sí">Sí, quiero explorar opciones avanzadas.</option>
              <option value="No">No, prefiero un computador estándar y funcional.</option>
            </select>
          </>
        );
      case 4:
        if (showAdvancedQuestions) {
          return (
            <div>
              <label>La memoria RAM afecta la velocidad y capacidad del computador para realizar múltiples tareas. ¿Cuánta RAM consideras necesaria?</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="memory"
                    value="4 GB"
                    checked={formData.memory.includes("4 GB")}
                    onChange={handleInputChange}
                  />
                  4 GB (suficiente para navegación básica y tareas ligeras).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="memory"
                    value="8 GB"
                    checked={formData.memory.includes("8 GB")}
                    onChange={handleInputChange}
                  />
                  8 GB (ideal para uso estándar, multitarea y algunos juegos).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="memory"
                    value="16 GB"
                    checked={formData.memory.includes("16 GB")}
                    onChange={handleInputChange}
                  />
                  16 GB (necesario para edición de video, diseño y gaming avanzado).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="memory"
                    value="32 GB"
                    checked={formData.memory.includes("32 GB")}
                    onChange={handleInputChange}
                  />
                  32 GB o más (para tareas intensivas como modelado 3D o simulaciones).
                </label>
              </div>
            </div>
          );
        }
        break;
      case 5:
        if (showAdvancedQuestions) {
          return (
            <>
              <label>El almacenamiento determina cuánto puedes guardar en el computador. ¿Qué capacidad necesitas?</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="storage"
                    value="256GB"
                    checked={formData.storage.includes("256GB")}
                    onChange={handleInputChange}
                  />
                  256 GB SSD (para un uso básico y rapidez en acceso).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="storage"
                    value="512GB"
                    checked={formData.storage.includes("512GB")}
                    onChange={handleInputChange}
                  />
                  512 GB SSD (para un uso balanceado con espacio suficiente).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="storage"
                    value="1TB"
                    checked={formData.storage.includes("1TB")}
                    onChange={handleInputChange}
                  />
                  1 TB SSD (para almacenamiento masivo y rapidez).
                </label>
              </div>
            </>
          );
        }
        break;
      case 6:
        if (showAdvancedQuestions) {
          return (
            <>
              <label>El sistema operativo define cómo interactúas con el computador. ¿Cuál prefieres?</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="osPreference"
                    value="Windows"
                    checked={formData.osPreference.includes("Windows")}
                    onChange={handleInputChange}
                  />
                  Windows (versatilidad y compatibilidad con la mayoría de software).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="osPreference"
                    value="MacOS"
                    checked={formData.osPreference.includes("MacOS")}
                    onChange={handleInputChange}
                  />
                  MacOS (ecosistema Apple y diseño intuitivo).
                </label>
              </div>
            </>
          );
        }
        break;
      case 7:
        if (showAdvancedQuestions) {
          return (
            <>
              <label>¿Prefieres alguna marca de computador en particular?</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="brandPreference"
                    value="HP"
                    checked={formData.brandPreference.includes("HP")}
                    onChange={handleInputChange}
                  />
                  HP.
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="brandPreference"
                    value="Dell"
                    checked={formData.brandPreference.includes("Dell")}
                    onChange={handleInputChange}
                  />
                  Dell.
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="brandPreference"
                    value="Apple"
                    checked={formData.brandPreference.includes("Apple")}
                    onChange={handleInputChange}
                  />
                  Apple.
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="brandPreference"
                    value="Lenovo"
                    checked={formData.brandPreference.includes("Lenovo")}
                    onChange={handleInputChange}
                  />
                  Lenovo.
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="brandPreference"
                    value="Asus"
                    checked={formData.brandPreference.includes("Asus")}
                    onChange={handleInputChange}
                  />
                  Asus.
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="brandPreference"
                    value="Acer"
                    checked={formData.brandPreference.includes("Acer")}
                    onChange={handleInputChange}
                  />
                  Acer.
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="brandPreference"
                    value="Sin preferencia"
                    checked={formData.brandPreference.includes("Sin preferencia")}
                    onChange={handleInputChange}
                  />
                  Sin preferencia.
                </label>
              </div>
            </>
          );
        }
        break;
      case 8:
        if (showAdvancedQuestions) {
          return (
            <>
              <label>¿Tienes una marca preferida de procesadores para tu computador? Esto puede influir en el rendimiento y compatibilidad de tu equipo.</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="processorBrands"
                    value="Intel"
                    checked={Array.isArray(formData.processorBrands) && formData.processorBrands.includes("Intel")}
                    onChange={handleInputChange}
                  />
                  Intel (reconocida por rendimiento general y compatibilidad).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="processorBrands"
                    value="AMD"
                    checked={Array.isArray(formData.processorBrands) && formData.processorBrands.includes("AMD")}
                    onChange={handleInputChange}
                  />
                  AMD (ideal para multitarea y gaming).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="processorBrands"
                    value="Apple"
                    checked={Array.isArray(formData.processorBrands) && formData.processorBrands.includes("Apple")}
                    onChange={handleInputChange}
                  />
                  Apple (eficiencia y optimización en macOS).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="processorBrands"
                    value="MediaTek"
                    checked={Array.isArray(formData.processorBrands) && formData.processorBrands.includes("MediaTek")}
                    onChange={handleInputChange}
                  />
                  MediaTek (procesadores ligeros para tareas específicas).
                </label>
              </div>
            </>
          );
        }
        break;
      case 9:
        if (showAdvancedQuestions && Array.isArray(formData.processorBrands)) {
          const availableModels = {
            Intel: [
              "Intel Celeron N4000",
              "Intel Celeron N4020",
              "Intel Pentium Gold 5405U",
              "Intel Pentium Silver N5000",
              "Intel Core i3-1005G1",
              "Intel Core i5-1135G7",
              "Intel Core i7-1165G7",
              "Intel Core i7-11800H",
              "Intel Core i9-11900K"
            ],
            AMD: [
              "AMD Ryzen 5 3500U",
              "AMD Ryzen 5 5500U",
              "AMD Ryzen 7 4800H",
              "AMD Ryzen 7 5800",
              "AMD Ryzen 9 5900HX",
              "AMD Ryzen 9 5900X",
              "AMD Athlon 3050U"
            ],
            Apple: [
              "Apple M1",
              "Apple M1 Pro",
              "Apple M2",
              "Apple M2 Pro"
            ],
            MediaTek: [
              "MediaTek MT8173C",
              "MediaTek MT8183"
            ]
          };

          return (
            <>
              <label>Selecciona los modelos de procesadores según las marcas elegidas:</label>
              {formData.processorBrands.map((brand) => (
                <div key={brand}>
                  <h4>{brand}</h4>
                  {(availableModels[brand] || []).map((model) => (
                    <label key={model}>
                      <input
                        type="checkbox"
                        name="processorModels"
                        value={model}
                        checked={Array.isArray(formData.processorModels) && formData.processorModels.includes(model)}
                        onChange={handleInputChange}
                      />
                      {model}
                    </label>
                  ))}
                </div>
              ))}
            </>
          );
        }
        break;
      case 10:
        if (showAdvancedQuestions) {
          return (
            <>
              <label>¿Tienes alguna preferencia por la marca de la tarjeta gráfica que deseas?</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="gpuBrands"
                    value="Intel"
                    checked={Array.isArray(formData.gpuBrands) && formData.gpuBrands.includes("Intel")}
                    onChange={handleInputChange}
                  />
                  Intel (opciones integradas para un uso general y tareas básicas).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="gpuBrands"
                    value="AMD Radeon"
                    checked={Array.isArray(formData.gpuBrands) && formData.gpuBrands.includes("AMD Radeon")}
                    onChange={handleInputChange}
                  />
                  AMD Radeon (gaming y diseño gráfico).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="gpuBrands"
                    value="NVIDIA GeForce"
                    checked={Array.isArray(formData.gpuBrands) && formData.gpuBrands.includes("NVIDIA GeForce")}
                    onChange={handleInputChange}
                  />
                  NVIDIA GeForce (potencia para gaming y diseño profesional).
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="gpuBrands"
                    value="Apple"
                    checked={Array.isArray(formData.gpuBrands) && formData.gpuBrands.includes("Apple")}
                    onChange={handleInputChange}
                  />
                  Apple (optimizada para macOS).
                </label>
              </div>
            </>
          );
        }
        break;
      case 11:
        if (showAdvancedQuestions && Array.isArray(formData.gpuBrands)) {
          const availableGPUs = {
            Intel: [
              "Intel HD Graphics 4400",
              "Intel HD Graphics 4600",
              "Intel HD Graphics 530",
              "Intel Iris Xe Graphics",
              "Intel Iris Plus Graphics",
              "Intel UHD Graphics",
              "Intel UHD Graphics 600",
              "Intel UHD Graphics 605",
              "Intel UHD Graphics 620",
              "Intel UHD Graphics 630"
            ],
            "AMD Radeon": [
              "Radeon RX Vega 11 (integrada)",
              "Radeon Vega 8 (integrada)",
              "Radeon Vega 3 (integrada)",
              "Radeon Pro 5500 XT",
              "Radeon R5",
              "Radeon R4"
            ],
            "NVIDIA GeForce": [
              "NVIDIA GeForce GTX 1650",
              "NVIDIA GeForce GTX 1650 Super",
              "NVIDIA GeForce GTX 1650 Ti",
              "NVIDIA GeForce GTX 1660 Super",
              "NVIDIA GeForce GTX 1660 Ti",
              "NVIDIA GeForce MX450",
              "NVIDIA GeForce RTX 3050",
              "NVIDIA GeForce RTX 3050 Ti",
              "NVIDIA GeForce RTX 3060",
              "NVIDIA GeForce RTX 3060 Ti",
              "NVIDIA GeForce RTX 3070",
              "NVIDIA GeForce RTX 3080",
              "NVIDIA GeForce RTX 3090",
              "NVIDIA Quadro T2000 (para diseño y estaciones de trabajo)"
            ],
            Apple: [
              "Apple M1 (integrada)",
              "Apple M1 Pro (integrada)",
              "Apple M2 (integrada)"
            ],
            Mali: ["Mali-G72 MP3"]
          };

          return (
            <>
              <label>Selecciona los modelos de tarjetas gráficas según las marcas elegidas:</label>
              {formData.gpuBrands.map((brand) => (
                <div key={brand}>
                  <h4>{brand}</h4>
                  {(availableGPUs[brand] || []).map((model) => (
                    <label key={model}>
                      <input
                        type="checkbox"
                        name="gpuModels"
                        value={model}
                        checked={Array.isArray(formData.gpuModels) && formData.gpuModels.includes(model)}
                        onChange={handleInputChange}
                      />
                      {model}
                    </label>
                  ))}
                </div>
              ))}
            </>
          );
        }
        break;
        case 12:
          return (
            <>
              <label>¿Tienes una idea clara de lo que necesitas para tu computador o prefieres que te guiemos?</label>
              <select
                name="needHelp"
                value={formData.needHelp || ''}
                onChange={handleInputChange}
              >
                <option value="">Selecciona una opción</option>
                <option value="Sí">Sí, tengo una idea de las características que necesito.</option>
                <option value="No">No, ayúdame a elegir los componentes según lo que ya seleccioné antes.</option>
              </select>
            </>
          );        
      case 13:
        if (formData.needHelp === "Sí") {
          return (
            <>
              <label>¿Qué tipo de actividades realizarás que puedan requerir un buen rendimiento gráfico?</label>
              <select name="graphicNeeds" value={formData.graphicNeeds || ''} onChange={handleInputChange}>
                <option value="">Selecciona una opción</option>
                <option value="Gaming">Gaming: quiero jugar con buena resolución y gráficos fluidos.</option>
                <option value="Diseño Gráfico">Diseño gráfico o edición de video: necesito buen rendimiento.</option>
                <option value="Uso Básico">Uso básico: navegación, oficina y reproducción de videos.</option>
                <option value="Equilibrado">No estoy seguro, pero prefiero una opción equilibrada.</option>
              </select>
            </>
          );
        }
        break;
      case 14:
        if (formData.needHelp === "Sí") {
          return (
            <>
              <label>El procesador es clave para la velocidad del computador. ¿Qué nivel de rendimiento necesitas?</label>
              <select name="processorNeeds" value={formData.processorNeeds || ''} onChange={handleInputChange}>
                <option value="">Selecciona una opción</option>
                <option value="Básico">Básico: para tareas ligeras.</option>
                <option value="Intermedio">Intermedio: para multitarea y gaming casual.</option>
                <option value="Avanzado">Avanzado: para diseño o gaming de alto rendimiento.</option>
                <option value="Profesional">Profesional: para modelado 3D o simulaciones.</option>
                <option value="Equilibrado">No estoy seguro, pero quiero algo rápido.</option>
              </select>
            </>
          );
        }
        break;
      case 15:
        if (formData.needHelp === "Sí") {
          return (
            <>
              <label>La memoria RAM permite realizar varias tareas. ¿Qué uso le darás al computador?</label>
              <select name="ramNeeds" value={formData.ramNeeds || ''} onChange={handleInputChange}>
                <option value="">Selecciona una opción</option>
                <option value="4 GB">Tareas ligeras (4 GB).</option>
                <option value="8 GB">Gaming casual (8 GB).</option>
                <option value="16 GB">Gaming avanzado o edición (16 GB).</option>
                <option value="32 GB">Tareas intensivas (32 GB o más).</option>
                <option value="Equilibrado">No estoy seguro, pero prefiero algo eficiente.</option>
              </select>
            </>
          );
        }
        break;
      case 16:
        if (formData.needHelp === "Sí") {
          return (
            <>
              <label>¿Cuánto espacio necesitas para guardar tus archivos, programas o juegos?</label>
              <select name="storageNeeds" value={formData.storageNeeds || ''} onChange={handleInputChange}>
                <option value="">Selecciona una opción</option>
                <option value="256 GB">Espacio básico (256 GB SSD).</option>
                <option value="512 GB">Espacio moderado (512 GB SSD).</option>
                <option value="1 TB">Espacio amplio (1 TB SSD o más).</option>
                <option value="Equilibrado">No estoy seguro, pero prefiero una buena capacidad.</option>
              </select>
            </>
          );
        }
        break;
      case 17:
        return (
          <div className="budget-container">
            <label>¿Cuál es tu presupuesto mínimo para el computador?</label>
            <input
              type="text"
              name="minBudget"
              value={formData.minBudget}
              onChange={(e) => handleBudgetChange(e, 'minBudget')}
              placeholder="Ingresa tu presupuesto mínimo"
              className="budget-input"
            />

            <label>¿Cuál es tu presupuesto máximo para el computador?</label>
            <input
              type="text"
              name="maxBudget"
              value={formData.maxBudget}
              onChange={(e) => handleBudgetChange(e, 'maxBudget')}
              placeholder="Ingresa tu presupuesto máximo"
              className="budget-input"
            />

            {budgetError && <p className="error-message">{budgetError}</p>}
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="logo-button" onClick={() => navigate('/')}>
          <img src="/BYT.jpg" alt="Logo" className="navbar-logo" />
          <span className="navbar-title">BUILD-YOUR-TECH</span>
        </button>
        <div className="header-buttons">
          {user ? (
            <div className="user-info">
              <button className="user-name" onClick={toggleDropdown}>
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
            <button className="login-button" onClick={onLoginClick}>
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
          <button className="back-button" onClick={() => navigate('/sales')}>
            X
          </button>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={step === 17 ? handleSubmit : handleNextStep}>
          {renderStep()}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="button-container">
            {step > 0 && (
              <button
                type="button"
                className="back-step-button"
                onClick={handleBack}
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              className="next-step-button"
              disabled={isSubmitting || (step === 17 && budgetError)}
            >
              {step === 17 ? (isSubmitting ? "Enviando..." : "Finalizar") : "Siguiente"}
            </button>

          </div>
        </form>


        {step === 17 && recommendation && (
          <div className="recommendation-box">
            <h3>Recomendación de la IA:</h3>
            <p>{recommendation}</p>
          </div>
        )}

        {loading && (
          <div className="spinner">
            <div className="double-spinner"></div>
          </div>
        )}

        {step === 17 && showResultsButton && !showResults && (
          <button
            className="show-results-button"
            onClick={fetchRecomendaciones}
            disabled={isFetchingResults} // Deshabilita el botón mientras se cargan los resultados
          >
            {isFetchingResults ? "Cargando..." : "Mostrar Resultados"}
          </button>
        )}

      </div>

      {step === 17 && showResults && (
        <div className="results-section">
          {productosRecomendados.length > 0 ? (
            <>
              <button
                className="reset-form-button"
                onClick={async () => {
                  resetForm(); // No se elimina pero se asegura de que se use en el contexto adecuado
                  await createFormulario();
                }}
              >
                Volver a iniciar formulario
              </button>

              <h2>Productos Recomendados</h2>
              <div className="products-container">
                <button onClick={handlePreviousProduct} className="nav-button">⬅</button>
                <div
                  className="product-card"
                  onClick={() => openCalificacionModal(productosRecomendados[currentProductIndex])}
                >
                  <img
                    src={productosRecomendados[currentProductIndex]?.imagen || 'url_de_imagen_por_defecto.jpg'}
                    alt={productosRecomendados[currentProductIndex]?.nombre || 'Producto sin nombre'}
                    className="product-img"
                  />
                  <div className="product-info">
                    <h3>{productosRecomendados[currentProductIndex]?.nombre || 'Producto sin nombre'}</h3>
                    <p>{productosRecomendados[currentProductIndex]?.descripcion || 'Descripción no disponible'}</p>
                    <p>
                      <strong>Precio:</strong> ${productosRecomendados[currentProductIndex]?.precio || '0'}
                    </p>
                    <p>
                      <strong>Razones:</strong> {productosRecomendados[currentProductIndex]?.razones || 'Sin razones disponibles'}
                    </p>
                    <div className="product-details">
                      <p><strong>Procesador:</strong> {productosRecomendados[currentProductIndex]?.procesador || 'No especificado'}</p>
                      <p><strong>RAM:</strong> {productosRecomendados[currentProductIndex]?.ram || 'No especificado'}</p>
                      <p><strong>Almacenamiento:</strong> {productosRecomendados[currentProductIndex]?.almacenamiento || 'No especificado'}</p>
                      <p><strong>Gráfica:</strong> {productosRecomendados[currentProductIndex]?.grafica || 'No especificado'}</p>
                    </div>
                    <button
                      className="add-to-cart"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que se dispare el evento de clic del contenedor
                        const productoActual = productosRecomendados[currentProductIndex];
                        const productoId =
                          productoActual.id || productoActual.producto_id || currentProductIndex;

                        addToCart({
                          id: productoId,
                          description: productoActual?.nombre || 'Producto sin nombre',
                          img: productoActual?.imagen || 'url_de_imagen_por_defecto.jpg',
                          price: productoActual?.precio || '0',
                          quantity: 1,
                        });
                      }}
                    >
                      Agregar al carrito
                    </button>

                  </div>
                </div>
                <button onClick={handleNextProduct} className="nav-button">
                  ➡
                </button>
              </div>
            </>
          ) : (
            <div className="no-results-message">
              <h2>Lo sentimos</h2>
              <p>No tenemos computadores que se ajusten a tus características solicitadas.</p>
              <button
                className="reset-form-button"
                onClick={async () => {
                  resetForm(); // No se elimina pero se asegura de que se use en el contexto adecuado
                  await createFormulario();
                }}
              >
                Volver a intentar
              </button>
            </div>
          )}
        </div>
      )}

      {showCalificacion && selectedProduct && (
        <Calificacion
          product={selectedProduct} // Producto seleccionado
          closeModal={closeCalificacionModal} // Cierra el modal
          user={user} // Usuario actual
        />
      )}
    </div>
  );

};

export default ChatPage;
