<script setup lang="ts">
import { ref } from "vue";

const collections = ref(["Studied"]);
const isCreating = ref(false);
const newCollectionName = ref("");
const message = ref("");

function openCreateForm() {
  isCreating.value = true;
  message.value = "";
}

function cancelCreate() {
  isCreating.value = false;
  newCollectionName.value = "";
  message.value = "";
}

function createCollection() {
  const name = newCollectionName.value.trim();
  if (!name) {
    message.value = "Enter a collection name.";
    return;
  }
  if (
    collections.value.some(
      (collection) => collection.toLowerCase() === name.toLowerCase(),
    )
  ) {
    message.value = "That collection already exists.";
    return;
  }

  collections.value.push(name);
  cancelCreate();
}
</script>

<template>
  <div class="home">
    <header class="navbar">
      <a class="brand" href="/">MyHanzi</a>
      <input type="search" placeholder="Search" aria-label="Search" />
    </header>

    <main>
      <section aria-labelledby="collections-heading">
        <div class="section-heading">
          <h1 id="collections-heading">Collections</h1>
          <button
            type="button"
            :aria-expanded="isCreating"
            @click="openCreateForm"
          >
            New collection
          </button>
        </div>

        <form v-if="isCreating" @submit.prevent="createCollection">
          <label for="collection-name">Collection name</label>
          <div class="create-controls">
            <input
              id="collection-name"
              v-model="newCollectionName"
              required
              maxlength="50"
            />
            <button type="submit">Create</button>
            <button type="button" @click="cancelCreate">Cancel</button>
          </div>
          <p role="status">{{ message }}</p>
        </form>

        <ul class="collection-list">
          <li v-for="collection in collections" :key="collection">
            <button type="button" class="collection-button">
              {{ collection }}
            </button>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(body) {
  background: #fff;
  color: #222;
  font-family: system-ui, sans-serif;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ccc;
}

.brand {
  color: inherit;
  font-weight: 600;
  text-decoration: none;
}

.navbar input {
  box-sizing: border-box;
  width: min(24rem, 65vw);
  padding: 0.45rem 0.6rem;
}

main {
  width: min(100% - 2rem, 48rem);
  margin: 2rem auto;
}

.section-heading,
.create-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-heading {
  justify-content: space-between;
}

form {
  margin-top: 1rem;
}

.create-controls {
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

.collection-list {
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.collection-list li {
  border-bottom: 1px solid #ddd;
}

.collection-button {
  width: 100%;
  padding: 0.75rem 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}

@media (max-width: 32rem) {
  .create-controls input {
    flex-basis: 100%;
  }
}
</style>
