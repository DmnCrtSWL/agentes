<script setup>
import { ref, computed } from 'vue';
import ChatHeader from './components/ChatHeader.vue';
import MessageList from './components/MessageList.vue';
import ChatInput from './components/ChatInput.vue';
import CalendarView from './components/CalendarView.vue';

const activeAgentId = ref(1);
const showCalendar = ref(false); // State to toggle calendar view

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
// -------------------------------------------------------------

const handleSelectAgent = (id) => {
  activeAgentId.value = id;
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
        sessionId: 'session-' + Date.now() // Puedes mejorar esto con un ID persistente
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
    <!-- VISTA DE CALENDARIO -->
    <CalendarView 
      v-if="showCalendar" 
      @back="showCalendar = false"
    />

    <!-- VISTA DE CHAT -->
    <template v-else>
      <!-- Usamos v-if aquí también para seguridad extra, aunque el v-else ya maneja la lógica -->
      <ChatHeader 
        v-if="activeAgent"
        :contact-name="activeAgent.name" 
        :status="'En línea'"
        :avatar-url="activeAgent.avatar"
        @selectAgent="handleSelectAgent"
      />
      
      <MessageList 
        v-if="activeAgent"
        :messages="activeAgent.messages" 
      />
      
      <ChatInput v-if="activeAgent" @sendMessage="handleSendMessage" />
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
