import { createApp } from "vue";
import PrimeVue from "primevue/config";
import "/src/style.css";
import Teto from "./Teto.vue";
import ThemePreset from "/src/components/themePreset.vue";

const app = createApp(Teto);

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

app.mount("#app");
