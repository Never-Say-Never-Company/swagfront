import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'           // ⚠️ estilos principais
import '@mdi/font/css/materialdesignicons.css' // ícones
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: { mdi },
  },
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
