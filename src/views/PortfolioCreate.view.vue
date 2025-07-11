<template>
  <FormLayout>
    <template #header>
      <PageHeader
        title="Create New Portfolio"
        subtitle="Organize your mortgages into a professional portfolio"
      />
    </template>

    <form @submit.prevent="createPortfolio">
      <div class="space-y-6">
        <!-- Portfolio Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Name
          </label>
          <input
            v-model="portfolioForm.name"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Investment Properties"
            required
          />
        </div>

        <!-- Owner -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Owner
          </label>
          <input
            v-model="portfolioForm.owner"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            v-model="portfolioForm.description"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Describe your portfolio strategy or purpose..."
          />
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex space-x-4">
        <RouterLink
          :to="routes.portfolios.index()"
          class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </RouterLink>
        <Button
          type="submit"
          label="Create Portfolio"
          size="lg"
          class="flex-1"
          :loading="isCreating"
          loading-text="Creating..."
          @click="createPortfolio"
        />
      </div>
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { portfolioApplicationService } from "../application/services/PortfolioApplicationService";
import { routes } from "../router/routes";
import { FormLayout } from "../layouts";
import PageHeader from "../components/PageHeader.vue";
import Button from "../components/Button.vue";

const router = useRouter();

// Form state
const portfolioForm = ref({
  name: "",
  owner: "",
  description: "",
});

const isCreating = ref(false);

async function createPortfolio() {
  if (!portfolioForm.value.name.trim() || !portfolioForm.value.owner.trim()) {
    return;
  }

  isCreating.value = true;

  try {
    const result = await portfolioApplicationService.createPortfolio({
      name: portfolioForm.value.name.trim(),
      owner: portfolioForm.value.owner.trim(),
    });

    if (result.success) {
      // Redirect to the new portfolio
      router.push(routes.portfolios.show(result.data.id));
    } else {
      console.error("Failed to create portfolio:", result.error);
    }
  } catch (error) {
    console.error("Error creating portfolio:", error);
  } finally {
    isCreating.value = false;
  }
}
</script>
