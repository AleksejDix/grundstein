<template>
  <RouterView></RouterView>
</template>

<style scoped>
nav {
  @apply py-4 bg-white;
}
.logo {
  font-size: 32px;
  line-height: 1;
  @apply uppercase font-light flex items-center;
}

.logo span {
  @apply font-black;
}

.router-link {
  @apply text-black;
}
</style>
