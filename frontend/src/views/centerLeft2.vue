<template>
  <div id="centerLeft1">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <span>
          <icon name="chart-bar" class="text-icon"></icon>
        </span>
        <div class="d-flex">
          <dv-decoration-3 class="dv-dec-3" />
        </div>
      </div>
      <div>
        <h1>ST Diagnosis</h1>
      </div>
      <div class="chat-container">
        <div class="chat-window">
          <div class="messages">
            <div v-for="(message, index) in messages" :key="index" :class="['message', message.sender]">
              {{ message.text }}
            </div>
          </div>
          <div class="input-area">
            <input v-model="userInput" @keyup.enter="sendMessage" placeholder="Type your message here..." />
            <button @click="sendMessage(true)" style="margin-right: 5px;background-color: burlywood;">RAG</button>
            <button @click="sendMessage(false)">Send</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      userInput: '',
      query: '',
      messages: [
        { sender: 'bot', text: 'Hello! How can I assist you today?' }
      ]
    };
  },
  methods: {
    sendMessage(is_rag) {
      if (this.userInput.trim() !== '') {
        this.messages.push({ sender: 'user', text: this.userInput });
        this.query = this.userInput;
        this.userInput = '';
        this.getBotResponse(is_rag);
      }
    },
    getBotResponse(is_rag) {
      const formData = new FormData();
      formData.append('query', this.query);
      formData.append('is_rag', is_rag);
      axios.post('http://127.0.0.1:8888/chat', formData)
        .then(response => {
          console.log('Response:', response.data);
          this.messages.push({ sender: 'bot', text: response.data.resp });
        })
        .catch(error => {
          console.error('Error:', error);
          this.messages.push({ sender: 'bot', text: 'Sorry, something went wrong.' });
        });
    },
    
  }
};
</script>

<style lang="scss" scoped>
#centerLeft1 {
  padding: 16px;
  border-radius: 10px;

  .bg-color-black {

    border-radius: 10px;
  }

  .text {
    color: #c3cbde;
  }

  .dv-dec-3 {
    position: relative;
    width: 100px;
    height: 20px;
    top: -3px;
  }

  h1 {
    text-align: center;
    color: #6ba7e3;
    font-family: "Arial Black";
    margin-top: 10%;
    margin-bottom: 5%;
  }

  .content {
    overflow: auto;
    height: 19rem;
    word-wrap: break-word;
    word-break: break-all;
  }

  // 谷歌滚动条
  ::-webkit-scrollbar {
    width: 1px;
    height: 1px;
    position: absolute
  }

  ::-webkit-scrollbar-thumb {
    background-color: #5bc0de
  }

  ::-webkit-scrollbar-track {
    background-color: #ddd
  }

  ::-webkit-scrollbar {
    width: 1px;
    height: 1px;
    position: absolute;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #5bc0de;
  }

  ::-webkit-scrollbar-track {
    background-color: #ddd;
  }
}

.chat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.chat-window {
  width: 100%;
  max-width: 100%;
  border: 1px solid #080808;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto; /* 允许垂直滚动 */
  min-height: 246px;
  max-height: 246px; /* 固定高度 */
  word-wrap: break-word; /* 自动换行 */
  word-break: break-word; /* 支持长单词换行 */
}

.message {
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
}

.message.bot {
  background-color: #fffcfc;
  align-self: flex-start;
  color: #000;
}

.message.user {
  background-color: #dce0dc;
  color: #fff;
  align-self: flex-end;
  color: #000;
}

.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
  position: fixed;
  bottom: 60px;
  width: 23%;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
