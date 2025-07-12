# Infrastructure Layer - External System Abstractions

This layer contains **abstractions for external systems** like databases, file systems, and APIs. It implements the **ports and adapters pattern** to keep the domain layer pure and independent.

## Architecture

```
src/core/infrastructure/
├── persistence/
│   └── PortfolioRepository.ts    # Portfolio data persistence
├── adapters/
│   └── (future external adapters)
└── index.ts                      # Infrastructure public API
```

## Design Principles

### 🔌 **Ports and Adapters (Hexagonal Architecture)**
- **Port interfaces** define what the domain needs
- **Adapter implementations** provide concrete integrations
- **Domain independence** - core logic unaware of infrastructure
- **Pluggable implementations** - easy to swap storage/APIs

### 🏗️ **Repository Pattern**
- **Abstract data access** through repository interfaces
- **Multiple implementations** (in-memory, localStorage, database)
- **Domain-centric API** - speaks in business terms
- **Result types** for explicit error handling

### 🔄 **Functional Infrastructure**
- **Pure functions** for data transformation
- **Immutable operations** - no side effect surprises
- **Composable adapters** - combine multiple backends
- **Type-safe configurations** - validated at compile time

## Core Modules

### `persistence/PortfolioRepository.ts` - Data Persistence

Abstracts portfolio data storage with multiple implementation options:

```typescript
import { 
  createInMemoryPortfolioRepository,
  createLocalStoragePortfolioRepository,
  type PortfolioRepository 
} from './infrastructure';

// Repository interface - domain contract
type PortfolioRepository = {
  save(portfolio: MortgagePortfolio): Promise<Result<void, RepositoryError>>;
  findById(id: PortfolioId): Promise<Result<MortgagePortfolio, RepositoryError>>;
  findAll(): Promise<Result<MortgagePortfolio[], RepositoryError>>;
  delete(id: PortfolioId): Promise<Result<void, RepositoryError>>;
};

// Choose implementation based on environment
const repository: PortfolioRepository = process.env.NODE_ENV === 'test'
  ? createInMemoryPortfolioRepository()
  : createLocalStoragePortfolioRepository();

// Domain code uses repository without knowing implementation
const savePortfolio = async (portfolio: MortgagePortfolio) => {
  const result = await repository.save(portfolio);
  if (result.success) {
    console.log('Portfolio saved successfully');
  } else {
    console.error('Failed to save:', result.error);
  }
};
```

#### **Repository Implementations**

##### In-Memory Repository (Testing)
```typescript
// Fast, isolated testing implementation
const inMemoryRepo = createInMemoryPortfolioRepository();

// Benefits:
// - No external dependencies
// - Instant operations
// - Clean state for each test
// - No cleanup required
```

##### LocalStorage Repository (Browser)
```typescript
// Persistent browser storage implementation  
const localStorageRepo = createLocalStoragePortfolioRepository();

// Features:
// - Automatic JSON serialization/deserialization
// - Portfolio versioning and migration
// - Storage quota management
// - Error recovery for corrupted data
```

##### Future Database Repository
```typescript
// Example of future database implementation
const databaseRepo = createDatabasePortfolioRepository({
  host: 'localhost',
  database: 'mortgages',
  // ... connection config
});

// Would support:
// - Transactional operations
// - Concurrent access
// - Complex queries
// - Backup and recovery
```

#### **Error Handling Strategy**

```typescript
type RepositoryError = 
  | 'NotFound'              // Portfolio doesn't exist
  | 'SerializationError'    // JSON parse/stringify failed
  | 'StorageError'          // Storage backend unavailable
  | 'InvalidData';          // Data doesn't match domain schema

// All repository operations return Result types
const loadPortfolio = async (id: PortfolioId) => {
  const result = await repository.findById(id);
  
  if (result.success) {
    // Portfolio loaded successfully
    return result.data;
  } else {
    // Handle specific error cases
    switch (result.error) {
      case 'NotFound':
        return showError('Portfolio not found');
      case 'StorageError':
        return showError('Unable to access storage');
      case 'SerializationError':
        return showError('Data corruption detected');
      case 'InvalidData':
        return showError('Portfolio data is invalid');
    }
  }
};
```

