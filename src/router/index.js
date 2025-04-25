// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Adjust path as needed
import { auth } from '@/firebase/config'; // Import auth directly for initial check
import { onAuthStateChanged } from 'firebase/auth';
import { watch } from 'vue'; // *** IMPORT watch FROM VUE ***

// --- Route Component Imports ---
// Auth Views
import LoginView from '@/views/auth/LoginView.vue';
import SignupView from '@/views/auth/SignupView.vue';
import SignupSuccessView from '@/views/auth/SignupSuccessView.vue';

// User Views
import DashboardView from '@/views/user/DashboardView.vue'; // Make sure this exists

// Admin Views
import AdminLayout from '@/views/admin/AdminLayout.vue';
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';
import AdminRequestsView from '@/views/admin/AdminRequestsView.vue';
import AdminAddUserView from '@/views/admin/AdminAddUserView.vue';
import AdminAddCompanyView from '@/views/admin/AdminAddCompanyView.vue';

// General Views
import NotFoundView from '@/views/NotFoundView.vue';


// --- Helper function to wait for auth state AND user info ---
const ensureAuthIsInitialized = (authStore) => {
  return new Promise((resolve, reject) => {
    // Define initial check states using undefined
    const isUserChecked = authStore.user !== undefined;
    const isUserInfoChecked = authStore.userInfo !== undefined;

    // If user state is checked (meaning listener ran once or user is null)
    // and not currently loading
    if (isUserChecked && !authStore.isLoading) {
        // If user exists but info hasn't been checked/fetched yet, wait for it
        if(authStore.user && !isUserInfoChecked) {
            console.log("ensureAuthIsInitialized: User exists, waiting for userInfo...");
            // Use a watcher to resolve once userInfo is no longer undefined
            const unwatch = watch(() => authStore.userInfo, (newUserInfo) => {
                // Resolve once userInfo is set (either to null or an object)
                if (newUserInfo !== undefined) {
                    console.log("ensureAuthIsInitialized: userInfo loaded (watcher).");
                    unwatch(); // Stop watching
                    resolve();
                }
            }, { immediate: true }); // Immediate check in case it's already loaded
        } else {
             console.log("ensureAuthIsInitialized: Already initialized (User null or UserInfo loaded/null).");
             resolve(); // User is null or userInfo is already loaded/null
        }
        return;
    }

    // Otherwise, listen for the first time isLoading becomes false
    console.log("ensureAuthIsInitialized: Waiting for initial auth state (isLoading watcher)...");
    const unwatchLoading = watch(() => authStore.isLoading, (isLoading) => {
      if (!isLoading) {
        unwatchLoading(); // Stop watching isLoading
         console.log("ensureAuthIsInitialized: Initial auth state loaded (isLoading watcher). User:", authStore.user?.uid);
         // Now, double-check if we need to wait for userInfo
         const isUserInfoNowChecked = authStore.userInfo !== undefined;
         if(authStore.user && !isUserInfoNowChecked) {
             console.log("ensureAuthIsInitialized: User exists after load, waiting for userInfo (nested watcher)...");
              const unwatchInfo = watch(() => authStore.userInfo, (newUserInfo) => {
                 if (newUserInfo !== undefined) {
                     console.log("ensureAuthIsInitialized: userInfo loaded after initial auth (nested watcher).");
                     unwatchInfo();
                     resolve();
                 }
             }, { immediate: true });
         } else {
            console.log("ensureAuthIsInitialized: User null or UserInfo loaded after initial auth.");
            resolve(); // User is null or userInfo loaded simultaneously
         }
      }
    }, { immediate: true }); // Use immediate to check current state

    // Initialize the listener if it hasn't started (e.g., direct navigation)
    if (!isUserChecked) { // Only call if user state is still undefined
        console.log("ensureAuthIsInitialized: Calling tryRestoreAuthState because user state is undefined.");
        authStore.tryRestoreAuthState();
    }
  });
};


