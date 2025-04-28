// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { watch } from 'vue';

// --- Route Component Imports ---
import LoginView from '@/views/auth/LoginView.vue';
import SignupView from '@/views/auth/SignupView.vue';
import SignupSuccessView from '@/views/auth/SignupSuccessView.vue';
import DashboardLayout from '@/views/dashboard/DashboardLayout.vue';
import StoreListView from '@/views/dashboard/stores/StoreListView.vue';
import FixtureListView from '@/views/dashboard/fixtures/FixtureListView.vue';
import ProductListView from '@/views/dashboard/products/ProductListView.vue';
import CategoryListView from '@/views/dashboard/categories/CategoryListView.vue';
import BrandListView from '@/views/dashboard/brands/BrandListView.vue';
import SupplierListView from '@/views/dashboard/suppliers/SupplierListView.vue';
import PlanogramListView from '@/views/dashboard/planograms/PlanogramListView.vue';
import AdminLayout from '@/views/admin/AdminLayout.vue';
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';
import AdminRequestsView from '@/views/admin/AdminRequestsView.vue';
import AdminAddUserView from '@/views/admin/AdminAddUserView.vue';
import AdminAddCompanyView from '@/views/admin/AdminAddCompanyView.vue';
import NotFoundView from '@/views/NotFoundView.vue';


