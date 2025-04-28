// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
// import { useRouter } from 'vue-router'; // No longer needed here
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export const useAuthStore = defineStore('auth', () => {
    // --- State ---
    const user = ref(undefined);
    const userInfo = ref(undefined); // Holds Firestore user profile { id, email, role, companyId, ... }
    const isLoading = ref(true);
    const error = ref(null);

    // --- Getters (Computed Properties) ---
    const isAuthenticated = computed(() => !!user.value);
    const isSuperAdmin = computed(() => userInfo.value?.role === 'SuperAdmin');
    // *** NEW: Check for company-level Admin or Category Manager ***
    const isCompanyUser = computed(() => userInfo.value?.role === 'Admin' || userInfo.value?.role === 'CategoryManager');
    // *** NEW: Check for Store Manager ***
    const isStoreManager = computed(() => userInfo.value?.role === 'StoreManager');
    const userId = computed(() => user.value?.uid || null);
    const userCompanyId = computed(() => userInfo.value?.companyId || null); // Get user's company ID

    // --- Actions ---

    /**
     * Attempts to log in a user with email and password.
     * Relies on listener and router guard for profile fetch and redirection.
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @param {object} router - The Vue Router instance (passed from component).
     */
    async function login(email, password, router) {
        isLoading.value = true;
        error.value = null;
        if (!router) {
            console.error("Login Action Error: Router instance was not provided.");
            error.value = "An internal error occurred (Router missing).";
            isLoading.value = false;
            return;
        }
        try {
            console.log(`Attempting login for ${email}...`);
            // 1. Sign in the user - this triggers onAuthStateChanged listener
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log(`signInWithEmailAndPassword successful for ${email}. Listener will handle profile fetch.`);

            // 2. Wait for userInfo to be populated by the listener
            const loadedUserInfo = await new Promise((resolve) => {
                if (userInfo.value !== undefined) { // Already loaded?
                    resolve(userInfo.value);
                    return;
                }
                const unwatch = watch(() => userInfo.value, (newValue) => {
                    if (newValue !== undefined) {
                        unwatch(); resolve(newValue);
                    }
                });
                // Safety timeout
                setTimeout(() => { unwatch(); resolve(userInfo.value); }, 3000);
            });

            // 3. Redirect based on role (using computed properties now)
             if (isAuthenticated.value) {
                 if (loadedUserInfo === null && !error.value) { // Check if fetch failed silently
                     error.value = "Login succeeded but user profile could not be loaded or is inactive.";
                     console.warn(error.value);
                 } else if (isSuperAdmin.value) {
                     console.log("Login successful, redirecting to Admin Dashboard...");
                     router.push({ name: 'AdminDashboard' });
                 } else if (isCompanyUser.value || isStoreManager.value) { // Redirect Admin, CM, StoreManager to main dashboard
                     console.log(`Login successful as ${userInfo.value?.role}, redirecting to Main Dashboard...`);
                     router.push({ name: 'DashboardStores' }); // Default main dashboard route
                 } else if (loadedUserInfo) {
                     console.warn("Login successful but user has unrecognized role:", userInfo.value?.role);
                     error.value = "Login succeeded but user role is not recognized.";
                 }
                 // If error was already set by fetchUserInfo (e.g., inactive), don't redirect
             } else {
                 console.error("Login failed: User is not authenticated after successful sign-in call.");
                 if (!error.value) error.value = "Authentication failed unexpectedly after sign-in.";
             }

        } catch (err) {
            console.error("Login Error (signInWithEmailAndPassword):", err);
            error.value = getFriendlyErrorMessage(err.code || 'unknown');
            user.value = null;
            userInfo.value = null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Logs out the current user.
     * @param {object} router - The Vue Router instance (passed from component).
     */
    async function logout(router) {
        isLoading.value = true;
        error.value = null;
        if (!router) {
            console.error("Logout Action Error: Router instance was not provided.");
        }
        try {
            await signOut(auth);
            console.log("Logout successful, redirecting to Login...");
            if (router) {
                router.push({ name: 'Login' }); // Ensure redirect uses name
            } else {
                window.location.pathname = '/login'; // Fallback
            }
        } catch (err) {
            console.error("Logout Error:", err);
            error.value = "Logout failed. Please try again.";
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Fetches user profile information from Firestore. (Called by listener)
     * @param {string} uid - The user's Firebase Auth UID.
     */
    async function fetchUserInfo(uid) {
        if (!uid) {
            userInfo.value = null;
            return;
        }
        userInfo.value = undefined; // Indicate fetching
        try {
            console.log(`fetchUserInfo (listener): Attempting to fetch profile for UID: ${uid}`);
            const userDocRef = doc(db, 'users', uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                console.log(`fetchUserInfo (listener): Profile found for UID: ${uid}`, data);
                if (data.isActive === false) {
                    console.warn(`fetchUserInfo (listener): User ${uid} is inactive.`);
                    throw new Error("User account is inactive.");
                }
                // *** Assign companyId directly ***
                userInfo.value = { id: userDocSnap.id, companyId: data.companyId, ...data };
            } else {
                console.warn(`fetchUserInfo (listener): User document not found for UID: ${uid}.`);
                userInfo.value = null;
            }
        } catch (err) {
            console.error("Fetch User Info Error (listener):", err);
            if (err.message === "User account is inactive.") {
                error.value = err.message;
                console.log("fetchUserInfo (listener): Forcing logout due to inactive account.");
                signOut(auth).catch(signOutError => console.error("Error during forced sign out:", signOutError));
            } else {
                 console.error("fetchUserInfo (listener): Non-critical fetch error:", err.message);
                 userInfo.value = null;
            }
            if (userInfo.value !== null) userInfo.value = null;
        }
    }

    /**
     * Listens for changes in Firebase Authentication state.
     */
    function initializeAuthListener() {
        console.log("initializeAuthListener: Setting up listener...");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("onAuthStateChanged: Auth state changed. Current User:", currentUser?.uid || 'None');
            if (currentUser) {
                if (user.value?.uid !== currentUser.uid) {
                    user.value = currentUser;
                }
                fetchUserInfo(currentUser.uid);
            } else {
                user.value = null;
                userInfo.value = null;
            }
            isLoading.value = false;
            console.log("onAuthStateChanged: isLoading set to false.");
        });
    }

    /**
     * Initializes the auth listener.
     */
    function tryRestoreAuthState() {
       if (user.value === undefined) {
           isLoading.value = true;
           initializeAuthListener();
       }
    }


    // --- Helper Function ---
    function getFriendlyErrorMessage(errorCode) {
        console.warn("Handling Auth Error Code:", errorCode);
        switch (errorCode) {
            case 'auth/invalid-email': return 'Invalid email address format.';
            case 'auth/user-disabled': return 'This user account has been disabled.';
            case 'auth/user-not-found': return 'No user found with this email.';
            case 'auth/wrong-password': return 'Incorrect password.';
            case 'auth/invalid-credential': return 'Invalid email or password.';
            case 'auth/email-already-in-use': return 'This email address is already registered.';
            case 'auth/weak-password': return 'Password is too weak (must be at least 6 characters).';
            case 'auth/too-many-requests': return 'Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.';
            default: return `An unknown authentication error occurred (${errorCode}).`;
        }
    }

    return {
        user, userInfo, isLoading, error, isAuthenticated,
        isSuperAdmin, isCompanyUser, isStoreManager, // Expose new role checks
        userId, userCompanyId, // Expose companyId
        login, logout, fetchUserInfo, initializeAuthListener, tryRestoreAuthState,
    };
});