// --- Route Definitions ---
const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/signup', name: 'Signup', component: SignupView, meta: { requiresGuest: true } },
  { path: '/signup-success', name: 'SignupSuccess', component: SignupSuccessView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true, requiresUser: true } },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboardView },
      { path: 'requests', name: 'AdminRequests', component: AdminRequestsView },
      { path: 'add-user', name: 'AdminAddUser', component: AdminAddUserView },
      { path: 'add-company', name: 'AdminAddCompany', component: AdminAddCompanyView },
      { path: '', redirect: { name: 'AdminDashboard' } }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
  // *** Remove the root path redirect from here, handle in guard ***
  // { path: '/', redirect: { name: 'Login' } }
  { path: '/', name: 'Root', component: LoginView } // Temporarily point root to LoginView
];

// --- Router Instance ---
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

// --- Navigation Guards ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  console.log(`Router Guard: Navigating from ${from.fullPath} to ${to.fullPath}`);

  // --- Wait for Auth and User Info Initialization ---
  try {
      console.log("Router Guard: Calling ensureAuthIsInitialized...");
      await ensureAuthIsInitialized(authStore);
      console.log("Router Guard: Auth initialization complete.");
  } catch (error) {
       console.error("Router Guard: Error during auth initialization:", error);
       if (to.meta.requiresAuth) {
           next({ name: 'Login', query: { redirect: to.fullPath } });
           return;
       }
       // Allow navigation to non-auth routes even if init fails? Or redirect to error page?
       // For now, let it potentially continue to avoid blocking public routes.
  }


  // --- Route Access Logic ---
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresUser = to.matched.some(record => record.meta.requiresUser);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;

  console.log(`Router Guard: Route Meta: requiresAuth=${requiresAuth}, requiresAdmin=${requiresAdmin}, requiresUser=${requiresUser}, requiresGuest=${requiresGuest}`);
  console.log(`Router Guard: Auth State: isAuthenticated=${isAuthenticated}, isAdmin=${isAdmin}, UserInfo Loaded: ${authStore.userInfo !== undefined}`);

  // *** Handle Root Path ('/') Navigation AFTER auth check ***
  if (to.path === '/') {
      if (isAuthenticated) {
          console.log("Router Guard: Handling '/'. User authenticated. Redirecting by role.");
          next(isAdmin ? { name: 'AdminDashboard' } : { name: 'Dashboard' });
          return; // Important: stop further checks
      } else {
           console.log("Router Guard: Handling '/'. User not authenticated. Allowing navigation to Root (Login).");
           // Let it proceed to the '/' route which points to LoginView
           next(); // Or explicitly next({ name: 'Login' });
           return;
      }
  }

  // --- Standard Access Checks ---
  if (requiresAuth && !isAuthenticated) {
    console.log('Router Guard: Access DENIED. Requires auth, not authenticated. Redirecting to Login.');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresGuest && isAuthenticated) {
    console.log('Router Guard: Access DENIED. Requires guest, but authenticated. Redirecting based on role.');
    next(isAdmin ? { name: 'AdminDashboard' } : { name: 'Dashboard' });
  } else if (requiresAdmin && !isAdmin) {
     if (!isAuthenticated) {
         console.log('Router Guard: Access DENIED. Requires admin, not authenticated. Redirecting to Login.');
        next({ name: 'Login', query: { redirect: to.fullPath } });
     } else {
         console.log('Router Guard: Access DENIED. Requires admin, user is authenticated but NOT admin. Redirecting to User Dashboard.');
        next({ name: 'Dashboard' });
     }
  } else if (requiresUser && isAdmin) {
      console.log('Router Guard: Access DENIED. Requires user role, but user is admin. Redirecting to Admin Dashboard.');
      next({ name: 'AdminDashboard' });
  }
  else {
    console.log('Router Guard: Access GRANTED.');
    next(); // Allow navigation
  }
});


export default router;
