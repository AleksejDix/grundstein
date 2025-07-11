# Layout System Documentation

## Overview

The Grundstein application uses a comprehensive layout system that provides consistent, reusable layouts optimized for different use cases. The system follows a hierarchical approach with a base layout and specialized layouts for specific page types.

## Layout Architecture

```
BaseLayout (Navigation + Footer)
├── DefaultLayout (Standard pages)
├── CenteredLayout (Forms, articles)
├── FullWidthLayout (Tables, charts)
├── SidebarLayout (Documentation, settings)
├── DashboardLayout (Analytics, overviews)
├── FormLayout (Create/edit forms)
└── DetailLayout (Entity details)
```

## Available Layouts

### 1. BaseLayout

**Core layout with navigation and optional footer**

```vue
<BaseLayout :show-footer="true">
  <div>Your content here</div>
</BaseLayout>
```

**Use cases:**

- When you need full control over content structure
- Custom layout implementations
- Special page types

### 2. DefaultLayout

**Standard page layout with max-width container**

```vue
<DefaultLayout>
  <PageHeader title="Page Title" />
  <div>Your content here</div>
</DefaultLayout>
```

**Use cases:**

- Most standard pages
- List pages
- General content pages

### 3. CenteredLayout

**Narrower centered layout (max-width: 4xl)**

```vue
<CenteredLayout>
  <div class="text-center">
    <h1>Centered Content</h1>
    <p>Perfect for focused content</p>
  </div>
</CenteredLayout>
```

**Use cases:**

- Forms and wizards
- Articles and blog posts
- Authentication pages
- Focused content

### 4. FullWidthLayout

**Full-width layout with minimal padding**

```vue
<FullWidthLayout>
  <div class="bg-white rounded-lg shadow">
    <table>...</table>
  </div>
</FullWidthLayout>
```

**Use cases:**

- Data tables
- Charts and graphs
- Map interfaces
- Full-width components

### 5. SidebarLayout

**Two-column layout with sticky sidebar**

```vue
<SidebarLayout>
  <template #sidebar>
    <nav>
      <ul>
        <li><a href="#">Navigation</a></li>
        <li><a href="#">Items</a></li>
      </ul>
    </nav>
  </template>
  
  <div>
    <h1>Main Content</h1>
    <p>Content goes here</p>
  </div>
</SidebarLayout>
```

**Use cases:**

- Documentation pages
- Settings pages
- Filtered content
- Navigation-heavy pages

### 6. DashboardLayout

**Complex dashboard layout with multiple slots**

```vue
<DashboardLayout>
  <template #header>
    <PageHeader title="Dashboard" subtitle="Your overview" />
  </template>
  
  <template #metrics>
    <MetricCard label="Total" value="$1,234" />
    <MetricCard label="Growth" value="+12%" />
    <MetricCard label="Users" value="456" />
    <MetricCard label="Revenue" value="$789" />
  </template>
  
  <template #quickActions>
    <div class="bg-white rounded-lg p-6">
      <h3>Quick Actions</h3>
      <Button>Add New</Button>
    </div>
  </template>
  
  <template #primary>
    <div class="bg-white rounded-lg p-6">
      <h3>Primary Content</h3>
      <p>Main dashboard content</p>
    </div>
  </template>
  
  <template #secondary>
    <div class="bg-white rounded-lg p-6">
      <h3>Secondary Content</h3>
      <p>Additional information</p>
    </div>
  </template>
</DashboardLayout>
```

**Use cases:**

- Dashboard pages
- Analytics pages
- Overview pages
- Multi-section interfaces

### 7. FormLayout

**Optimized for forms with styled container**

```vue
<FormLayout>
  <template #header>
    <h1>Create New Portfolio</h1>
    <p>Fill out the form below</p>
  </template>
  
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <div>
        <label>Name</label>
        <input v-model="name" type="text" />
      </div>
      <!-- More form fields -->
    </div>
  </form>
  
  <template #footer>
    <div class="flex space-x-4">
      <Button variant="secondary">Cancel</Button>
      <Button type="submit">Create</Button>
    </div>
  </template>
</FormLayout>
```

**Use cases:**

- Create/edit forms
- Multi-step wizards
- Configuration pages
- Data entry forms

### 8. DetailLayout

**Optimized for showing detailed entity information**

