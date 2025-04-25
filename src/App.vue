<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

onMounted(() => {
  authStore.tryRestoreAuthState();
});
</script>

<template>
  <RouterView />
</template>