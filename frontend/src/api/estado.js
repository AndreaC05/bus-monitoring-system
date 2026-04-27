import monitoreoBus from "./config";

// === GET === //

export const getEstados = async () => {
    try {
        const response = await monitoreoBus.get("/estados");

        return response.data;

    } catch (error) {
        console.error("Error al obtener estado: ", error);
        throw error;
    }
};

// === GET BY ID === //

export const getEstadosById = async (id) => {
  try {
    const response = await monitoreoBus.get(`/estados/${id}` );

    return response.data;
  } catch (error) {
    console.error(`Error al obtener el estado con ID ${id}:`, error);
    throw error;
  }
};

// === POST === //

export const storeEstados = async (newData) => {
    try {
      const response = await monitoreoBus.post("/estados", newData );
      return response;
    } catch (error) {
      console.error("Error al registrar el estado:", error);
      throw error;
    }
};

  // === UPDATE === //

  export const updateEstados = async (id, updatedData) => {
    try {
      const response = await monitoreoBus.put(`/estados/${id}`, updatedData );
  
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el estado con ID ${id}:`, error);
      throw error;
    }
};

  // === DELETE === //

  export const deleteEstados = async (id) => {
    try {
      const response = await monitoreoBus.delete(`/estados/${id}`);
  
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el estado con ID ${id}:`, error);
      throw error;
    }
  };