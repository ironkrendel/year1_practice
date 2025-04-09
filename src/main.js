import { createApp } from "vue";
import PrimeVue from "primevue/config";
// import Aura from "@primeuix/themes/aura";
import "./style.css";
import 'primeicons/primeicons.css';
import App from "./App.vue";
import Ripple from "primevue/ripple";
// import { definePreset } from '@primeuix/themes';
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
app.directive("ripple", Ripple);
app.mount("#app");
