<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiPieces } from '../api/axios';

// --- ESTADOS ---
const showModal = ref(false);
const isLoading = ref(false);      
const isActionLoading = ref(false); 
const proyectos = ref([]);
const esEdicion = ref(false);
const erroresBackend = ref({});

const fechaHoy = new Date().toLocaleDateString('es-CO', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const proyectoForm = ref({
  id: null,
  name: '',
  code: '',
  description: '',
  status: 'active',
  fecha: fechaHoy
});

// --- VALIDACIONES ---
const vNombre = computed(() => proyectoForm.value.name.length >= 3);
const vCodigo = computed(() => /^[a-zA-Z0-9\s-]{3,20}$/.test(proyectoForm.value.code));
const vDesc = computed(() => (proyectoForm.value.description || '').length >= 5);
const esValido = computed(() => vNombre.value && vCodigo.value && vDesc.value);

// --- ACCIONES API ---
const cargarProyectos = async () => {
  isLoading.value = true;
  try {
    const { data } = await apiPieces.get('/projects');
    proyectos.value = data.data || data; 
  } catch (error) {
    console.error("Error cargando proyectos:", error);
  } finally {
    isLoading.value = false;
  }
};

const guardarProyecto = async () => {
  isActionLoading.value = true;
  erroresBackend.value = {};
  
  try {
    if (esEdicion.value) {
      await apiPieces.put(`/projects/${proyectoForm.value.id}`, proyectoForm.value);
    } else {
      await apiPieces.post('/projects', proyectoForm.value);
    }
    
    alert(esEdicion.value ? "✅ Proyecto actualizado" : "✅ Proyecto registrado");
    cerrarModal();
    cargarProyectos();
  } catch (err) {
    console.error("Error en la petición:", err);
    if (err.response?.data?.errors) {
      erroresBackend.value = err.response.data.errors;
    } else {
      alert("Error: No se pudo procesar la solicitud en el servidor.");
    }
  } finally {
    isActionLoading.value = false;
  }
};

const eliminarProyecto = async (id) => {
  if (confirm('¿Estás seguro de eliminar este proyecto?')) {
    try {
      await apiPieces.delete(`/projects/${id}`);
      cargarProyectos();
    } catch (error) {
      console.error("Error al borrar", error);
    }
  }
};

// --- UTILIDADES ---
const abrirEdicion = (proyecto) => {
  esEdicion.value = true;
  proyectoForm.value = { ...proyecto, fecha: fechaHoy };
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  proyectoForm.value = { 
    id: null, name: '', code: '', description: '', status: 'active', fecha: fechaHoy 
  };
  erroresBackend.value = {};
};

onMounted(cargarProyectos);
</script>

<template>
  <div class="space-y-8">
    <!-- Encabezado -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-slate-800">Gestión de Proyectos</h1>
        <p class="text-slate-500">Administra y supervisa el estado de cada orden de fabricación.</p>
      </div>
      <button @click="showModal = true; esEdicion = false" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-sm">
        <span class="text-xl">+</span> Nuevo Proyecto
      </button>
    </div>

    <!-- Tabla con Loading State -->
    <div class="bg-white rounded-[30px] shadow-sm border border-slate-100 overflow-hidden">
        <div v-if="isLoading" class="p-20 text-center">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p class="text-slate-400 font-bold animate-pulse">Sincronizando datos...</p>
        </div>
        <table v-else class="w-full text-left">
            <thead class="bg-slate-50 border-b border-slate-100">
                <tr>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyecto</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                <tr v-for="p in proyectos" :key="p.id" class="hover:bg-slate-50/50 transition">
                    <td class="px-6 py-4">
                        <span class="font-bold text-slate-700 block">{{ p.name }}</span>
                        <span class="text-[10px] font-mono text-blue-500">{{ p.code }}</span>
                    </td>
                    <td class="px-6 py-4">
                        <span :class="p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'" 
                              class="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            {{ p.status === 'active' ? 'Activo' : 'Inactivo' }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right flex justify-end gap-2">
                        <button @click="abrirEdicion(p)" class="text-slate-400 hover:text-blue-600 transition p-2 bg-slate-50 rounded-lg">✏️</button>
                        <button @click="eliminarProyecto(p.id)" class="text-slate-400 hover:text-red-500 transition p-2 bg-slate-50 rounded-lg">🗑️</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-2xl rounded-[40px] p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        
        <div class="mb-10 text-center">
          <h3 class="text-2xl font-black text-slate-800">{{ esEdicion ? 'Editar Proyecto' : 'Configuración del Proyecto' }}</h3>
          <p class="text-slate-400">Completa la información técnica requerida.</p>
        </div>

        <form @submit.prevent="guardarProyecto" class="grid grid-cols-2 gap-6">
          
          <div class="col-span-2">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Nombre del Proyecto *</label>
            <input v-model="proyectoForm.name" type="text" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition">
            <p v-if="erroresBackend.name" class="text-[10px] text-red-500 mt-1 ml-2">{{ erroresBackend.name[0] }}</p>
          </div>

          <div>
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Código *</label>
            <input v-model="proyectoForm.code" type="text" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition uppercase">
            <p v-if="erroresBackend.code" class="text-[10px] text-red-500 mt-1 ml-2">{{ erroresBackend.code[0] }}</p>
          </div>

          <!-- ESTADO: Deshabilitado si es registro nuevo -->
          <div>
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Estado de Orden</label>
            <select v-model="proyectoForm.status" :disabled="!esEdicion"
                    class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none disabled:opacity-50 disabled:cursor-not-allowed font-bold text-blue-600">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <!-- FECHA: Campo solo lectura -->
          <div class="col-span-2">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Fecha de Registro</label>
            <input :value="proyectoForm.fecha" type="text" disabled 
                   class="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 italic cursor-not-allowed">
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Descripción de Fabricación *</label>
            <textarea v-model="proyectoForm.description" rows="3" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"></textarea>
          </div>

          <div class="col-span-2 flex gap-4 pt-6">
            <button type="button" @click="cerrarModal" class="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition">Cancelar</button>
            <button type="submit" :disabled="!esValido || isActionLoading"
                    class="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:bg-slate-200 disabled:shadow-none transition-all flex justify-center items-center gap-3">
              <div v-if="isActionLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isActionLoading ? 'Procesando...' : (esEdicion ? 'Guardar Cambios' : 'Confirmar Registro') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>