// --- Auth Init Helper (Keep as is) ---
const ensureAuthIsInitialized = (authStore) => {
  return new Promise((resolve) => {
    const isUserChecked = authStore.user !== undefined;
    const isUserInfoChecked = authStore.userInfo !== undefined;

    if (isUserChecked && !authStore.isLoading) {
        if(authStore.user && !isUserInfoChecked) {
            console.log("ensureAuthIsInitialized: User exists, waiting for userInfo...");
            const unwatch = watch(() => authStore.userInfo, (newUserInfo) => {
                if (newUserInfo !== undefined) {
                    console.log("ensureAuthIsInitialized: userInfo loaded (watcher).");
                    unwatch(); resolve();
                }
            }, { immediate: true });
        } else {
             console.log("ensureAuthIsInitialized: Already initialized (User null or UserInfo loaded/null).");
             resolve();
        }
        return;
    }

    console.log("ensureAuthIsInitialized: Waiting for initial auth state (isLoading watcher)...");
    const unwatchLoading = watch(() => authStore.isLoading, (isLoading) => {
      if (!isLoading) {
        unwatchLoading();
         console.log("ensureAuthIsInitialized: Initial auth state loaded (isLoading watcher). User:", authStore.user?.uid);
         const isUserInfoNowChecked = authStore.userInfo !== undefined;
         if(authStore.user && !isUserInfoNowChecked) {
             console.log("ensureAuthIsInitialized: User exists after load, waiting for userInfo (nested watcher)...");
              const unwatchInfo = watch(() => authStore.userInfo, (newUserInfo) => {
                 if (newUserInfo !== undefined) {
                     console.log("ensureAuthIsInitialized: userInfo loaded after initial auth (nested watcher).");
                     unwatchInfo(); resolve();
                 }
             }, { immediate: true });
         } else {
            console.log("ensureAuthIsInitialized: User null or UserInfo loaded after initial auth.");
            resolve();
         }
      }
    }, { immediate: true });

    if (!isUserChecked) {
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
  {
    path: '/dashboard', component: DashboardLayout, meta: { requiresAuth: true, requiresCompanyOrStoreManager: true },
    children: [
        { path: 'stores', name: 'DashboardStores', component: StoreListView },
        { path: 'planograms', name: 'DashboardPlanograms', component: PlanogramListView },
        { path: 'fixtures', name: 'DashboardFixtures', component: FixtureListView },
        { path: 'products', name: 'DashboardProducts', component: ProductListView },
        { path: 'categories', name: 'DashboardCategories', component: CategoryListView },
        { path: 'brands', name: 'DashboardBrands', component: BrandListView },
        { path: 'suppliers', name: 'DashboardSuppliers', component: SupplierListView },
        { path: '', redirect: { name: 'DashboardStores' } }
    ]
   },
  {
    path: '/admin', component: AdminLayout, meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboardView },
      { path: 'requests', name: 'AdminRequests', component: AdminRequestsView },
      { path: 'add-user', name: 'AdminAddUser', component: AdminAddUserView },
      { path: 'add-company', name: 'AdminAddCompany', component: AdminAddCompanyView },
      { path: '', redirect: { name: 'AdminDashboard' } }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
  { path: '/', name: 'Root', component: LoginView }
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

  // Wait for Auth and User Info Initialization
  try {
      await ensureAuthIsInitialized(authStore);
  } catch (error) {
       console.error("Router Guard: Error during auth initialization:", error);
       if (to.meta.requiresAuth && to.name !== 'Login') {
           next({ name: 'Login', query: { redirect: to.fullPath } });
           return;
       }
  }

  // Define checks based on store state AFTER initialization
  const isAuthenticated = authStore.isAuthenticated;
  const isSuperAdmin = authStore.isSuperAdmin;
  const isCompanyUser = authStore.isCompanyUser;
  const isStoreManager = authStore.isStoreManager;
  const userInfoLoaded = authStore.userInfo !== undefined;
  const userInfoIsNull = authStore.userInfo === null; // Explicitly check for null

  // Define route requirements
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresCompanyOrStoreManager = to.matched.some(record => record.meta.requiresCompanyOrStoreManager);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  console.log(`Router Guard: Route Meta: requiresAuth=${requiresAuth}, requiresAdmin=${requiresAdmin}, requiresCompanyOrStoreManager=${requiresCompanyOrStoreManager}, requiresGuest=${requiresGuest}`);
  console.log(`Router Guard: Auth State: isAuthenticated=${isAuthenticated}, isSuperAdmin=${isSuperAdmin}, isCompanyUser=${isCompanyUser}, isStoreManager=${isStoreManager}, UserInfo Loaded: ${userInfoLoaded}, UserInfo is Null: ${userInfoIsNull}`);


  // Handle Root Path ('/') Navigation
  if (to.path === '/') {
      if (isAuthenticated) {
          // Wait until userInfo is definitively loaded (not undefined)
          if (!userInfoLoaded) {
              console.warn("Router Guard: Handling '/'. User authenticated but profile not loaded yet. Blocking navigation.");
              next(false); // Block until profile is loaded
          } else if (isSuperAdmin) {
              next({ name: 'AdminDashboard' });
          } else if (isCompanyUser || isStoreManager) {
              next({ name: 'DashboardStores' });
          } else { // UserInfo is loaded but null (not found) or unknown role
              console.warn("Router Guard: Authenticated user with unknown/null role accessing '/'. Redirecting to Login.");
              next({ name: 'Login' });
          }
      } else {
           next(); // Allow unauthenticated to Root (Login)
      }
      return;
  }

  // Standard Access Checks
  if (requiresAuth && !isAuthenticated) {
    console.log('Router Guard: DENIED. Requires auth, not authenticated.');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresGuest && isAuthenticated) {
    console.log('Router Guard: DENIED. Requires guest, but authenticated.');
    if (!userInfoLoaded) {
        console.warn("Router Guard: Authenticated user profile not loaded yet, blocking guest route access without redirect.");
        next(false); // Block navigation
    } else if (isSuperAdmin) {
        next({ name: 'AdminDashboard' });
    } else if (isCompanyUser || isStoreManager) {
        next({ name: 'DashboardStores' });
    } else { // UserInfo loaded but is null or unknown role
         console.warn("Router Guard: Authenticated user with null/unknown role denied guest route. Redirecting to Login.");
         // Avoid infinite loop if already going to login
         if (to.name !== 'Login') {
             next({ name: 'Login' });
         } else {
             next(false); // Prevent navigation if already at login
         }
    }
  } else if (requiresAdmin && !isSuperAdmin) {
     console.log('Router Guard: DENIED. Requires SuperAdmin, user is not.');
     // Redirect only if authenticated and profile loaded, otherwise send to login
     if (isAuthenticated && userInfoLoaded) next({ name: 'DashboardStores' });
     else if (isAuthenticated && !userInfoLoaded) next(false); // Wait if profile not loaded
     else next({ name: 'Login' });
  } else if (requiresCompanyOrStoreManager && !(isCompanyUser || isStoreManager)) {
      console.log('Router Guard: DENIED. Requires Company/Store role, user is not.');
      // Redirect only if authenticated and profile loaded, otherwise send to login
      if (isAuthenticated && userInfoLoaded && isSuperAdmin) next({ name: 'AdminDashboard' });
      else if (isAuthenticated && !userInfoLoaded) next(false); // Wait if profile not loaded
      else next({ name: 'Login' });
  }
  else {
    // All checks passed or no specific requirements
    console.log('Router Guard: GRANTED.');
    next(); // Allow navigation
  }
});


export default router;
