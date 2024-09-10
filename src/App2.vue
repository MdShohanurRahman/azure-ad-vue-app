<template>
    <div>
        <h1>Login with Azure AD (Username and Password)</h1>
        <div v-if="!isAuthenticated">
            <form @submit.prevent="login">
                <label for="username">Username (email):</label>
                <input type="text" v-model="username" id="username" />

                <label for="password">Password:</label>
                <input type="password" v-model="password" id="password" />

                <button type="submit">Login</button>
            </form>
        </div>
        <div v-else>
            <p>Welcome, {{ user.displayName }}</p>
            <button @click="logout">Logout</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import {msalConfig} from './config/authConfig';

export default {
    name: `App2`,
    data() {
        return {
            username: '',
            password: '',
            isAuthenticated: false,
            user: null,
        };
    },
    methods: {
        async login() {
            try {
                const tokenRequest = {
                    grant_type: 'password',
                    client_id: msalConfig.auth.clientId,
                    client_secret: msalConfig.auth.clientSecret,
                    username: this.username,
                    password: this.password,
                    scope: 'openid profile User.Read', // Scopes for user profile
                };

                // Send the username and password to the token endpoint to acquire a token
                const response = await axios.post(`https://login.microsoftonline.com/${msalConfig.auth.tenantId}/oauth2/v2.0/token`, new URLSearchParams(tokenRequest), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const accessToken = response.data.access_token;

                // Fetch the user profile from Microsoft Graph API
                this.user = await this.fetchUserProfile(accessToken);
                this.isAuthenticated = true;
            } catch (error) {
                console.error('Login error:', error.response?.data || error.message);
            }
        },
        async fetchUserProfile(accessToken) {
            const profileUrl = 'https://graph.microsoft.com/v1.0/me';
            const response = await axios.get(profileUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        },
        logout() {
            this.isAuthenticated = false;
            this.user = null;
            this.username = '';
            this.password = '';
        },
    },
};
</script>
