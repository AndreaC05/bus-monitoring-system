import axios from "axios";

const monitoreoBus = axios.create({
     baseURL: "http://localhost:3000/api",
});

export default monitoreoBus;