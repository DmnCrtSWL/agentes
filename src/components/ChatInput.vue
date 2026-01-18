<script setup>
import { ref } from 'vue';
import { Plus, Mic, Send, Smile, Camera } from 'lucide-vue-next';

const emit = defineEmits(['sendMessage']);

const messageText = ref('');

const handleSend = () => {
  if (messageText.value.trim()) {
    emit('sendMessage', messageText.value);
    messageText.value = '';
  }
};

const handleKeyup = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    handleSend();
  }
};
</script>

<template>
  <footer class="chat-footer">
    <button class="icon-btn">
      <Plus :size="24" />
    </button>
    
    <div class="input-container">
      <div class="input-wrapper">
         <!-- Sticker/Emoji would go here as internal input actions usually, keeping simple for now -->
         <input 
          v-model="messageText" 
          type="text" 
          placeholder="Mensaje" 
          class="chat-input"
          @keyup.enter="handleSend"
        />
        <button class="icon-btn-input">
           <Camera :size="20" class="camera-icon-internal" /> <!-- Often inside the input area on some versions -->
        </button>
      </div>
    </div>

    <button class="voice-btn" @click="handleSend">
      <Send v-if="messageText.trim()" :size="20" class="send-icon" />
      <Mic v-else :size="20" />
    </button>
  </footer>
</template>

<style scoped>
.chat-footer {
  display: flex;
  align-items: center;
  padding: 5px 10px; /* Compact padding */
  background-color: #F0F2F5;
  min-height: 62px;
  gap: 8px;
  z-index: 10;
}

.icon-btn {
  background: none;
  border: none;
  color: #54656F;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.input-wrapper {
  background-color: white;
  border-radius: 8px; /* Slightly squarer on new versions or rounded pill */
  border-radius: 20px;
  width: 100%;
  padding: 6px 12px;
  display: flex;
  align-items: center;
}

.chat-input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 15px;
  padding: 5px; /* internal padding */
  outline: none;
  color: #111B21;
}

.chat-input::placeholder {
  color: #667781;
}

.icon-btn-input {
  background: none;
  border: none;
  color: #54656F;
  padding: 0 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.voice-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background-color: var(--wa-teal); /* Mic button is usually green background on mobile if typed? No usually green text, wait. */
  /* Actually on WA Android: Mic is green circle specific style. */
  background-color: var(--wa-teal); 
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.1s;
}

.voice-btn:active {
  transform: scale(0.95);
}

.send-icon {
  margin-left: 2px; /* Visual center adjustment */
}
</style>
