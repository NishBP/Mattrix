<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, RouterLink } from 'vue-router'; // Keep useRouter here

// Use the authentication store
const authStore = useAuthStore();
// Get the router instance *in the component*
const router = useRouter(); // <<< GET ROUTER INSTANCE HERE

// Reactive variables for form inputs
const email = ref('');
const password = ref('');

// Function to handle login submission
const handleLogin = async () => {
  if (!email.value || !password.value) {
    authStore.error = 'Please enter both email and password.';
    return;
  }
  console.log("LoginView: Calling authStore.login. Router instance:", router); // Add log
  // Call the login action from the auth store, passing the router
  await authStore.login(email.value, password.value, router); // <<< PASS ROUTER HERE
  // The store action now handles redirection
};

// Function to handle non-functional Google Sign-In
const handleGoogleSignIn = () => {
  alert('Google Sign-In is not implemented yet.');
};

// Function to handle non-functional Forgot Password
const handleForgotPassword = () => {
    alert('Forgot Password functionality is not implemented yet.');
}
</script>

<template>
  <div class="container vh-100 d-flex justify-content-center align-items-center">
    <div class="card p-4 p-md-5" style="width: 100%; max-width: 450px;">
      <div class="card-body">
        <h2 class="card-title text-center mb-4 fw-semibold">Enter your details</h2>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label visually-hidden">Username or Email</label>
            <input
              type="email"
              class="form-control form-control-lg"
              id="email"
              placeholder="username or email"
              v-model="email"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label visually-hidden">Password</label>
            <input
              type="password"
              class="form-control form-control-lg"
              id="password"
              placeholder="password"
              v-model="password"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="text-end mb-3">
             <button type="button" class="btn btn-link btn-sm p-0 text-light-emphasis" @click="handleForgotPassword">
                <small>FORGOT PASSWORD? Don't worry, we got you!</small>
             </button>
          </div>

          <div v-if="authStore.isLoading" class="text-center mb-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-if="authStore.error && !authStore.isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
             <small>{{ authStore.error }}</small>
             <button type="button" class="btn-close btn-sm" @click="authStore.error = null" aria-label="Close"></button>
          </div>


          <div class="d-grid mb-3">
            <button type="submit" class="btn btn-light btn-lg fw-medium" :disabled="authStore.isLoading">
              Continue
            </button>
          </div>

          <div class="text-center my-3 text-light-emphasis">
            <small>OR</small>
          </div>

          <div class="d-grid mb-4">
            <button type="button" class="btn btn-secondary btn-lg fw-medium" @click="handleGoogleSignIn" disabled>
              Continue with Google
            </button>
             <small class="text-center mt-1 text-light-emphasis">(Not implemented)</small>
          </div>

          <div class="text-center">
            <small class="text-light-emphasis">Don't have an account? </small>
            <RouterLink :to="{ name: 'Signup' }" class="fw-medium">Join us</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles specific to LoginView */
.card {
  background-color: var(--bs-body-bg); /* Ensure card uses the dark background */
  border: 1px solid var(--bs-border-color);
  border-radius: 0.75rem; /* Example: slightly more rounded corners */
}

.btn-link {
    color: var(--bs-link-color); /* Ensure link color is applied */
    text-decoration: none;
}
.btn-link:hover {
    color: var(--bs-link-hover-color);
    text-decoration: underline;
}

.form-control {
    background-color: var(--bs-secondary-bg); /* Darker input background */
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
}
.form-control:focus {
    background-color: var(--bs-secondary-bg);
    color: var(--bs-body-color);
    border-color: var(--bs-link-color); /* Highlight focus */
    box-shadow: 0 0 0 0.25rem rgba(var(--bs-link-color-rgb), 0.25); /* Use Bootstrap's focus shadow system if possible */
}
.form-control::placeholder {
    color: var(--bs-form-control-placeholder-color);
    font-weight: var(--font-weight-light);
}

.btn-light {
    /* Style the primary button */
     --bs-btn-color: var(--bs-body-bg); /* Dark text */
     --bs-btn-bg: var(--bs-emphasis-color); /* White background */
     --bs-btn-border-color: var(--bs-emphasis-color);
     --bs-btn-hover-color: var(--bs-body-bg);
     --bs-btn-hover-bg: #f0f0f0; /* Slightly off-white on hover */
     --bs-btn-hover-border-color: #f0f0f0;
     --bs-btn-active-color: var(--bs-body-bg);
     --bs-btn-active-bg: #e0e0e0;
     --bs-btn-active-border-color: #e0e0e0;
     --bs-btn-disabled-color: #6c757d;
     --bs-btn-disabled-bg: var(--bs-emphasis-color);
     --bs-btn-disabled-border-color: var(--bs-emphasis-color);
     opacity: 0.85;
}
.btn-light:disabled {
     opacity: 0.65;
}

.btn-secondary {
    /* Style the secondary button (Google) */
     --bs-btn-color: var(--bs-body-color);
     --bs-btn-bg: var(--bs-tertiary-bg);
     --bs-btn-border-color: var(--bs-tertiary-bg);
     --bs-btn-hover-color: var(--bs-emphasis-color);
     --bs-btn-hover-bg: #5a6268;
     --bs-btn-hover-border-color: #5a6268;
}

.alert-danger {
    /* Ensure alert colors fit the theme */
    --bs-alert-color: #f8d7da;
    --bs-alert-bg: #842029;
    --bs-alert-border-color: #f5c2c7;
}
.alert-danger .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%); /* Make close button visible */
}
</style>
