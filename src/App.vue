<template>
  <header class="max-w-2xl mx-auto py-6">
    <div class="logo">
      <div class="grundstein"></div>
      Grundstein
    </div>
  </header>
  <nav>
    <div class="max-w-2xl mx-auto flex gap-4">
      <RouterLink class="router-link" to="/timevalue">time value</RouterLink>
      <RouterLink class="router-link" to="/mortgage">mortgage</RouterLink>
      <RouterLink class="router-link" to="/fields">fields</RouterLink>
    </div>
  </nav>
  <div class="max-w-2xl mx-auto">
    <div>
      <RouterView></RouterView>
    </div>
  </div>
</template>

<style scoped>
nav {
  @apply py-4 bg-white;
}
.logo {
  font-size: 32px;
  line-height: 1;
  @apply uppercase font-black  flex gap-2 items-center;
}

.router-link {
  @apply text-black;
}

.grundstein {
  width: 54px;
  height: 34px;
  border: 7px solid black;
  background-color: gold;
  position: relative;

  top: 1px;
}
</style>
