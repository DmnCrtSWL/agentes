<script setup>
import { ref, onMounted } from 'vue';

// URL del Workflow de n8n para LEER citas (GET)
// Tienes que crear este workflow en n8n: Trigger "On Webhook (GET)" -> Postgres "Execute Query (SELECT * FROM citas)" -> Respond to Webhook
const N8N_GET_CITAS_URL = 'https://bambu-cloud.app.n8n.cloud/webhook/obtener-citas'; 
// Asegúrate de cambiar esto por tu URL real de producción/test

const citas = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchCitas = async () => {
  try {
    loading.value = true;
    const response = await fetch(N8N_GET_CITAS_URL);
    if (!response.ok) throw new Error('Error al obtener citas');
    
    // Asumimos que n8n devuelve un array de objetos o un objeto { data: [...] }
    const data = await response.json();
    citas.value = Array.isArray(data) ? data : (data.data || []);
  } catch (e) {
    console.error(e);
    error.value = "No se pudieron cargar las citas. Verifica tu conexión.";
  } finally {
    loading.value = false;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'Sin fecha';
  return new Date(isoString).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

onMounted(() => {
  fetchCitas();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <h1 class="text-xl font-bold text-gray-800">Citas Médicas</h1>
      <button 
        @click="$emit('back')" 
        class="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
      >
        Volver
      </button>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-auto p-6">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center">
        {{ error }}
        <button @click="fetchCitas" class="block mx-auto mt-2 text-sm underline">Reintentar</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="citas.length === 0" class="text-center py-12 text-gray-500">
        <p>No hay citas registradas aún.</p>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th class="px-6 py-3 border-b border-gray-100">Paciente</th>
                <th class="px-6 py-3 border-b border-gray-100">Fecha</th>
                <th class="px-6 py-3 border-b border-gray-100">Contacto</th>
                <th class="px-6 py-3 border-b border-gray-100">Motivo</th>
                <th class="px-6 py-3 border-b border-gray-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="cita in citas" :key="cita.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">
                  {{ cita.paciente_nombre }}
                </td>
                <td class="px-6 py-4 text-teal-700 font-medium">
                  {{ formatDate(cita.fecha_hora) }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span v-if="cita.telefono">{{ cita.telefono }}</span>
                    <span v-if="cita.email" class="text-xs text-gray-400">{{ cita.email }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 max-w-xs truncate" :title="cita.motivo">
                  {{ cita.motivo || '-' }}
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmada
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>
