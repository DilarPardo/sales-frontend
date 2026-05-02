<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { apiPieces } from '../api/axios';

// --- ESTADOS ---
const showModal = ref(false);
const esEdicion = ref(false);
const isLoading = ref(false);
const isActionLoading = ref(false);

const fabricaciones = ref([]);
const piezas = ref([]); 
const erroresBackend = ref({});

const registroForm = ref({
  id: null,
  piece_id: '',
  real_weight: '',
  weight_diff: 0,
  status: 'Fabricada', 
  observations: '',
});

// --- LÓGICA DE CÁLCULO ---

const piezaSeleccionada = computed(() => {
  return piezas.value.find(p => p.id === registroForm.value.piece_id);
});

watch(() => registroForm.value.real_weight, (nuevoPeso) => {
  if (piezaSeleccionada.value && nuevoPeso) {
    const calculo = nuevoPeso - piezaSeleccionada.value.theoretical_weight;
    registroForm.value.weight_diff = calculo.toFixed(2);
  } else {
    registroForm.value.weight_diff = 0;
  }
});

const esValido = computed(() => {
  return registroForm.value.piece_id !== '' && registroForm.value.real_weight > 0;
});

// --- ACCIONES API ---

const cargarDatos = async () => {
  isLoading.value = true;
  try {
    const [resFab, resPiezas] = await Promise.all([
      apiPieces.get('/fabrications'), 
      apiPieces.get('/pieces')
    ]);
    fabricaciones.value = resFab.data.data || resFab.data;
    piezas.value = resPiezas.data.data || resPiezas.data;
  } catch (error) {
    console.error("Error cargando datos:", error);
  } finally {
    isLoading.value = false;
  }
};

const guardarRegistro = async () => {
  isActionLoading.value = true;
  erroresBackend.value = {};

  try {
    const payload = {
      piece_id: registroForm.value.piece_id,
      real_weight: parseFloat(registroForm.value.real_weight),
      weight_diff: parseFloat(registroForm.value.weight_diff),
      status: registroForm.value.status,
      observations: registroForm.value.observations || '',
    };

    if (esEdicion.value) {
      await apiPieces.put(`/fabrications/${registroForm.value.id}`, payload);
    } else {
      await apiPieces.post('/fabrications', payload);
    }
    
    cerrarModal();
    await cargarDatos();
  } catch (err) {
    if (err.response?.data?.errors) {
      erroresBackend.value = err.response.data.errors;
    } else {
      alert("Error en el servidor. Revisa los logs de Laravel.");
    }
  } finally {
    isActionLoading.value = false;
  }
};

const editarRegistro = (f) => {
  esEdicion.value = true;
  registroForm.value = {
    id: f.id,
    piece_id: f.piece_id,
    real_weight: f.real_weight,
    weight_diff: f.weight_diff,
    status: f.status,
    observations: f.observations
  };
  showModal.value = true;
};

const eliminarRegistro = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este registro?')) return;
  
  try {
    await apiPieces.delete(`/fabrications/${id}`);
    await cargarDatos();
  } catch (error) {
    alert("No se pudo eliminar el registro.");
  }
};

const cerrarModal = () => {
  showModal.value = false;
  esEdicion.value = false;
  erroresBackend.value = {};
  registroForm.value = { 
    id: null, piece_id: '', real_weight: '', weight_diff: 0, 
    status: 'Fabricada', observations: '' 
  };
};

const obtenerNombrePieza = (id) => {
  const p = piezas.value.find(item => item.id === id);
  return p ? p.name : `Pieza #${id}`;
};

onMounted(cargarDatos);
</script>

