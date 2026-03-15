import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vue3-toastify/dist/index.css';
import { VueShowdownPlugin } from 'vue-showdown';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(VueShowdownPlugin, {
    options: {
        emoji: true,
    },
});


app.mount('#app')
