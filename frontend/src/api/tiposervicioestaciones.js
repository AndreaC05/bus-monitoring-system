import monitoreoBus from "./config";

// === GET === //

export const getTipoServicioEstaciones = async () => {
    try {
        const response = await monitoreoBus.get("/tiposervicioestacion");

        return response.data;

    } catch (error) {
        console.error("Error al obtener tipo servicio estacion: ", error);
        throw error;
    }
};

// === GET BY ID === //

export const getTipoServicioEstacionesById = async (id) => {
  try {
    const response = await monitoreoBus.get(`/tiposervicioestacion/${id}` );

    return response.data;
  } catch (error) {
    console.error(`Error al obtener el tipo servicio estacion con ID ${id}:`, error);
    throw error;
  }
};

// === POST === //

export const storeTipoServicioEstaciones = async (newData) => {
    try {
      const response = await monitoreoBus.post("/tiposervicioestacion", newData );
      return response;
    } catch (error) {
      console.error("Error al registrar el tipo servicio estacion:", error);
      throw error;
    }
};

  // === UPDATE === //

  export const updateTipoServicioEstaciones = async (id, updatedData) => {
    try {
      const response = await monitoreoBus.put(`/tiposervicioestacion/${id}`, updatedData );
  
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el tipo servicio estacion con ID ${id}:`, error);
      throw error;
    }
};

  // === DELETE === //

  export const deleteTipoServicioEstaciones = async (id) => {
    try {
      const response = await monitoreoBus.delete(`/tiposervicioestacion/${id}`);
  
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el tipo servicio estacion con ID ${id}:`, error);
      throw error;
    }
  };