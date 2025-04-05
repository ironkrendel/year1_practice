<script lang="ts">
let darkmodeicon = "";

export const toggleDarkMode = function() {
    document.documentElement.classList.toggle('dark_mode_flag');
    if (document.documentElement.classList.contains('dark_mode_flag')) {
        localStorage.setItem('dark-mode', "true");
    }
    else {
        localStorage.setItem('dark-mode', "false");
    }
}
export const getDarkModeIcon = function() {
    if (document.documentElement.classList.contains('dark_mode_flag')) {
        darkmodeicon = "pi pi-moon";
    }
    else {
        darkmodeicon = "pi pi-sun";
    }
    return darkmodeicon;
}
</script>