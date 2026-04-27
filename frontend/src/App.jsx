import { BrowserRouter, Route, Routes } from "react-router-dom";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

//Importaciones de Pages
import DashBoard from "./pages/Dashboard";
import Buses from "./pages/Buses";
import Estaciones from "./pages/Estaciones";
import Reportes from "./pages/Reportes";
import Mapa from "./pages/Mapa";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<DashBoard />} />
        <Route exact path="/buses" element={<Buses />} />
        <Route exact path="/estaciones" element={<Estaciones />} />
        <Route exact path="/reportes" element={<Reportes />} />
        <Route exact path="/mapa" element={<Mapa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;