```vue
<DetailLayout>
  <template #header>
    <PageHeader title="Portfolio Details">
      <template #actions>
        <Button>Edit</Button>
        <Button variant="danger">Delete</Button>
      </template>
    </PageHeader>
  </template>
  
  <template #metrics>
    <MetricCard label="Value" value="$1.2M" />
    <MetricCard label="Growth" value="+5.2%" />
    <MetricCard label="Properties" value="12" />
    <MetricCard label="Risk" value="Low" />
  </template>
  
  <template #primary>
    <div class="space-y-6">
      <div class="bg-white rounded-lg p-6">
        <h3>Overview</h3>
        <p>Detailed information about the entity</p>
      </div>
      
      <div class="bg-white rounded-lg p-6">
        <h3>Recent Activity</h3>
        <ul>...</ul>
      </div>
    </div>
  </template>
  
  <template #sidebar>
    <div class="bg-white rounded-lg p-6">
      <h3>Quick Info</h3>
      <dl>
        <dt>Created</dt>
        <dd>Jan 1, 2024</dd>
        <dt>Updated</dt>
        <dd>Jan 15, 2024</dd>
      </dl>
    </div>
    
    <div class="bg-white rounded-lg p-6">
      <h3>Actions</h3>
      <div class="space-y-2">
        <Button class="w-full">Export</Button>
        <Button class="w-full" variant="secondary">Share</Button>
      </div>
    </div>
  </template>
</DetailLayout>
```

**Use cases:**

- Entity detail pages
- Profile pages
- Product pages
- Information-heavy pages

## Layout Composable

Use the `useLayout` composable for responsive utilities and layout management:

```typescript
import { useLayout } from "@/composables/useLayout";

export default {
  setup() {
    const {
      isDesktop,
      isTablet,
      isMobile,
      isSidebarOpen,
      toggleSidebar,
      getContainerClasses,
      getGridClasses,
    } = useLayout();

    return {
      isDesktop,
      isTablet,
      isMobile,
      isSidebarOpen,
      toggleSidebar,
      containerClasses: getContainerClasses("centered"),
      gridClasses: getGridClasses(3, "md"),
    };
  },
};
```

## Layout Presets

Use predefined layout configurations:

```typescript
import { getLayoutConfig } from "@/composables/useLayout";

const config = getLayoutConfig("create"); // Returns FormLayout config
const dashboardConfig = getLayoutConfig("home"); // Returns DashboardLayout config
```

Available presets:

- `home` - Dashboard with footer
- `list` - Default layout for lists
- `create` - Form layout for creation
- `edit` - Form layout for editing
- `detail` - Detail layout for entities
- `docs` - Sidebar layout for documentation
- `settings` - Sidebar layout for settings
- `analytics` - Dashboard layout for analytics
- `table` - Full-width for tables
- `chart` - Full-width for charts
- `auth` - Centered narrow for authentication
- `article` - Centered for articles

## Best Practices

### 1. Choose the Right Layout

- Use `DefaultLayout` for most standard pages
- Use `FormLayout` for create/edit forms
- Use `DetailLayout` for entity details
- Use `DashboardLayout` for overview pages

### 2. Consistent Spacing

- Layouts provide consistent spacing automatically
- Use Tailwind spacing utilities within layouts
- Don't override layout container classes

### 3. Responsive Design

- All layouts are responsive by default
- Use the `useLayout` composable for responsive logic
- Test on different screen sizes

### 4. Slot Usage

- Use named slots for complex layouts
- Provide fallback content when appropriate
- Keep slot content focused and specific

### 5. Performance

- Layouts are lightweight and optimized
- Use dynamic imports for heavy content
- Avoid deeply nested layouts

## Migration Guide

### From Old PageLayout

```vue
<!-- Old -->
<PageLayout>
  <div>Content</div>
</PageLayout>

<!-- New -->
<DefaultLayout>
  <div>Content</div>
</DefaultLayout>
```

### From Custom Layouts

```vue
<!-- Old -->
<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
  <AppNavigation />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div>Content</div>
  </div>
</div>

<!-- New -->
<DefaultLayout>
  <div>Content</div>
</DefaultLayout>
```

### Import Pattern

```typescript
// Preferred: Named imports
import { DefaultLayout, FormLayout } from "@/layouts";

// Also available: Default imports
import DefaultLayout from "@/layouts/DefaultLayout.vue";
```

The layout system provides a solid foundation for building consistent, responsive, and maintainable user interfaces across the entire application.
