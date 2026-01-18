<script setup>
import { ref } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Estado del modal de detalles
const selectedEvent = ref(null);
const showModal = ref(false);

const handleEventClick = (info) => {
  selectedEvent.value = {
    title: info.event.title,
    start: info.event.start,
    end: info.event.end,
    extendedProps: info.event.extendedProps
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedEvent.value = null;
};

// Configuración del Calendario
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  // locale: 'es', // Comentado temporalmente para depurar importaciones
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  allDaySlot: false,
  height: 'auto', 
  expandRows: true,
  stickyHeaderDates: true,
  nowIndicator: true,
  eventClick: handleEventClick,
  
  // Eventos Demo
  events: [
    { 
      title: 'Juan Pérez - Consulta', 
      start: new Date(new Date().setHours(10,0,0)), 
      end: new Date(new Date().setHours(11,0,0)), 
      extendedProps: { telefono: '5512345678', motivo: 'Dolor Pecho' },
      backgroundColor: '#00af9c'
    }
  ]
});
</script>

<template>
  <div class="calendar-page">
    <header class="calendar-header">
      <h1>Agenda Dr. Quiroz</h1>
      <button class="back-btn" @click="$emit('back')">Volver</button>
    </header>

    <div class="calendar-wrapper">
      <FullCalendar :options="calendarOptions" style="height: 100%; min-height: 400px;" />
    </div>
      start: new Date(new Date().setHours(10,0,0)), 
      end: new Date(new Date().setHours(11,0,0)), 
      extendedProps: { 
        telefono: '5512345678', 
        motivo: 'Dolor en el pecho',
        resumen: 'Paciente refiere dolor intermitente desde hace 2 días.'
      },
      backgroundColor: '#00af9c',
      borderColor: '#00af9c'
    },
    { 
      title: 'María López - EKG', 
      start: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(16,0,0), // Mañana a las 4pm
      backgroundColor: '#6c5ce7',
      borderColor: '#6c5ce7'
    }
  ]
});
</script>

<template>
  <div class="calendar-page">
    <header class="calendar-header">
      <h1>Agenda Dr. Quiroz</h1>
      <button class="back-btn" @click="$emit('back')">Volver al Chat</button>
    </header>

    <div class="calendar-wrapper">
      <FullCalendar :options="calendarOptions" class="full-calendar"/>
    </div>

    <!-- Modal de Detalles de Cita -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedEvent.title }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <p><strong>Fecha:</strong> {{ selectedEvent.start.toLocaleString() }}</p>
          <p v-if="selectedEvent.extendedProps.telefono">
            <strong>Teléfono:</strong> {{ selectedEvent.extendedProps.telefono }}
          </p>
           <p v-if="selectedEvent.extendedProps.motivo">
            <strong>Motivo:</strong> {{ selectedEvent.extendedProps.motivo }}
          </p>
          <div v-if="selectedEvent.extendedProps.resumen" class="resumen-box">
            <strong>Resumen IA:</strong>
            <p>{{ selectedEvent.extendedProps.resumen }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn">Reprogramar</button>
          <button class="action-btn cancel">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-page {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  font-family: 'Inter', sans-serif;
}

.calendar-header {
  padding: 15px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header h1 {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.back-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.calendar-wrapper {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: white;
}

/* FullCalendar Customization for Mobile */
:deep(.fc-header-toolbar) {
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px; /* Smaller toolbar on mobile */
}

:deep(.fc-toolbar-title) {
  font-size: 16px !important;
}

:deep(.fc-button) {
  padding: 4px 8px !important;
  font-size: 12px !important;
  background-color: #2c3e50;
  border: none;
}

:deep(.fc-button-active) {
  background-color: #00af9c !important;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 8px 0;
  color: #444;
  line-height: 1.5;
}

.resumen-box {
  margin-top: 15px;
  background: #e8f5f3;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 3px solid #00af9c;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #00af9c;
  color: white;
  cursor: pointer;
  font-weight: 500;
}

.action-btn.cancel {
  background: #ff7675;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