<template>
  <div class="space-y-8">
    <!-- Cabecera -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-slate-800">Registro de Fabricación</h1>
        <p class="text-slate-500">Monitoreo de producción y control de pesos en tiempo real.</p>
      </div>
      <button @click="showModal = true; esEdicion = false" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition transform hover:-translate-y-1 active:scale-95 flex items-center gap-3">
        <span class="text-xl">⚖️</span> Iniciar Registro
      </button>
    </div>

    <!-- Tabla de Resultados -->
    <div class="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p class="text-slate-400 font-bold">Consultando base de datos...</p>
      </div>

      <div v-else-if="fabricaciones.length === 0" class="p-20 text-center text-slate-400 italic">
        No hay registros de fabricación en la base de datos.
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/50">
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Pieza / Fecha</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Peso Real</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Diferencia</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Estado</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="f in fabricaciones" :key="f.id" class="hover:bg-slate-50/30 transition">
            <td class="px-8 py-6">
              <div class="font-bold text-slate-700">{{ f.piece?.name || obtenerNombrePieza(f.piece_id) }}</div>
              <div class="text-[10px] text-slate-400 font-mono mt-1">{{ f.created_at || f.manufactured_at }}</div>
            </td>
            <td class="px-8 py-6 font-bold text-slate-600">{{ f.real_weight }} kg</td>
            <td class="px-8 py-6">
              <span :class="[f.weight_diff >= 0 ? 'text-emerald-600' : 'text-red-600']" class="font-black">
                {{ f.weight_diff > 0 ? '+' : '' }}{{ f.weight_diff }} kg
              </span>
            </td>
            <td class="px-8 py-6 text-center">
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase"
                    :class="f.status === 'Fabricada' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'">
                {{ f.status }}
              </span>
            </td>
            <td class="px-8 py-6 text-right space-x-2">
              <button @click="editarRegistro(f)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Editar">
                ✏️
              </button>
              <button @click="eliminarRegistro(f.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-xl transition" title="Eliminar">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-2xl rounded-[40px] p-12 shadow-2xl relative overflow-y-auto max-h-[95vh]">
        
        <div class="mb-10 text-center">
          <h3 class="text-2xl font-black text-slate-800">{{ esEdicion ? 'Actualizar Registro' : 'Nueva Entrada de Producción' }}</h3>
          <p class="text-slate-400">Control de pesaje para piezas fabricadas.</p>
        </div>

        <form @submit.prevent="guardarRegistro" class="grid grid-cols-2 gap-6">
          <div class="col-span-2">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Seleccionar Pieza *</label>
            <select v-model="registroForm.piece_id" required :disabled="esEdicion"
                    class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold disabled:opacity-50">
              <option value="" disabled>Seleccione una pieza...</option>
              <option v-for="p in piezas" :key="p.id" :value="p.id">
                {{ p.name }} (Teórico: {{ p.theoretical_weight }}kg)
              </option>
            </select>
            <p v-if="erroresBackend.piece_id" class="text-red-500 text-[10px] mt-1 ml-1">{{ erroresBackend.piece_id[0] }}</p>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Peso Real (kg) *</label>
            <input v-model="registroForm.real_weight" required type="number" step="0.01"
                   class="w-full px-6 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600 text-xl text-center" 
                   placeholder="0.00">
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Diferencia Calculada</label>
            <div :class="[registroForm.weight_diff >= 0 ? 'text-emerald-600' : 'text-red-600']"
                 class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl text-center">
              {{ registroForm.weight_diff }} kg
            </div>
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Observaciones</label>
            <textarea v-model="registroForm.observations" rows="3"
                      class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
                      placeholder="Indique novedades..."></textarea>
          </div>

          <div class="col-span-2 flex gap-4 pt-4">
            <button type="button" @click="cerrarModal" class="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition">Cancelar</button>
            <button type="submit" :disabled="!esValido || isActionLoading"
                    class="flex-1 py-4 bg-blue-600 text-white rounded-[20px] font-bold shadow-lg shadow-blue-200 disabled:bg-slate-200 flex justify-center items-center gap-2">
              <div v-if="isActionLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ esEdicion ? 'Guardar Cambios' : 'Finalizar Registro' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>