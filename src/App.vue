<script setup>
import { ref, computed } from 'vue';
import ChatHeader from './components/ChatHeader.vue';
import MessageList from './components/MessageList.vue';
import ChatInput from './components/ChatInput.vue';
import CitasList from './components/CitasList.vue';
import CancelacionesList from './components/CancelacionesList.vue';
import CitaConfirmation from './components/CitaConfirmation.vue';

const activeAgentId = ref(1);
const showCitas = ref(false);
const showCancelaciones = ref(false);
const selectedCita = ref(null);

const agents = ref({
  1: {
    id: 1,
    name: 'Agente 1',
    avatar: '/agent-service.png',
    messages: [
      { id: 11, text: 'Hola! Soy el Agente de Servicio a Cliente.', time: '10:00 AM', isMine: false, status: 'read' },
      { id: 12, text: '¿En qué te puedo ayudar hoy?', time: '10:00 AM', isMine: false, status: 'read' }
    ]
  },
  2: {
    id: 2,
    name: 'Agente 2',
    avatar: '/agent-agenda.png',
    messages: [
      { id: 21, text: 'Hola! Soy el Agente de Agenda.', time: '11:00 AM', isMine: false, status: 'read' },
      { id: 22, text: '¿Quieres agendar una cita?', time: '11:00 AM', isMine: false, status: 'read' }
    ]
  },
  3: {
    id: 3,
    name: 'Agente 3',
    avatar: '/agent-reservations.png',
    messages: [
      { id: 31, text: 'Hola! Soy el Agente de Reservaciones.', time: '12:00 PM', isMine: false, status: 'read' },
      { id: 32, text: '¿Buscas hacer una reservación?', time: '12:01 PM', isMine: false, status: 'read' }
    ]
  }
});

const activeAgent = computed(() => agents.value[activeAgentId.value]);

// -------------------------------------------------------------
// CONFIGURACIÓN DE N8N
const N8N_PROD_URL = 'https://bambu-cloud.app.n8n.cloud/webhook/agente/servicio-cliente';
const N8N_TEST_URL = 'https://bambu-cloud.app.n8n.cloud/webhook-test/agente/servicio-cliente';

// Selecciona automáticamente la URL según el entorno (dev/prod)
const N8N_WEBHOOK_URL = import.meta.env.DEV ? N8N_TEST_URL : N8N_PROD_URL;

console.log(`Usando webhook de: ${import.meta.env.DEV ? 'PRUEBA' : 'PRODUCCIÓN'}`);

// Generar una sesión única (Persistente en LocalStorage)
const getSessionId = () => {
  let stored = localStorage.getItem('chat_session_id');
  if (!stored) {
    stored = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chat_session_id', stored);
  }
  return stored;
};

const sessionId = ref(getSessionId());

const handleSelectAgent = async (id) => {
  if (id === 'citas') {
    showCitas.value = true;
    showCancelaciones.value = false;
    selectedCita.value = null;
  } else if (id === 'cancelaciones') {
     showCitas.value = false;
     showCancelaciones.value = true;
     selectedCita.value = null;
  } else if (id === 'confirmaciones') {
    // ... existing logic
     try {
       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/citas'; 
       const res = await fetch(API_URL);
       const data = await res.json();
       const citas = Array.isArray(data) ? data : (data.data || []);
       
       if (citas.length > 0) {
         // Seleccionamos la primera cita para mostrar en la card
         selectedCita.value = citas[0];
       } else {
         alert('No hay citas disponibles para confirmar.');
         showCitas.value = true;
       }
     } catch (e) {
       console.error(e);
       showCitas.value = true;
     }
  } else if (id === 'servicio-cliente') {
    activeAgentId.value = 1;
    showCitas.value = false;
    showCancelaciones.value = false;
    selectedCita.value = null;
  } else {
    activeAgentId.value = id;
    showCitas.value = false;
    showCancelaciones.value = false;
    selectedCita.value = null;
  }
};

const sendMessageToN8N = async (text, agentId) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        agentId: agentId,
        sessionId: sessionId.value // Usar la sesión persistente
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return data.reply || data.output || "Lo siento, hubo un error procesando tu mensaje."; // Ajusta según lo que devuelva tu n8n
  } catch (error) {
    console.error("Error conectando con n8n:", error);
    return "Error de conexión con el servidor.";
  }
};

const handleSendMessage = async (text) => {
  const currentAgentId = activeAgentId.value;
  
  const newMsg = {
    id: Date.now(),
    text: text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMine: true,
    status: 'sent'
  };
  
  // Add to current agent's messages
  activeAgent.value.messages.push(newMsg);

  // Enviamos a n8n para TODOS los agentes
  
  // Simular estado "delivered" rápido
  setTimeout(() => { newMsg.status = 'delivered'; }, 500);

  // Llamada a API real
  const replyText = await sendMessageToN8N(text, currentAgentId);

  // Agregar respuesta
  activeAgent.value.messages.push({
    id: Date.now() + 1,
    text: replyText,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMine: false,
    status: 'read'
  });
  
  newMsg.status = 'read';
};

</script>

<template>
  <div class="app-container">
    <!-- VISTA DETALLE CITA -->
    <CitaConfirmation 
      v-if="selectedCita" 
      :cita="selectedCita"
      @back="selectedCita = null"
      @confirm="console.log('Confirmada:', $event)"
      @reschedule="console.log('Reprogramar:', $event)"
      @cancel="console.log('Cancelar:', $event)"
    />

    <!-- VISTA LISTA CITAS -->
    <CitasList 
      v-else-if="showCitas" 
      @select="selectedCita = $event"
      @back="showCitas = false"
      @navigate="handleSelectAgent"
    />

     <!-- VISTA LISTA CANCELACIONES -->
    <CancelacionesList 
      v-else-if="showCancelaciones" 
      @select="selectedCita = $event"
      @back="showCancelaciones = false"
      @navigate="handleSelectAgent"
    />

    <!-- VISTA DE CHAT -->
    <template v-else>
      <ChatHeader 
        :contact-name="activeAgent.name" 
        :status="'En línea'"
        :avatar-url="activeAgent.avatar"
        @selectAgent="handleSelectAgent"
      />
      
      <MessageList 
        :messages="activeAgent.messages" 
      />
      
      <ChatInput @sendMessage="handleSendMessage" />
    </template>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
