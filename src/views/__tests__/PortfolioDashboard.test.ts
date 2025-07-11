import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import PortfolioDashboard from "../PortfolioDashboard.view.vue";
import { portfolioApplicationService } from "../../application/services/PortfolioApplicationService";

// Mock the portfolio service
vi.mock("../../application/services/PortfolioApplicationService", () => ({
  portfolioApplicationService: {
    getAllPortfolios: vi.fn(),
    getPortfolioWithSummary: vi.fn(),
    createPortfolio: vi.fn(),
    deletePortfolio: vi.fn(),
  },
}));

const mockPortfolioService = portfolioApplicationService as any;

describe("PortfolioDashboard", () => {
  let router: any;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/", component: { template: "<div>Home</div>" } },
        { path: "/portfolio", component: PortfolioDashboard },
      ],
    });

    // Reset mocks
    vi.resetAllMocks();
  });

  it("should render loading state initially", async () => {
    // Mock the service to return a promise that doesn't resolve immediately
    mockPortfolioService.getAllPortfolios.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const wrapper = mount(PortfolioDashboard, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find(".animate-spin").exists()).toBe(true);
    expect(wrapper.text()).toContain("Portfolio Dashboard");
  });

  it("should render empty state when no portfolios exist", async () => {
    mockPortfolioService.getAllPortfolios.mockResolvedValue({
      success: true,
      data: [],
    });

    const wrapper = mount(PortfolioDashboard, {
      global: {
        plugins: [router],
      },
    });

    // Wait for async operations
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No portfolios");
    expect(wrapper.text()).toContain(
      "Get started by creating your first portfolio"
    );
  });

  it("should render error state when portfolio loading fails", async () => {
    mockPortfolioService.getAllPortfolios.mockResolvedValue({
      success: false,
      error: "Network error",
    });

    const wrapper = mount(PortfolioDashboard, {
      global: {
        plugins: [router],
      },
    });

    // Wait for async operations
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Error: Network error");
  });

  it("should show create portfolio modal when button is clicked", async () => {
    mockPortfolioService.getAllPortfolios.mockResolvedValue({
      success: true,
      data: [],
    });

    const wrapper = mount(PortfolioDashboard, {
      global: {
        plugins: [router],
      },
    });

    // Wait for component to load
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const createButton = wrapper.find("button").element;
    await createButton.click();

    expect(wrapper.text()).toContain("Create New Portfolio");
  });
});
