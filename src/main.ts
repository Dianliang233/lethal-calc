import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import '@unocss/reset/sanitize/forms.css'
import '@unocss/reset/sanitize/typography.css'
import '@unocss/reset/sanitize/reduce-motion.css'
import './assets/main.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.performance = true

app.mount('#app')
