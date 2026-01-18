<script setup>
import { ref, computed } from 'vue';
import ChatHeader from './components/ChatHeader.vue';
import MessageList from './components/MessageList.vue';
import ChatInput from './components/ChatInput.vue';

const activeAgentId = ref(1);

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
// Reemplaza esta URL con la Production URL de tu Webhook de n8n
const N8N_WEBHOOK_URL = 'https://bambu-cloud.app.n8n.cloud/webhook-test/agente/servicio-cliente'; 
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

  // Si es el Agente 1, enviamos a n8n
  if (currentAgentId === 1) {
    
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

  } else {
    // Lógica simulada para otros agentes (por ahora)
    setTimeout(() => {
      activeAgent.value.messages.push({
        id: Date.now() + 1,
        text: `Respuesta simulada del ${activeAgent.value.name}: Recibido.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
        status: 'read'
      });
    }, 1500);
  }
};
</script>

<template>
  <ChatHeader 
    contactName="Agente" 
    status="En línea" 
    :avatarUrl="activeAgent.avatar" 
    @selectAgent="handleSelectAgent"
  />
  <MessageList :messages="activeAgent.messages" />
  <ChatInput @sendMessage="handleSendMessage" />
</template>

<style>
/* App specific global overrides or specific layout if needed not covered by main.css */
</style>
