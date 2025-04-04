import { createApp} from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "./style.css";
import App from "./App.vue";
import Ripple from "primevue/ripple";
import { definePreset } from '@primeuix/themes';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".dark_mode_flag",
      cssLayer: false,
    },
  },
});

app.directive("ripple", Ripple);

app.mount("#app");
