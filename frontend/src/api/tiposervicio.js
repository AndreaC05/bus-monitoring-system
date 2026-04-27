import monitoreoBus from "./config";

// === GET === //

export const getTipServicios = async () => {
    try {
        const response = await monitoreoBus.get("/tiposervicios");

        return response.data;

    } catch (error) {
        console.error("Error al obtener tipo servicio: ", error);
        throw error;
    }
};

// === GET BY ID === //

export const getTipoServiciosById = async (id) => {
  try {
    const response = await monitoreoBus.get(`/tiposervicios/${id}` );

    return response.data;
  } catch (error) {
    console.error(`Error al obtener el Tipo Servicio con ID ${id}:`, error);
    throw error;
  }
};

// === POST === //

export const storeTipoServicios = async (newData) => {
    try {
      const response = await monitoreoBus.post("/tiposervicios", newData );
      return response;
    } catch (error) {
      console.error("Error al registrar el Tipo Servicio:", error);
      throw error;
    }
};

  // === UPDATE === //

  export const updateTipoServicios = async (id, updatedData) => {
    try {
      const response = await monitoreoBus.put(`/tiposervicios/${id}`, updatedData );
  
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el Tipo Servicio con ID ${id}:`, error);
      throw error;
    }
};

  // === DELETE === //

  export const deleteTipoServicios = async (id) => {
    try {
      const response = await monitoreoBus.delete(`/tiposervicios/${id}`);
  
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el Tipo Servicio con ID ${id}:`, error);
      throw error;
    }
  };