## Advanced Usage Patterns

### Repository Composition

```typescript
// Combine multiple repositories for different strategies
const createHybridRepository = (
  primary: PortfolioRepository,
  backup: PortfolioRepository
): PortfolioRepository => ({
  
  async save(portfolio: MortgagePortfolio) {
    // Try primary first
    const primaryResult = await primary.save(portfolio);
    if (primaryResult.success) {
      // Backup in background (fire and forget)
      backup.save(portfolio).catch(console.warn);
      return primaryResult;
    }
    
    // Fallback to backup
    return backup.save(portfolio);
  },
  
  async findById(id: PortfolioId) {
    // Try primary first
    const primaryResult = await primary.findById(id);
    if (primaryResult.success) {
      return primaryResult;
    }
    
    // Fallback to backup
    return backup.findById(id);
  },
  
  // ... other methods
});

// Usage
const hybridRepo = createHybridRepository(
  createLocalStoragePortfolioRepository(),
  createInMemoryPortfolioRepository()
);
```

### Repository Caching

```typescript
// Add caching layer to any repository
const createCachedRepository = (
  baseRepo: PortfolioRepository,
  cacheTimeMs: number = 60000  // 1 minute cache
): PortfolioRepository => {
  const cache = new Map<PortfolioId, { 
    portfolio: MortgagePortfolio; 
    timestamp: number; 
  }>();
  
  return {
    async save(portfolio: MortgagePortfolio) {
      const result = await baseRepo.save(portfolio);
      if (result.success) {
        // Update cache on successful save
        cache.set(portfolio.id, {
          portfolio,
          timestamp: Date.now()
        });
      }
      return result;
    },
    
    async findById(id: PortfolioId) {
      // Check cache first
      const cached = cache.get(id);
      if (cached && (Date.now() - cached.timestamp) < cacheTimeMs) {
        return Result.ok(cached.portfolio);
      }
      
      // Load from repository
      const result = await baseRepo.findById(id);
      if (result.success) {
        cache.set(id, {
          portfolio: result.data,
          timestamp: Date.now()
        });
      }
      return result;
    },
    
    // ... other methods
  };
};
```

### Repository Validation

```typescript
// Add domain validation to repository operations
const createValidatingRepository = (
  baseRepo: PortfolioRepository
): PortfolioRepository => ({
  
  async save(portfolio: MortgagePortfolio) {
    // Validate before saving
    const validation = validateMortgagePortfolio(portfolio);
    if (!validation.success) {
      return Result.error('InvalidData' as RepositoryError);
    }
    
    return baseRepo.save(portfolio);
  },
  
  async findById(id: PortfolioId) {
    const result = await baseRepo.findById(id);
    if (!result.success) return result;
    
    // Validate loaded data
    const validation = validateMortgagePortfolio(result.data);
    if (!validation.success) {
      return Result.error('InvalidData' as RepositoryError);
    }
    
    return result;
  },
  
  // ... other methods
});
```

## LocalStorage Implementation Details

### Data Serialization

```typescript
// Robust JSON serialization with type safety
const serializePortfolio = (portfolio: MortgagePortfolio): string => {
  try {
    // Convert domain objects to serializable format
    const serializable = {
      ...portfolio,
      createdAt: portfolio.createdAt.toISOString(),
      updatedAt: portfolio.updatedAt.toISOString(),
      mortgages: portfolio.mortgages.map(mortgage => ({
        ...mortgage,
        startDate: mortgage.startDate.toISOString(),
        // Preserve all domain type information
      }))
    };
    
    return JSON.stringify(serializable);
  } catch (error) {
    throw new Error('SerializationError');
  }
};

const deserializePortfolio = (json: string): MortgagePortfolio => {
  try {
    const data = JSON.parse(json);
    
    // Reconstruct domain objects with proper types
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      mortgages: data.mortgages.map(mortgage => ({
        ...mortgage,
        startDate: new Date(mortgage.startDate),
        // Rebuild all domain types
      }))
    } as MortgagePortfolio;
  } catch (error) {
    throw new Error('SerializationError');
  }
};
```

### Storage Management

