<template>
  <!-- Pantalla de Carga (Loader) -->
  <div v-if="isLoading" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a]">
    <div class="relative">
      <!-- Logo Animado -->
      <div class="bg-blue-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/20 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <!-- Anillo de carga exterior -->
      <div class="absolute -inset-4 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
    <p class="mt-8 text-blue-400 font-medium tracking-widest uppercase text-xs animate-pulse">Cargando...</p>
  </div>

  <!-- Contenido Principal (Solo se ve cuando termina de cargar) -->
  <div v-else class="flex h-screen bg-[#f3f4f9] font-sans text-gray-700 animate-fade-in">
    
    <!-- SIDEBAR -->
    <aside class="w-72 bg-[#0f172a] text-gray-300 flex flex-col shadow-2xl">
      <div class="p-6 flex items-center gap-3">
        <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span class="font-black text-sm tracking-tighter text-white uppercase leading-tight">Control de<br>Fabricación</span>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-1">
          <router-link to="/admin/dashboard" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-semibold"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm hover:bg-slate-800 text-left">
              <span>🏠</span> Dashboard
          </router-link>

          <router-link to="/admin/proyectos" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-semibold"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm hover:bg-slate-800 text-left">
              <span>📂</span> Proyectos
          </router-link>

          <router-link to="/admin/bloques" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-semibold"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm hover:bg-slate-800 text-left">
              <span>🧊</span> Bloques
          </router-link>

          <router-link to="/admin/piezas" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-semibold"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm hover:bg-slate-800 text-left">
              <span>🧩</span> Piezas
          </router-link>

          <router-link to="/admin/registrar" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-semibold"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm hover:bg-slate-800 text-left">
              <span>📝</span> Registrar Fabricación
          </router-link>

          <router-link to="/admin/reportes" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-semibold"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm hover:bg-slate-800 text-left">
              <span>📊</span> Reportes
          </router-link>
      </nav>

      <!-- Perfil de Usuario Dinámico -->
      <div class="p-6 border-t border-slate-800 bg-[#0b1222]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-700 border-2 border-blue-500 overflow-hidden">
            <img :src="`https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff`" alt="Avatar">
          </div>
          <div class="flex-1 text-left">
            <p class="text-xs font-bold text-white">{{ userName }}</p>
            <p class="text-[10px] text-slate-500">Administrador</p>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
        <div class="flex items-center gap-4">
          <button class="text-gray-400 hover:text-gray-600">☰</button>
          <h2 class="text-lg font-bold text-gray-800">Panel de Control</h2>
        </div>
        <div class="flex items-center gap-6">
          <button @click="logout" class="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition uppercase tracking-widest">🚪 Cerrar sesión</button>
        </div>
      </header>

      <section class="flex-1 overflow-y-auto p-10">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const router = useRouter();
const userName = ref('Cargando...');
const isLoading = ref(true); // Estado del Loader inicial

onMounted(() => {
  setTimeout(() => {
    const userData = localStorage.getItem('USER_DATA');
    if (userData) {
      const user = JSON.parse(userData);
      userName.value = user.name;
    }
    isLoading.value = false; // Ocultamos el loader
  }, 1200); 
});

const logout = async () => {
  isLoading.value = true; // Mostramos loader al salir
  try {
    await api.post('/logout');
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
  } finally {
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('USER_DATA');
    router.push('/');
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>