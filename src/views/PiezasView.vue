<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiPieces } from '../api/axios';

// --- ESTADOS ---
const showModal = ref(false);
const esEdicion = ref(false);
const isLoading = ref(false);
const isActionLoading = ref(false);

const piezas = ref([]);
const bloques = ref([]); // Para el selector de vinculación
const erroresBackend = ref({});

// Modelo exacto a la migración 'pieces'
const piezaForm = ref({
  id: null,
  name: '',
  code: '',
  block_id: '',
  theoretical_weight: '',
  description: ''
});

// --- VALIDACIONES ---
const esValido = computed(() => {
  const pesoNum = parseFloat(piezaForm.value.theoretical_weight);
  return piezaForm.value.name.length > 2 && 
         piezaForm.value.code.length > 1 && 
         piezaForm.value.block_id !== '' &&
         !isNaN(pesoNum) && pesoNum > 0;
});

// --- ACCIONES API ---

const cargarDatos = async () => {
  isLoading.value = true;
  try {
    const [resPiezas, resBloques] = await Promise.all([
      apiPieces.get('/pieces'),
      apiPieces.get('/blocks')
    ]);
    piezas.value = resPiezas.data.data || resPiezas.data;
    bloques.value = resBloques.data.data || resBloques.data;
  } catch (error) {
    console.error("Error sincronizando datos:", error);
  } finally {
    isLoading.value = false;
  }
};

const guardarPieza = async () => {
  isActionLoading.value = true;
  erroresBackend.value = {};

  try {
    // Aseguramos formato decimal antes de enviar
    const payload = {
      ...piezaForm.value,
      theoretical_weight: parseFloat(piezaForm.value.theoretical_weight).toFixed(2)
    };

    if (esEdicion.value) {
      await apiPieces.put(`/pieces/${piezaForm.value.id}`, payload);
    } else {
      await apiPieces.post('/pieces', payload);
    }
    
    cerrarModal();
    cargarDatos();
  } catch (err) {
    if (err.response?.data?.errors) {
      erroresBackend.value = err.response.data.errors;
    }
  } finally {
    isActionLoading.value = false;
  }
};

const eliminarPieza = async (id) => {
  if (confirm('¿Deseas eliminar esta pieza de forma permanente?')) {
    try {
      await apiPieces.delete(`/pieces/${id}`);
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

// --- UTILIDADES ---
const abrirEdicion = (pieza) => {
  esEdicion.value = true;
  piezaForm.value = { ...pieza };
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  piezaForm.value = { id: null, name: '', code: '', block_id: '', theoretical_weight: '', description: '' };
  erroresBackend.value = {};
};

onMounted(cargarDatos);
</script>

<template>
  <div class="space-y-8">
    <!-- Cabecera -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-slate-800">Control de Piezas</h1>
        <p class="text-slate-500">Registro de componentes individuales y pesos teóricos.</p>
      </div>
      <button @click="showModal = true; esEdicion = false" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-sm">
        <span class="text-xl">+</span> Nueva Pieza
      </button>
    </div>

    <!-- Tabla de Piezas -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p class="text-slate-400 font-bold">Cargando inventario de piezas...</p>
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/50">
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Pieza / Código</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Bloque Perteneciente</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Peso Teórico</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="p in piezas" :key="p.id" class="hover:bg-slate-50/30 transition group">
            <td class="px-8 py-6">
              <div class="font-bold text-slate-700">{{ p.name }}</div>
              <div class="text-[10px] text-slate-400 font-normal uppercase tracking-widest mt-1">{{ p.code }}</div>
            </td>
            <td class="px-8 py-6 text-sm text-slate-500 font-medium italic">
              {{ bloques.find(b => b.id === p.block_id)?.name || 'Bloque ID: ' + p.block_id }}
            </td>
            <td class="px-8 py-6 font-mono text-blue-600 font-bold">
              {{ p.theoretical_weight }} kg
            </td>
            <td class="px-8 py-6 text-right">
              <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition">
                <button @click="abrirEdicion(p)" class="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded-lg transition">✏️</button>
                <button @click="eliminarPieza(p.id)" class="p-2 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded-lg transition">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DE REGISTRO DE PIEZA -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-2xl rounded-[40px] p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        
        <div class="mb-10">
          <h3 class="text-2xl font-black text-slate-800">{{ esEdicion ? 'Editar Componente' : 'Nueva Pieza de Fabricación' }}</h3>
          <p class="text-slate-400">Ingresa las especificaciones técnicas para el cálculo de fabricación.</p>
        </div>

        <form @submit.prevent="guardarPieza" class="grid grid-cols-2 gap-6">
          
          <!-- Nombre -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Nombre de la Pieza</label>
            <input v-model="piezaForm.name" required type="text" 
                   class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
                   placeholder="Ej: Platina 1/2 pulgada">
            <p v-if="erroresBackend.name" class="text-[10px] text-red-500 mt-1">{{ erroresBackend.name[0] }}</p>
          </div>

          <!-- Código -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Código Único (Code)</label>
            <input v-model="piezaForm.code" required type="text" 
                   class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition font-mono uppercase" 
                   placeholder="PZ-001">
            <p v-if="erroresBackend.code" class="text-[10px] text-red-500 mt-1">{{ erroresBackend.code[0] }}</p>
          </div>

          <!-- Combox Bloques (Relación real) -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Vincular a Bloque</label>
            <select v-model="piezaForm.block_id" required
                    class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium">
              <option value="" disabled>Selecciona bloque...</option>
              <option v-for="blq in bloques" :key="blq.id" :value="blq.id">
                {{ blq.name }} ({{ blq.code }})
              </option>
            </select>
          </div>

          <!-- Peso Teórico -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Peso Teórico (theoretical_weight)</label>
            <div class="relative">
              <input v-model="piezaForm.theoretical_weight" required type="number" step="0.01" min="0"
                     class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-blue-600" 
                     placeholder="0.00">
              <span class="absolute right-6 top-4 text-slate-300 font-bold">KG</span>
            </div>
            <p v-if="erroresBackend.theoretical_weight" class="text-[10px] text-red-500 mt-1">{{ erroresBackend.theoretical_weight[0] }}</p>
          </div>

          <!-- Descripción -->
          <div class="col-span-2">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Descripción</label>
            <textarea v-model="piezaForm.description" rows="3"
                      class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
                      placeholder="Detalles adicionales..."></textarea>
          </div>

          <!-- Botones -->
          <div class="col-span-2 flex gap-4 pt-6">
            <button type="button" @click="cerrarModal" class="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition">Cancelar</button>
            <button type="submit" :disabled="!esValido || isActionLoading"
                    class="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex justify-center items-center gap-2">
              <div v-if="isActionLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ esEdicion ? 'Guardar Cambios' : 'Registrar Componente' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>