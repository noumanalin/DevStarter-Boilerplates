import axios from "axios";

const amIWorkingLocal = true;

const api = axios.create({
  baseURL: amIWorkingLocal ? "http://localhost:4343/api/" : "http://localhost:4344/api/",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});


export default api;