```typescript
// Handle localStorage quotas and cleanup
const STORAGE_KEY_PREFIX = 'grundstein_portfolio_';
const MAX_PORTFOLIOS = 50;  // Prevent unlimited growth

const manageStorage = () => {
  try {
    // Check available space
    const used = new Blob([localStorage.getItem('') || '']).size;
    const quota = 5 * 1024 * 1024;  // 5MB typical quota
    
    if (used > quota * 0.8) {  // 80% full
      // Cleanup old portfolios
      cleanupOldPortfolios();
    }
  } catch (error) {
    // Handle quota exceeded
    throw new Error('StorageError');
  }
};

const cleanupOldPortfolios = () => {
  const keys = Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
    .sort();  // Sort by ID (time-based)
  
  // Remove oldest portfolios if over limit
  while (keys.length > MAX_PORTFOLIOS) {
    const oldestKey = keys.shift()!;
    localStorage.removeItem(oldestKey);
  }
};
```

## Testing Strategy

### Repository Testing

```typescript
// Test all implementations with same test suite
const testRepositoryImplementation = (
  createRepo: () => PortfolioRepository
) => {
  let repository: PortfolioRepository;
  
  beforeEach(() => {
    repository = createRepo();
  });
  
  test('saves and retrieves portfolio', async () => {
    const portfolio = createTestPortfolio();
    
    const saveResult = await repository.save(portfolio);
    expect(saveResult.success).toBe(true);
    
    const findResult = await repository.findById(portfolio.id);
    expect(findResult.success).toBe(true);
    expect(findResult.data).toEqual(portfolio);
  });
  
  test('returns NotFound for missing portfolio', async () => {
    const result = await repository.findById('missing_id');
    expect(result.success).toBe(false);
    expect(result.error).toBe('NotFound');
  });
  
  // ... more tests
};

// Run tests for all implementations
describe('InMemoryPortfolioRepository', () => {
  testRepositoryImplementation(() => createInMemoryPortfolioRepository());
});

describe('LocalStoragePortfolioRepository', () => {
  testRepositoryImplementation(() => createLocalStoragePortfolioRepository());
});
```

### Integration Testing

```typescript
// Test with real domain operations
test('portfolio lifecycle through repository', async () => {
  const repo = createInMemoryPortfolioRepository();
  
  // Create portfolio
  let portfolio = createMortgagePortfolio('test', 'Test Portfolio', 'Owner');
  await repo.save(portfolio.data);
  
  // Add mortgage
  const mortgage = createTestMortgage();
  portfolio = addMortgageToPortfolio(portfolio.data, mortgage);
  await repo.save(portfolio.data);
  
  // Verify persistence
  const loaded = await repo.findById(portfolio.data.id);
  expect(loaded.success).toBe(true);
  expect(loaded.data.mortgages).toHaveLength(1);
});
```

## Performance Considerations

### LocalStorage Optimization

- **Batch operations** - group multiple saves
- **Lazy loading** - only load portfolios when needed
- **Compression** - use LZ-string for large portfolios
- **Background cleanup** - remove expired cache entries

### Memory Management

- **Weak references** - for cached portfolios
- **Pool pattern** - reuse portfolio objects
- **Streaming** - for large portfolio lists
- **Garbage collection** - explicit cleanup on unmount

## Future Extensions

### Database Integration

```typescript
// Future database repository implementation
type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};

const createDatabasePortfolioRepository = (
  config: DatabaseConfig
): PortfolioRepository => {
  // Implementation would include:
  // - Connection pooling
  // - Transaction support
  // - Query optimization
  // - Migration handling
};
```

### External API Integration

```typescript
// Future external service integration
type ExternalApiConfig = {
  baseUrl: string;
  apiKey: string;
  timeout: number;
};

const createApiPortfolioRepository = (
  config: ExternalApiConfig
): PortfolioRepository => {
  // Implementation would include:
  // - HTTP client configuration
  // - Retry logic
  // - Rate limiting
  // - Authentication handling
};
```

## Dependencies

Infrastructure layer depends on:
- Domain layer interfaces and types
- **No external frameworks** in the core abstractions
- Implementation-specific dependencies (localStorage API, future database drivers)
- **No Vue or UI dependencies** - purely data layer

This keeps the infrastructure layer focused on data concerns while remaining framework-agnostic.