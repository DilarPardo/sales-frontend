<script setup>
import { ref, onMounted, computed } from 'vue';
import { apiPieces } from '../api/axios';
import { Bar, Pie } from 'vue-chartjs';
import { 
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement 
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const fabricaciones = ref([]);
const proyectos = ref([]);
const piezasTotales = ref([]);
const isLoading = ref(true);
const filtroProyecto = ref('');

// Función mejorada: Busca el ID del proyecto hasta debajo de las piedras
const obtenerProyectoId = (f) => {
  return f.project_id || 
         f.piece?.block?.project_id || 
         f.piece?.block?.project?.id || 
         f.id_proyecto_aux; // Campo extraído manualmente en cargarDatos
};

const cargarDatos = async () => {
  isLoading.value = true;
  try {
    const [resFab, resProy, resPiezas] = await Promise.all([
      apiPieces.get('/fabrications'),
      apiPieces.get('/projects'),
      apiPieces.get('/pieces')
    ]);
    
    const rawFab = resFab.data.data || resFab.data;
    proyectos.value = resProy.data.data || resProy.data;
    piezasTotales.value = resPiezas.data.data || resPiezas.data;

    // NORMALIZACIÓN: Si la relación viene vacía, intentamos rescatar el nombre/ID
    fabricaciones.value = rawFab.map(f => ({
      ...f,
      nombre_proyecto_display: f.piece?.block?.project?.name || f.project_name || 'Proyecto General',
      id_proyecto_aux: f.project_id || f.piece?.block?.project_id
    }));

    console.log("Datos listos para gráficas:", fabricaciones.value);

  } catch (error) {
    console.error("Error cargando datos:", error);
  } finally {
    isLoading.value = false;
  }
};

// --- 1. FILTRO DE TABLA ---
const datosFiltrados = computed(() => {
  if (!filtroProyecto.value) return fabricaciones.value;
  return fabricaciones.value.filter(f => {
    const pId = obtenerProyectoId(f);
    return String(pId) === String(filtroProyecto.value);
  });
});

// --- 2. GRÁFICA DE TORTA ---
const chartDataStatus = computed(() => {
  const fabricadasCount = fabricaciones.value.length;
  const totalPiezas = piezasTotales.value.length || fabricadasCount; // Evita división por cero
  const pendientesCount = Math.max(0, totalPiezas - fabricadasCount);

  return {
    labels: ['Fabricadas', 'Pendientes'],
    datasets: [{
      data: [fabricadasCount, pendientesCount],
      backgroundColor: ['#2563eb', '#f59e0b'],
      borderWidth: 0
    }]
  };
});

// --- 3. GRÁFICA DE BARRAS (Sincronizada con IDs) ---
const chartDataProjects = computed(() => {
  const labels = proyectos.value.map(p => p.name);
  
  const dataPesos = proyectos.value.map(p => {
    // Buscamos fabricaciones que coincidan con el ID del proyecto actual de la lista
    const total = fabricaciones.value
      .filter(f => String(obtenerProyectoId(f)) === String(p.id))
      .reduce((acc, curr) => acc + parseFloat(curr.real_weight || 0), 0);
    return total;
  });

  return {
    labels,
    datasets: [{
      label: 'Peso Real (kg)',
      data: dataPesos,
      backgroundColor: '#6366f1',
      borderRadius: 12, // Bordes más redondeados para que se vea moderno
      hoverBackgroundColor: '#4f46e5'
    }]
  };
});

const exportarInforme = () => window.print();

onMounted(cargarDatos);
</script>

<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center print:hidden">
      <div>
        <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Panel de Control</h1>
        <p class="text-slate-500 font-medium text-sm">Monitoreo de peso y avance de fabricación.</p>
      </div>
      <button @click="exportarInforme" class="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all active:scale-95">
        GENERAR REPORTE
      </button>
    </div>

    <!-- Gráficas Corregidas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm min-h-[450px]">
        <h3 class="text-[10px] font-black text-slate-400 uppercase mb-10 tracking-[0.2em] text-center italic">Avance General de Piezas</h3>
        <div class="w-full h-72">
          <Pie :data="chartDataStatus" :options="{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }" />
        </div>
      </div>

      <div class="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm min-h-[450px]">
        <h3 class="text-[10px] font-black text-slate-400 uppercase mb-10 tracking-[0.2em] text-center italic">Tonelaje por Proyecto</h3>
        <div class="w-full h-72">
          <Bar :data="chartDataProjects" :options="{ 
            maintainAspectRatio: false, 
            scales: { 
              y: { beginAtZero: true, grid: { display: false } },
              x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
          }" />
        </div>
      </div>
    </div>

    <!-- Filtro -->
    <div class="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm print:hidden">
      <div class="max-w-md">
        <label class="block text-[10px] font-black text-slate-400 uppercase mb-4 ml-1 tracking-widest italic">Seleccionar Proyecto</label>
        <div class="relative">
          <select v-model="filtroProyecto" class="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-slate-700 appearance-none cursor-pointer transition-all">
            <option value="">📂 Mostrar todas las fabricaciones</option>
            <option v-for="p in proyectos" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs">▼</div>
        </div>
      </div>
    </div>

    <!-- Tabla con Datos Normalizados -->
    <div class="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/50">
            <th class="px-10 py-7 text-[10px] font-black text-slate-400 uppercase italic">Referencia de Pieza</th>
            <th class="px-10 py-7 text-[10px] font-black text-slate-400 uppercase text-right italic">Peso Real</th>
            <th class="px-10 py-7 text-[10px] font-black text-slate-400 uppercase text-center italic">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
          <tr v-for="f in datosFiltrados" :key="f.id" class="hover:bg-slate-50/80 transition-all group">
            <td class="px-10 py-8">
              <div class="text-[9px] font-black text-blue-500 mb-1 uppercase tracking-tighter">
                {{ f.nombre_proyecto_display }}
              </div>
              <div class="font-black text-slate-800 text-xl group-hover:translate-x-1 transition-transform italic tracking-tighter">
                {{ f.piece?.name || 'P-GENERICA' }}
              </div>
            </td>
            <td class="px-10 py-8 text-right font-black text-slate-800 text-xl italic">
              {{ f.real_weight }} <span class="text-xs font-bold opacity-40 uppercase">kg</span>
            </td>
            <td class="px-10 py-8 text-center">
              <span class="px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                {{ f.status }}
              </span>
            </td>
          </tr>
          <tr v-if="datosFiltrados.length === 0">
            <td colspan="3" class="p-24 text-center">
              <p class="text-slate-400 font-black italic uppercase tracking-widest text-sm">Sin datos para mostrar</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>