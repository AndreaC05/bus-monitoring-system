import monitoreoBus from "./config";

// === GET === //

export const getReportes = async () => {
    try {
        const response = await monitoreoBus.get("/reportes");

        return response.data;

    } catch (error) {
        console.error("Error al obtener reportes: ", error);
        throw error;
    }
};

// === GET BY ID === //

export const getReportesById = async (id) => {
  try {
    const response = await monitoreoBus.get(`/reportes/${id}` );

    return response.data;
  } catch (error) {
    console.error(`Error al obtener el reportes con ID ${id}:`, error);
    throw error;
  }
};

// === POST === //

export const storeReportes = async (newData) => {
    try {
      const response = await monitoreoBus.post("/reportes", newData );
      return response;
    } catch (error) {
      console.error("Error al registrar el reportes:", error);
      throw error;
    }
};

  // === UPDATE === //

  export const updateReportes = async (id, updatedData) => {
    try {
      const response = await monitoreoBus.put(`/reportes/${id}`, updatedData );
  
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el reportes con ID ${id}:`, error);
      throw error;
    }
};

  // === DELETE === //

  export const deleteReportes = async (id) => {
    try {
      const response = await monitoreoBus.delete(`/reportes/${id}`);
  
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el reportes con ID ${id}:`, error);
      throw error;
    }
  };