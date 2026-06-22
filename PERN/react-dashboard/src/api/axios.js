// src/api/axios.js

import axios from "axios";
import { store } from "../store/index";
import { selectAccessToken } from "../store/user";

const amIWorkingLocal = true;

const api = axios.create({
  baseURL: amIWorkingLocal ? "http://localhost:4343/api/" : "http://localhost:4344/api/",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});


api.interceptors.request.use((config) => {
  const token = selectAccessToken(store.getState());
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;