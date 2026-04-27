**** Sistema de Monitoreo de Buses (Prueba Técnica Fullstack) ****

El objetivo de este proyecto es construir un MVP que permita monitorear una flota de buses, registrando su ubicación y nivel de ocupación.


**Descripción del problema**

La empresa necesita conocer en tiempo real:

Ubicación de los buses
Cantidad de pasajeros
Nivel de ocupación
Estado actual de la flota

Para resolver esto, se desarrolló una aplicación web con backend, base de datos y frontend.

//**Enfoque de la solución**//

Se dividió el sistema en 3 capas principales:

Backend (API REST) — Express + Sequelize ORM
Base de datos relacional — MySQL
Frontend (interfaz de usuario) — React + Vite

Se priorizó una arquitectura simple, escalable y fácil de entender.
Adicionalmente, se implementó un simulador de movimiento de buses (simulador.js) que genera reportes automáticos de ubicación y ocupación interpolando coordenadas entre estaciones, lo que permite visualizar el sistema en funcionamiento sin necesidad de hardware físico.

//**Modelo de datos**//

El sistema maneja las siguientes entidades principales:

Bus — código, capacidad, tipo de servicio y estado

Estacion — nombre, latitud y longitud

TipoServicio — categoría de la ruta (Expreso, Regular, etc.)

TipoServicioEstacion — relación que define qué estaciones pertenecen a cada tipo de servicio y en qué orden

Estado — estado actual del bus (Lleno, Disponible, Casi Lleno)

Reportes — registros periódicos de ubicación y cantidad de pasajeros por bus

****Tecnologías utilizadas****

//**Backend**//

Node.js
Express
Sequelize ORM

//**Base de datos**//

MySQL

//**Frontend**//

React.js
Vite
Axios
PrimeReact
React Leaflet (mapa interactivo)

//**Infraestructura**//

Docker + docker-compose

**Funcionalidades principales**

Dashboard — resumen de la flota: buses activos, nivel de ocupación y última ubicación reportada

Mapa interactivo — visualización en tiempo real de la posición de cada bus sobre el mapa, con marcadores de colores según el nivel de ocupación (verde = disponible, amarillo = casi lleno, rojo = lleno)

Gestión de buses — CRUD completo de buses

Gestión de estaciones — CRUD completo de estaciones con coordenadas geográficas

Gestión de tipos de servicio y rutas — asignación de estaciones a cada tipo de servicio

Reportes — historial de ubicaciones y ocupación por bus

//*Cómo ejecutar el proyecto*//

Clonar el repositorio

git clone <https://github.com/AndreaC05/bus-monitoring-system.git>

cd <bus-monitoring-system>

/*Levantar los servicios*/

docker-compose up --build

Esto iniciará:
- Base de datos
- Backend

//**Frontend**//

cd frontend
     |
npm install
     |
npm run dev

**Endpoints principales de la API**

Método       Ruta                            Descripción
_____________________________________________________________
GET        /api/buses                        Obtener todos los buses
POST       /api/buses                        Crear un bus
PUT        /api/buses/:id                    Actualizar un bus
DELETE     /api/buses/:id                    Eliminar un bus
GET        /api/estaciones                   Obtener todas las estaciones
POST       /api/estaciones                   Crear una estación
GET        /api/reportes                     Obtener reportes de posición/ocupación
GET        /api/tiposervicio                 Obtener tipos de servicio
GET        /api/tiposervicioestacion         Obtener relaciones servicio-estación
GET        /api/estado                       Obtener estados de bus

/*EXTRA*/
**Notas sobre el desarrollo**

Simulador de movimiento de buses (simulador.js)

Para poder demostrar el sistema sin hardware físico, se implementó un simulador que genera reportes automáticos de ubicación y ocupación por cada bus activo. Funciona interpolando coordenadas entre las estaciones de la ruta asignada, imitando el movimiento real de un vehículo a lo largo de su recorrido.

Se inicia automáticamente junto con el backend al ejecutar npm run dev.

**Uso de IA como herramienta de apoyo**

Durante el desarrollo se utilizó IA (Claude) como apoyo en varias etapas: sugerencias de validaciones en el backend, resolución de errores puntuales, consultas sobre Sequelize y parte del trabajo en el frontend.

Todo el código generado fue revisado, entendido y ajustado antes de integrarse al proyecto. 

**Las decisiones centrales** 

El modelado de la base de datos, la definición de endpoints, la lógica de validación, la estructura general del proyecto y el flujo de datos entre capas — fueron tomadas de forma independiente. La IA se usó como herramienta, no como sustituto del razonamiento técnico.



