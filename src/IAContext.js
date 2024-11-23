import React, { createContext, useContext, useState } from 'react';

const IAContext = createContext();

export function IAProvider({ children }) {
  const [responses, setResponses] = useState({});

  const updateResponses = (key, value) => {
    setResponses((prevResponses) => ({ ...prevResponses, [key]: value }));
  };

  const generateRecommendation = () => {
    const { purpose, budget, type } = responses;
    if (!purpose || !budget || !type) return "Completa todas las respuestas para recibir una recomendación.";
    return `Recomendamos un ${type} para ${purpose} dentro de un presupuesto de $${budget}.`;
  };

  return (
    <IAContext.Provider value={{ updateResponses, generateRecommendation }}>
      {children}
    </IAContext.Provider>
  );
}

export function useIA() {
  return useContext(IAContext);
}
