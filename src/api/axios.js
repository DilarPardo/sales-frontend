import axios from 'axios';

// 1. Instancia para el Auth-Service (Puerto 8000)
// Configurada según los requerimientos de Auth Service (Laravel 10+)
export const apiAuth = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

// 2. Instancia para el Pieces-Service (Puerto 8001)
// Configurada con versionado /v1 como indica el Requerimiento Adicional 3.3
export const apiPieces = axios.create({
  baseURL: 'http://127.0.0.1:8001/api/v1'
});

/**
 * 3. Definición del Interceptor de Solicitud
 * Inyecta el token de forma automática a ambas instancias
 */
const authInterceptor = (config) => {
  const token = window.localStorage.getItem('AUTH_TOKEN');

  // Verificación de existencia del token antes de la inyección
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

// 4. Aplicar el interceptor a ambas instancias para cumplir con "APIs protegidas por token"
apiAuth.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
apiPieces.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

/**
 * 5. Interceptor de Respuesta
 * Manejo silencioso de errores para cumplir con el Requerimiento Adicional 3.2
 */
apiPieces.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí puedes manejar redirecciones si el status es 401 (No autorizado)
    if (error.response?.status === 401) {
       console.warn("Sesión expirada o token inválido.");
    }
    return Promise.reject(error);
  }
);

export default { apiAuth, apiPieces };