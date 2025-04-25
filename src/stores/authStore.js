// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue'; // Import watch
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
    const userInfo = ref(undefined);
    const isLoading = ref(true);
    const error = ref(null);

    // --- Getters (Computed Properties) ---
    const isAuthenticated = computed(() => !!user.value);
    const isAdmin = computed(() => userInfo.value?.role === 'SuperAdmin');
    const userId = computed(() => user.value?.uid || null);

    // --- Actions ---

    /**
     * Attempts to log in a user with email and password.
     * Performs ONLY the sign-in. Relies on listener and router guard for profile fetch and redirection.
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @param {object} router - The Vue Router instance (passed from component - needed for logout only now).
     */
    async function login(email, password, router) { // Keep router param for consistency if logout needs it
        isLoading.value = true;
        error.value = null;
        // No router check needed here anymore for login itself

        try {
            console.log(`Attempting login for ${email}...`);
            // 1. Sign in the user - this triggers onAuthStateChanged listener
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log(`signInWithEmailAndPassword successful for ${email}. Listener will handle profile fetch.`);

            // 2. *** NO fetchUserInfo call here ***
            // 3. *** NO watcher or timeout here ***
            // 4. *** NO redirection logic here ***
            // The router guard will handle redirection based on the state updated by the listener

            // Optionally clear previous errors on successful sign-in attempt
            // error.value = null; // Let listener's fetchUserInfo handle errors related to profile

        } catch (err) {
            console.error("Login Error (signInWithEmailAndPassword):", err);
            error.value = getFriendlyErrorMessage(err.code || 'unknown');
            // Clear user state immediately on sign-in failure
            user.value = null;
            userInfo.value = null;
        } finally {
            // Set loading false *after* sign-in attempt, even if listener is still running
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
                router.push('/login');
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
                userInfo.value = { id: userDocSnap.id, ...data };
            } else {
                console.warn(`fetchUserInfo (listener): User document not found for UID: ${uid}.`);
                userInfo.value = null; // Set to null if not found
            }
        } catch (err) {
            console.error("Fetch User Info Error (listener):", err);
            if (err.message === "User account is inactive.") {
                error.value = err.message; // Set global error for inactive
                console.log("fetchUserInfo (listener): Forcing logout due to inactive account.");
                signOut(auth).catch(signOutError => console.error("Error during forced sign out:", signOutError));
            } else {
                 console.error("fetchUserInfo (listener): Non-critical fetch error:", err.message);
                 userInfo.value = null; // Set to null on other fetch errors too
            }
            if (userInfo.value !== null) userInfo.value = null; // Ensure null on error
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
                fetchUserInfo(currentUser.uid); // Trigger fetch
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
        user, userInfo, isLoading, error, isAuthenticated, isAdmin, userId,
        login, logout, fetchUserInfo, initializeAuthListener, tryRestoreAuthState,
    };
});
