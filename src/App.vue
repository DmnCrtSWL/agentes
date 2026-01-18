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

const handleSelectAgent = (id) => {
  activeAgentId.value = id;
};

const handleSendMessage = (text) => {
  const newMsg = {
    id: Date.now(),
    text: text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMine: true,
    status: 'sent'
  };
  
  // Add to current agent's messages
  activeAgent.value.messages.push(newMsg);

  // Simulate generic response after a delay specific to current agent
  setTimeout(() => {
    // Update status logic if needed (skipping specific status update for simplicity or can implement by finding msg)
    
    setTimeout(() => {
      activeAgent.value.messages.push({
        id: Date.now() + 1,
        text: `Respuesta del Agente: Recibido.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
        status: 'read'
      });
    }, 1500);
  }, 500);
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
