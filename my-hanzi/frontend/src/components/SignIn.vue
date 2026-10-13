<script setup lang="ts">
import { useSession } from "../session.ts";

/** A line under the title. Put the ways of signing in the app offers inside, such as `CommonsButton` and `PasswordForm`. */
defineProps<{ lead?: string }>();
const { error } = useSession();
</script>

<template>
  <section class="card form-card">
    <div>
      <h1>Sign in to MyHanzi</h1>
      <p v-if="lead" class="lead">{{ lead }}</p>
    </div>
    <p v-if="error" class="refusal" role="alert">{{ error }}</p>
    <slot />
  </section>
</template>

<style scoped>
.lead {
  margin-top: 6px;
  color: var(--color-text-muted);
}
</style>
