<template>
    <div>
        <h1>Azure AD Authentication with Vue.js</h1>
        <button v-if="!isAuthenticated" @click="login">Login with Azure AD</button>
        <button v-if="isAuthenticated" @click="logout">Logout</button>
        <div v-if="isAuthenticated">
            <p>Welcome, {{ user.name }}</p>
            <button @click="getUserInformation">See Profile</button>
            <div v-if="profile">
                <p>Profile: </p>
                <pre>{{JSON.stringify(profile, null, 2)}}</pre>
            </div>
        </div>
    </div>
    <App2/>
</template>

<script>
import axios from "axios";
import App2 from "@/App2.vue";
export default {
    components: {App2},
    data() {
        return {
            isAuthenticated: false,
            user: null,
            profile: null,
        };
    },
    // https://login.microsoftonline.com/98f94d05-e92c-4659-8254-97c209919c17/oauth2/v2.0/authorize?client_id=5aa252db-81b4-4c2b-8033-b5f7b4fa2d56&scope=User.Read%20openid%20profile%20offline_access&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&client-request-id=0191d95b-8199-7d5b-88a4-67b350024fed&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=3.23.0&client_info=1&code_challenge=TNOCpR-RgdIyYnt9nGgF93TXR7ZsGPI_yLz54Bn00qw&code_challenge_method=S256&nonce=0191d95b-81af-78e1-98b7-dc3257ba0877&state=eyJpZCI6IjAxOTFkOTViLTgxYWYtNzNmNS05M2Y1LWI3YTlmOTE2ZjRkNyIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicG9wdXAifX0%3D
    methods: {
        login() {
            const loginRequest = {
                scopes: ["User.Read"],
            };
            this.$msalInstance.loginPopup(loginRequest).then((response) => {
                this.isAuthenticated = true;
                this.user = response.account;
                console.log(this.user)
            }).catch((error) => {
                console.log(error);
            });
        },
        logout() {
            this.$msalInstance.logoutPopup().then(() => {
                this.isAuthenticated = false;
                this.user = null;
            });
        },
        async getUserInformation() {
            const accounts = this.$msalInstance.getAllAccounts();
            if (accounts.length === 0) return;

            const tokenRequest = {
                scopes: ["User.Read"],
                account: accounts[0], // Use the authenticated account
                // this.$msalInstance.getAccountByUsername(username);
            };

            try {
                // Acquire the access token
                const tokenResponse = await this.$msalInstance.acquireTokenSilent(tokenRequest);
                const accessToken = tokenResponse.accessToken;

                // Call Microsoft Graph API to get user profile
                const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                this.profile = response.data;
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        }
    },
};
</script>
