<script setup>
import { ref, onMounted } from 'vue';
import { apiPieces } from '../api/axios';

const stats = ref({
  proyectos: 0,
  bloques: 0,
  piezas: 0,
  fabricaciones: 0,
  desviacionPromedio: 0
});

const isLoading = ref(true);

const cargarEstadisticas = async () => {
  isLoading.value = true;
  try {
    // Realizamos peticiones paralelas
    const [resProy, resBloq, resPiezas, resFab] = await Promise.all([
      apiPieces.get('/projects'),
      apiPieces.get('/blocks'),
      apiPieces.get('/pieces'),
      apiPieces.get('/fabrications')
    ]);

    // Corregimos el acceso a los datos: res.data.data es el estándar en Laravel Resources
    stats.value.proyectos = (resProy.data.data || resProy.data).length || 0;
    stats.value.bloques = (resBloq.data.data || resBloq.data).length || 0;
    stats.value.piezas = (resPiezas.data.data || resPiezas.data).length || 0;
    
    const fabs = resFab.data.data || resFab.data;
    stats.value.fabricaciones = fabs.length || 0;

    // Cálculo de desviación
    if (stats.value.fabricaciones > 0) {
      const sumaDif = fabs.reduce((acc, curr) => acc + Math.abs(parseFloat(curr.weight_diff || 0)), 0);
      stats.value.desviacionPromedio = (sumaDif / stats.value.fabricaciones).toFixed(2);
    }

  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  } finally {
    // Agregamos un pequeño delay artificial para que el loader sea visible si la red es muy rápida
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

onMounted(cargarEstadisticas);
</script>

<template>
  <div class="space-y-8">
    <!-- Cabecera -->
    <div>
      <h1 class="text-2xl font-black text-slate-800">Panel de Control</h1>
      <p class="text-slate-500">Resumen operativo de la planta en tiempo real.</p>
    </div>

    <!-- Grid de Estadísticas con Skeleton Loader -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Card Proyectos -->
      <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition min-h-[160px] flex flex-col justify-center">
        <div v-if="isLoading" class="animate-pulse space-y-4">
          <div class="h-3 w-20 bg-slate-100 rounded"></div>
          <div class="h-10 w-12 bg-blue-100 rounded-lg"></div>
        </div>
        <div v-else>
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Proyectos</p>
            <span class="text-xl">📁</span>
          </div>
          <p class="text-4xl font-black text-blue-600 mt-4">{{ stats.proyectos }}</p>
          <p class="text-[10px] text-slate-400 mt-2 font-medium">Gestionados en sistema</p>
        </div>
      </div>

      <!-- Card Bloques -->
      <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition min-h-[160px] flex flex-col justify-center">
        <div v-if="isLoading" class="animate-pulse space-y-4">
          <div class="h-3 w-20 bg-slate-100 rounded"></div>
          <div class="h-10 w-12 bg-indigo-100 rounded-lg"></div>
        </div>
        <div v-else>
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Bloques</p>
            <span class="text-xl">🧱</span>
          </div>
          <p class="text-4xl font-black text-indigo-600 mt-4">{{ stats.bloques }}</p>
          <p class="text-[10px] text-slate-400 mt-2 font-medium">Unidades estructurales</p>
        </div>
      </div>

      <!-- Card Piezas -->
      <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition min-h-[160px] flex flex-col justify-center">
        <div v-if="isLoading" class="animate-pulse space-y-4">
          <div class="h-3 w-20 bg-slate-100 rounded"></div>
          <div class="h-10 w-12 bg-emerald-100 rounded-lg"></div>
        </div>
        <div v-else>
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Catálogo Piezas</p>
            <span class="text-xl">⚙️</span>
          </div>
          <p class="text-4xl font-black text-emerald-600 mt-4">{{ stats.piezas }}</p>
          <p class="text-[10px] text-slate-400 mt-2 font-medium">Modelos registrados</p>
        </div>
      </div>

      <!-- Card Fabricación -->
      <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition min-h-[160px] flex flex-col justify-center">
        <div v-if="isLoading" class="animate-pulse space-y-4">
          <div class="h-3 w-20 bg-slate-100 rounded"></div>
          <div class="h-10 w-12 bg-amber-100 rounded-lg"></div>
        </div>
        <div v-else>
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Fabricaciones</p>
            <span class="text-xl">⚖️</span>
          </div>
          <p class="text-4xl font-black text-amber-500 mt-4">{{ stats.fabricaciones }}</p>
          <p class="text-[10px] text-slate-400 mt-2 font-medium">Pesajes realizados</p>
        </div>
      </div>

    </div>

    <!-- Sección Inferior: Análisis de Calidad -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden flex flex-col justify-center min-h-[250px]">
        <div v-if="isLoading" class="animate-pulse space-y-6 relative z-10">
          <div class="h-6 w-1/3 bg-slate-800 rounded"></div>
          <div class="h-16 w-1/2 bg-slate-800 rounded"></div>
        </div>
        <div v-else class="relative z-10">
          <h3 class="text-xl font-bold mb-2">Análisis de Desviación</h3>
          <p class="text-slate-400 text-sm mb-6">Promedio de variación de peso en las últimas fabricaciones.</p>
          <div class="flex items-end gap-4">
             <span class="text-6xl font-black">{{ stats.desviacionPromedio }}</span>
             <span class="text-2xl font-bold text-slate-400 mb-2">kg</span>
          </div>
          <p class="text-xs text-blue-400 mt-4 font-bold uppercase tracking-widest">Estado: Óptimo</p>
        </div>
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div class="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 mb-6">Accesos Rápidos</h3>
        <div class="space-y-4">
          <router-link to="/admin/registrar" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition group">
            <span class="bg-white w-10 h-10 flex items-center justify-center rounded-xl shadow-sm group-hover:scale-110 transition">➕</span>
            <span class="font-bold text-slate-700 text-sm">Nuevo Pesaje</span>
          </router-link>
          
          <router-link to="/admin/reportes" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition group">
            <span class="bg-white w-10 h-10 flex items-center justify-center rounded-xl shadow-sm group-hover:scale-110 transition">📊</span>
            <span class="font-bold text-slate-700 text-sm">Generar Informe</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>