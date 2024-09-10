// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import { PublicClientApplication } from '@azure/msal-browser';
import {msalConfig} from './config/authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

async function initializeApp() {
    await msalInstance.initialize(); // Make sure MSAL is initialized before mounting the Vue app
    const app = createApp(App);
    app.config.globalProperties.$msalInstance = msalInstance;
    app.mount('#app');
}

initializeApp().then(() => console.log("App Initialize"));
