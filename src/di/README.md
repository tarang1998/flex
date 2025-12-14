# Dependency Injection (DI) Container

This folder contains the centralized **Dependency Injection** configuration for the entire application.

## Purpose

The DI container:

- ✅ Centralized dependency creation
- ✅ Manages object lifecycles (singleton pattern)
- ✅ Makes testing easier (can inject mocks)
- ✅ Decouples API routes from implementation details
- ✅ Single source of truth for configuration

## Structure

```
src/di/
├── Container.ts    # Main DI container implementation
└── index.ts        # Exports container function
```

## Usage in API Routes

### Before (Manual Dependency Creation) ❌

```typescript
// Every route had to manually create dependencies
const reviewRepository = new ReviewRepository();
const getReviewsUseCase = new GetReviewsUseCase(reviewRepository);
```

**Problems**:

- Repeated code
- Hard to change implementations
- Difficult to test
- Configuration scattered

### After (Dependency Injection) ✅

```typescript
import { container } from "@/di";

// One line - all dependencies wired automatically
const getReviewsUseCase = container().getGetReviewsUseCase();
```

**Benefits**:

- Single line of code
- Easy to swap implementations
- Testable (can inject mocks)
- Centralized configuration

## Available Methods

### Repositories

```typescript
// Get review repository (singleton)
const repo = container().getReviewRepository();
```

### Use Cases

```typescript
// Get reviews use case
const getReviews = container().getGetReviewsUseCase();

// Get stats use case
const getStats = container().getGetReviewStatsUseCase();

// Update approval use case
const updateApproval = container().getUpdateReviewApprovalUseCase();
```

### Infrastructure

```typescript
// Get Hostaway API client
const hostawayClient = container().getHostawayClient();
```

## Singleton Pattern

The container uses **singleton pattern** for repositories:

```typescript
// First call creates instance
const repo1 = container().getReviewRepository();

// Subsequent calls return same instance
const repo2 = container().getReviewRepository();

console.log(repo1 === repo2); // true - same object
```

This ensures:

- Consistent state across requests
- Memory efficiency
- Shared cache

## Testing with DI

### Mock Dependencies for Tests

```typescript
// Create a test container with mocked dependencies
class TestDIContainer extends DIContainer {
  getReviewRepository(): IReviewRepository {
    return {
      getAllReviews: jest.fn().mockResolvedValue(mockReviews),
      getFilteredReviews: jest.fn(),
      updateReviewApproval: jest.fn(),
      // ... other methods
    };
  }
}

// Use in tests
const testContainer = new TestDIContainer();
const useCase = testContainer.getGetReviewsUseCase();
```

### Reset Container Between Tests

```typescript
afterEach(() => {
  container().reset();
});
```

## Configuration

All environment-based configuration happens in the container:

```typescript
getHostawayClient(): HostawayClient {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID || '61148';
  const apiKey = process.env.HOSTAWAY_API_KEY || 'default_key';

  return new HostawayClient(accountId, apiKey);
}
```

This means:

- API routes don't access `process.env` directly
- Configuration is centralized
- Easy to change for different environments

## Adding New Dependencies

To add a new dependency:

1. **Add method to container**:

```typescript
// src/di/Container.ts
getMyNewService(): MyNewService {
  return new MyNewService(this.getReviewRepository());
}
```

2. **Use in API routes**:

```typescript
import { container } from "@/di";

const myService = container().getMyNewService();
```

## Example: Complete API Route

```typescript
// app/api/reviews/hostaway/route.ts
import { NextRequest, NextResponse } from "next/server";
import { container } from "@/di";

export async function GET(request: NextRequest) {
  try {
    // 1. Get use case from container (all dependencies injected)
    const getReviewsUseCase = container().getGetReviewsUseCase();

    // 2. Execute business logic
    const reviews = await getReviewsUseCase.execute();

    // 3. Return response
    return NextResponse.json({
      status: "success",
      data: reviews,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
```

**Clean, simple, testable!**

## Architecture Benefits

### Before DI:

```
API Route → new Repository() → new Client()
             ↓                    ↓
          Tightly coupled    Hard to test
```

### After DI:

```
API Route → Container → Repository → Client
             ↓           ↓            ↓
          Single      Singleton   Configured
          source      pattern      once
```

## Best Practices

✅ **DO**:

- Use container for all dependency creation
- Add configuration to container methods
- Keep container methods pure (no side effects)
- Document new dependencies

❌ **DON'T**:

- Create dependencies manually in routes
- Put business logic in container
- Access `process.env` outside container
- Share mutable state without singletons

---

**This DI implementation makes your architecture production-ready and easily testable!** 🎯
