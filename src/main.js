// src/main.js (Add this import at the top)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap' // Optional JS
import '@/assets/css/base.css'; // 

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Your existing main.js content...
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')