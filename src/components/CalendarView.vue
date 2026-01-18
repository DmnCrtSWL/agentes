<script setup>
import { ref } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
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

    <!-- Modal -->
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
        </div>
        <div class="modal-footer">
          <button class="action-btn" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  font-family: sans-serif;
}

.calendar-header {
  padding: 15px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header h1 {
  font-size: 18px;
  margin: 0;
}

.back-btn {
  padding: 8px 12px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.calendar-wrapper {
  flex: 1;
  padding: 10px;
  background: white;
  overflow: auto;
}

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
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-footer {
  margin-top: 15px;
  text-align: right;
}

.action-btn {
  background: #00af9c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
