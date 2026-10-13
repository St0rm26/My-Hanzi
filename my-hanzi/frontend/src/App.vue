<script setup lang="ts">
import { onMounted, ref } from "vue";
import CommonsButton from "./components/CommonsButton.vue";
import CommonsCallback from "./components/CommonsCallback.vue";
import Home from "./components/Home.vue";
import PasswordForm from "./components/PasswordForm.vue";
import SignIn from "./components/SignIn.vue";
import { useSession } from "./session.ts";

const { me, checked, load } = useSession();

const returningFromCommons = ref(
  window.location.pathname === "/auth/commons/callback",
);
onMounted(() => {
  if (!returningFromCommons.value) load();
});

function finishedCommons() {
  returningFromCommons.value = false;
  if (!checked.value) load();
}
</script>

<template>
  <main v-if="returningFromCommons" class="auth">
    <CommonsCallback @done="finishedCommons" />
  </main>
  <main v-else-if="checked && !me" class="auth">
    <SignIn lead="Hanzi collecting and sharing app.">
      <CommonsButton />
      <p class="divider">or with a password</p>
      <PasswordForm />
    </SignIn>
  </main>
  <Home v-else-if="me" />
</template>
