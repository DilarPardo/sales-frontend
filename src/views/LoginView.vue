<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f3f4f9] px-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div class="p-10">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-black text-center text-slate-800 mb-2">¡Bienvenido de nuevo!</h2>
        <p class="text-center text-slate-400 text-sm mb-10">Ingresa tus credenciales para acceder al sistema</p>

        <!-- Mensaje de Error -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm font-medium animate-pulse">
          ⚠️ {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Correo Electrónico</label>
            <input 
              v-model="credentials.email" 
              type="email" 
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              placeholder="nombre@empresa.com" 
              required
            >
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Contraseña</label>
            <input 
              v-model="credentials.password" 
              type="password" 
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              placeholder="••••••••" 
              required
            >
          </div>

          <button 
            type="submit" 
            :disabled="cargando"
            class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform hover:-translate-y-1 active:scale-95 disabled:bg-slate-400"
          >
            <span v-if="!cargando">Iniciar Sesión</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importamos específicamente apiAuth que es la del puerto 8000
import { apiAuth } from '../api/axios'; 

const router = useRouter();
const credentials = ref({ email: '', password: '' });
const error = ref(null);
const cargando = ref(false);

const handleLogin = async () => {
  error.value = null;
  cargando.value = true;

  try {
    // 1. Usamos apiAuth (Puerto 8000) para el login
    const response = await apiAuth.post('/login', credentials.value);
    
    // 2. Extraemos el token buscando ambos nombres posibles
    const token = response.data.token || response.data.access_token;
    
    if (token) {
      // 3. Guardamos el token real
      localStorage.setItem('AUTH_TOKEN', token);
      
      if(response.data.user) {
        localStorage.setItem('USER_DATA', JSON.stringify(response.data.user));
      }

      // 4. Redirección (ajusta a la ruta de tus proyectos si es necesario)
      router.push('/admin/proyectos');
    } else {
      error.value = "El servidor no devolvió un token de acceso.";
      console.error("Estructura de respuesta inesperada:", response.data);
    }

  } catch (err) {
    if (err.response && err.response.status === 401) {
      error.value = "Las credenciales son incorrectas.";
    } else {
      error.value = err.response?.data?.message || "No se pudo conectar con el servicio de autenticación.";
    }
    console.error("Error en login:", err);
  } finally {
    cargando.value = false;
  }
};
</script>