import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "/src/style.css";
import Teto from "./Teto.vue";
import Ripple from "primevue/ripple";
import { definePreset } from '@primeuix/themes';

const app = createApp(Teto);

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
