import { createApp } from "vue";
import PrimeVue from "primevue/config";
import "./style.css";
import 'primeicons/primeicons.css'
import App from "./App.vue";
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Ripple from "primevue/ripple";
import ThemePreset from './components/themePreset.vue';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: ThemePreset.data()['Theme'],
    options: {
      prefix: "p",
      darkModeSelector: ".dark_mode_flag",
      cssLayer: false,
    },
  },
  ripple: true,
});
app.use(ToastService);
app.component('Toast', Toast);

app.directive("ripple", Ripple);

app.mount("#app");
