import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Esto busca automáticamente src/router/index.js
import './style.css'

const app = createApp(App)

app.use(router) // Aquí es donde le enseñamos a Vue qué es <router-view>
app.mount('#app')