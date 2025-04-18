import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "/src/style.css";
import Teto from "./Teto.vue";
import Ripple from "primevue/ripple";
import { definePreset } from '@primeuix/themes';
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

app.directive("ripple", Ripple);

app.mount("#app");
