import monitoreoBus from "./config";

// === GET === //

export const getEstaciones = async () => {
    try {
        const response = await monitoreoBus.get("/estacion");

        return response.data;

    } catch (error) {
        console.error("Error al obtener estacion: ", error);
        throw error;
    }
};

// === GET BY ID === //

export const getEstacionesById = async (id) => {
  try {
    const response = await monitoreoBus.get(`/estacion/${id}` );

    return response.data;
  } catch (error) {
    console.error(`Error al obtener el estacion con ID ${id}:`, error);
    throw error;
  }
};

// === POST === //

export const storeEstaciones = async (newData) => {
    try {
      const response = await monitoreoBus.post("/estacion", newData );
      return response;
    } catch (error) {
      console.error("Error al registrar el estacion:", error);
      throw error;
    }
};

  // === UPDATE === //

  export const updateEstaciones = async (id, updatedData) => {
    try {
      const response = await monitoreoBus.put(`/estacion/${id}`, updatedData );
  
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el estacion con ID ${id}:`, error);
      throw error;
    }
};

  // === DELETE === //

  export const deleteEstaciones = async (id) => {
    try {
      const response = await monitoreoBus.delete(`/estacion/${id}`);
  
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el estacion con ID ${id}:`, error);
      throw error;
    }
  };