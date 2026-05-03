import axios from 'axios';

// Auth-Service (Puerto 8000)
export const apiAuth = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

// Pieces-Service (Puerto 8001)
export const apiPieces = axios.create({
  baseURL: 'http://127.0.0.1:8001/api/v1'
});

/**
 * Inyecta el token de forma automática a ambas instancias
 */
const authInterceptor = (config) => {
  const token = window.localStorage.getItem('AUTH_TOKEN');

  if (token && token !== 'undefined' && token !== 'null') 
    {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
  return config;
};

// APIs protegidas por token"
apiAuth.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
apiPieces.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

/**
 * Manejo silencioso de errores 
 */
apiPieces.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) 
      {
        console.warn("Sesión expirada o token inválido.");
      }
    return Promise.reject(error);
  }
);

export default { apiAuth, apiPieces };