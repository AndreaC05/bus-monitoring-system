import monitoreoBus from "./config";

// === GET === //

export const getBuses = async () => {
    try {
        const response = await monitoreoBus.get("/buses");

        return response.data;

    } catch (error) {
        console.error("Error al obtener buses: ", error);
        throw error;
    }
};

// === GET BY ID === //

export const getBusesById = async (id) => {
  try {
    const response = await monitoreoBus.get(`/buses/${id}` );

    return response.data;
  } catch (error) {
    console.error(`Error al obtener el buses con ID ${id}:`, error);
    throw error;
  }
};

// === POST === //

export const storeBuses = async (newData) => {
    try {
      const response = await monitoreoBus.post("/buses", newData );
      return response;
    } catch (error) {
      console.error("Error al registrar el buses:", error);
      throw error;
    }
};

  // === UPDATE === //

  export const updateBuses = async (id, updatedData) => {
    try {
      const response = await monitoreoBus.put(`/buses/${id}`, updatedData );
  
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el buses con ID ${id}:`, error);
      throw error;
    }
};

  // === DELETE === //

  export const deleteBuses = async (id) => {
    try {
      const response = await monitoreoBus.delete(`/buses/${id}`);
  
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el buses con ID ${id}:`, error);
      throw error;
    }
  };