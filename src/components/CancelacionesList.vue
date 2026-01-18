<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Menu, ClipboardCheck, AlertCircle, Clock } from 'lucide-vue-next';

// URL del API de Backend (Express)
const API_URL = import.meta.env.VITE_API_URL || '/api/cancelaciones'; 

const citas = ref([]);
const loading = ref(true);
const error = ref(null);
const showMenu = ref(false);
const lastUpdated = ref(null);
const now = ref(new Date());
let pollingInterval = null;

const emit = defineEmits(['back', 'select', 'navigate']);

const updateNow = () => {
    now.value = new Date();
};

const getRelativeTime = (date) => {
    if (!date) return '';
    const diffInSeconds = Math.floor((now.value - date) / 1000);

    if (diffInSeconds < 60) return 'Unos segundos';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas`;
    return 'Más de un día';
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleMenuOption = (option) => {
  showMenu.value = false;
  if (option === 'back' || option === 'servicio-cliente') {
    emit('back'); 
  } else {
    emit('navigate', option);
  }
};

const fetchCitas = async (isAutoRefresh = false) => {
  try {
    if (!isAutoRefresh) loading.value = true;
    
    // Cambiamos URL a /cancelaciones
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener cancelaciones');
    
    const data = await response.json();
    citas.value = Array.isArray(data) ? data : (data.data || []);
    error.value = null; 
    lastUpdated.value = new Date(); 
  } catch (e) {
    console.error(e);
    if (!isAutoRefresh) error.value = "No se pudieron cargar las cancelaciones. Verifica tu conexión.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCitas();
  pollingInterval = setInterval(() => {
    fetchCitas(true);
    updateNow();
  }, 60000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<template>
  <div class="h-full flex flex-col bg-red-50/30 font-sans">
    <!-- Header diferencia visual (Rojo/Gris) -->
    <header class="bg-white px-6 py-5 flex items-center justify-between border-b border-red-100 shadow-sm sticky top-0 z-20">
      <div class="flex items-center gap-4 relative">
        <button class="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" @click="toggleMenu">
          <Menu :size="24" />
        </button>

         <!-- Dropdown Menu -->
        <div v-if="showMenu" class="absolute top-12 left-0 bg-white rounded-lg shadow-xl border border-gray-100 z-50 min-w-[180px] py-2 overflow-hidden">
          <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors" @click="handleMenuOption('servicio-cliente')">Servicio a Cliente</div>
          <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors" @click="handleMenuOption('citas')">Citas</div>
          <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors bg-red-50 text-red-700" @click="handleMenuOption('cancelaciones')">Cancelaciones</div>
        </div>

        <div>
          <h1 class="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <AlertCircle class="text-red-500" />
            Citas Canceladas
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <p class="text-xs text-gray-500">Historial de cancelaciones</p>
            <span v-if="loading" class="text-xs text-red-600 animate-pulse font-medium">• Actualizando...</span>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Botón Actualizar Manual -->
        <button 
          @click="fetchCitas(false)" 
          class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:rotate-180 duration-300"
          title="Actualizar lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button 
          @click="$emit('back')" 
          class="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm active:translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Chat
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-auto p-4 md:p-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center h-full text-gray-400">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-3"></div>
        <p class="text-sm font-medium animate-pulse">Cargando cancelaciones...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
        <div class="flex items-center gap-3 text-red-600 mb-2">
            Error de conexión
        </div>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchCitas" class="w-full py-2 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors">
          Intentar nuevamente
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="citas.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <div class="bg-gray-100 p-6 rounded-full mb-4">
           <ClipboardCheck class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">Sin cancelaciones</h3>
        <p class="text-gray-500 max-w-xs mt-2">No hay registro de citas canceladas recientemente.</p>
      </div>

      <!-- Modern Table -->
      <div v-else class="bg-white rounded-2xl shadow-xl shadow-red-100/50 border border-red-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-red-50/50 border-b border-red-100 text-xs uppercase tracking-wider text-red-400 font-bold">
                <th class="px-6 py-4">Información del Paciente</th>
                <th class="px-6 py-4">Fecha Cancelación</th> <!-- Nueva columna relevante -->
                <th class="px-6 py-4">Fecha Original Cita</th>
                <th class="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-red-50">
              <tr 
                v-for="cita in citas" 
                :key="cita.id" 
                @click="$emit('select', cita)"
                class="group hover:bg-red-50/30 transition-colors duration-150 cursor-pointer"
              >
                <!-- Paciente Column -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shadow-sm grayscale">
                      {{ cita.paciente_nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors">{{ cita.paciente_nombre }}</div>
                      <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <span v-if="cita.telefono">{{ cita.telefono }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                 <!-- Fecha Cancelación Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="inline-flex flex-col" v-if="cita.deleted_at">
                        <span class="text-sm font-semibold text-gray-700 capitalize">
                          {{ new Date(cita.deleted_at).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }) }}
                        </span>
                        <span class="text-xs text-gray-500 font-mono">
                             {{ new Date(cita.deleted_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) }}
                        </span>
                    </div>
                    <span v-else class="text-gray-400">N/A</span>
                </td>

                <!-- Fecha Original Column -->
                <td class="px-6 py-4 whitespace-nowrap opacity-60">
                   <div class="inline-flex flex-col">
                    <span class="text-sm font-semibold text-gray-700 capitalize">
                      {{ new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
                    </span>
                    <span class="text-xs text-gray-500 font-mono">
                         {{ new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) }}
                    </span>
                  </div>
                </td>    

                <!-- Status Column -->
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 shadow-sm">
                    Cancelada
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="bg-gray-50 border-t border-gray-100 px-6 py-3 text-xs text-gray-500 flex justify-between items-center">
            <span>
                <span v-if="lastUpdated" class="flex items-center gap-1.5">
                    <Clock :size="14" />
                    Actualizado hace: {{ getRelativeTime(lastUpdated) }}
                </span>
            </span>
            <span>Total: {{ citas.length }} canceladas</span>
        </div>
      </div>
    </main>
  </div>
</template>
