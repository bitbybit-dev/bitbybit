# Bitbybit Unit Testing Guide

This guide covers unit testing best practices and conventions for the Bitbybit monorepo.

## Tech Stack

- **Language:** TypeScript
- **Test Framework:** Jest with ts-jest preset
- **Assertion Style:** Jest's built-in expect assertions

## Package Structure

Each folder under `packages/dev/` is an **independent npm package** with its own:
- `package.json` with dependencies and test scripts
- Jest configuration
- Coverage report (generated in package directory when running `npm run test-c`)

```
packages/dev/
├── base/           ← @bitbybit-dev/base
├── babylonjs/      ← @bitbybit-dev/babylonjs
├── threejs/        ← @bitbybit-dev/threejs
├── playcanvas/     ← @bitbybit-dev/playcanvas
├── occt/           ← @bitbybit-dev/occt
├── occt-worker/    ← @bitbybit-dev/occt-worker
├── jscad/          ← @bitbybit-dev/jscad
├── jscad-worker/   ← @bitbybit-dev/jscad-worker
├── manifold/       ← @bitbybit-dev/manifold
├── manifold-worker/← @bitbybit-dev/manifold-worker
└── core/           ← @bitbybit-dev/core
```

Navigate to a specific package to run tests or view coverage for that package.

## File Naming & Location

- **Naming convention:** `<file-name-that-is-tested>.test.ts`
- **Location:** Test files are placed **next to the file being tested**, not in a separate test directory.

```
lib/api/
├── bitbybit-base.ts
├── bitbybit-base.test.ts    ← test file adjacent to source
├── context.ts
├── context.test.ts          ← test file adjacent to source
└── draw-helper.ts
└── draw-helper.test.ts      ← test file adjacent to source
```

## Mock Organization

Reusable mocks are placed in the `__mocks__` folder at the highest level of the source code directory:

```
lib/api/
├── __mocks__/
│   ├── babylonjs.mock.ts     ← reusable BabylonJS mocks
│   └── test-helpers.ts       ← factory functions for test setup
├── bitbybit-base.ts
└── bitbybit-base.test.ts
```

### Mock Usage Pattern

```typescript
jest.mock("@babylonjs/core", () => {
    const { createBabylonJSMock } = jest.requireActual("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});
```

## Running Tests

| Command | Description |
|---------|-------------|
| `npm run test` | Run all package tests |
| `npm run test-base` | Test base package |
| `npm run test-occt` | Test OCCT package |
| `npm run test-core` | Test core package |
| `npm run test-jscad` | Test JSCAD package |
| `npm run test-manifold` | Test Manifold package |
| `npm run test-threejs` | Test ThreeJS package |
| `npm run test-playcavnas` | Test PlayCanvas package |

Within individual packages:
- `npm run test` - Watch mode
- `npm run test-c` - Coverage mode (CI)
- `npm run test-c-l` - Coverage with watch mode

## AAA Pattern (Arrange-Act-Assert)

Structure every test using the AAA pattern:

```typescript
it("should calculate distance between two points", () => {
    // Arrange - set up test data
    const startPoint = [0, 0, 0];
    const endPoint = [3, 4, 0];

    // Act - execute the code under test
    const result = bitByBit.point.distance({ startPoint, endPoint });

    // Assert - verify expected outcome
    expect(result).toBeCloseTo(5, 5);
});
```

## TypeScript Best Practices

### Avoid `as any`

Minimize use of `as any` type assertions. Instead:

1. **Create properly typed mocks** in the `__mocks__` folder
2. **Use `as unknown as Type`** when casting is necessary (two-step cast is more explicit)
3. **Define mock interfaces** that match the expected type contract

```typescript
// ❌ Avoid
const mockScene = {} as any;

// ✅ Prefer typed mock
const mockScene = new MockScene() as unknown as BABYLON.Scene;

// ✅ Or create a proper mock class
export class MockScene {
    meshes: MockMesh[] = [];
    getMeshByName(name: string) { /* ... */ }
}
```

## Assertion Best Practices

### Test Specific Results, Not Generic Outcomes

```typescript
// ❌ Avoid vague assertions
expect(result).toBeDefined();
expect(result.length).toBeGreaterThan(0);
expect(result).toBeTruthy();

// ✅ Test specific expected values
expect(result).toEqual([5, 7, 9]);
expect(result.length).toBe(3);
expect(result).toEqual({ r: 255, g: 0, b: 0 });
```

### Use Appropriate Matchers

```typescript
// For floating point comparisons
expect(result).toBeCloseTo(3.14, 2);

// For object structure
expect(result).toEqual({ start: [0, 0, 0], end: [1, 1, 1] });

// For arrays
expect(result).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);

// For instance checks
expect(bitByBit).toBeInstanceOf(BitByBitBase);

// For function behavior
expect(() => fn()).not.toThrow();
expect(() => fn()).toThrow(ExpectedError);
```

## Include Failure Scenarios

Every test suite should include tests for failure cases and edge conditions:

```typescript
describe("error handling", () => {
    it("should throw error when input is undefined", () => {
        expect(() => service.process(undefined)).toThrow();
    });

    it("should throw error with specific message for invalid input", () => {
        expect(() => service.validate(-1)).toThrow("Value must be positive");
    });

    it("should handle empty array gracefully", () => {
        const result = service.processArray([]);
        expect(result).toEqual([]);
    });

    it("should handle null values", () => {
        expect(() => service.compute(null)).toThrow();
    });
});
```

## Test Structure

### Describe Block Organization

```typescript
describe("ServiceName unit tests", () => {
    let service: ServiceName;

    beforeEach(() => {
        service = new ServiceName();
    });

    describe("Constructor initialization", () => {
        it("should create instance", () => { /* ... */ });
    });

    describe("methodName", () => {
        it("should return expected result for valid input", () => { /* ... */ });
        it("should throw for invalid input", () => { /* ... */ });
        it("should handle edge case", () => { /* ... */ });
    });

    describe("Integration with dependencies", () => {
        it("should work with dependency service", () => { /* ... */ });
    });
});
```

### Test Independence

Each test should be independent and not rely on state from other tests:

```typescript
// ✅ Use beforeEach to reset state
beforeEach(() => {
    bitByBit = new BitByBitBase();
});
```

## Mock Factory Functions

Create helper functions for common test setups in `test-helpers.ts`:

```typescript
export function createMockContext(): Context {
    const mockScene = new MockScene();
    return {
        scene: mockScene as unknown as BABYLON.Scene,
        engine: null,
        havokPlugin: null,
    } as unknown as Context;
}

export function createMockWorkerManagers() {
    return {
        mockJscadWorkerManager: { /* ... */ } as unknown as JSCADWorkerManager,
        mockManifoldWorkerManager: { /* ... */ } as unknown as ManifoldWorkerManager,
        mockOccWorkerManager: { /* ... */ } as unknown as OCCTWorkerManager
    };
}
```

## Summary Checklist

- [ ] Test file placed next to source file
- [ ] File named `<source-file>.test.ts`
- [ ] Reusable mocks in `__mocks__` folder
- [ ] AAA pattern followed (Arrange-Act-Assert)
- [ ] Specific assertions used (not `toBeDefined`, `toBeGreaterThan(0)`)
- [ ] Failure scenarios included
- [ ] `as any` avoided (use typed mocks or `as unknown as Type`)
- [ ] Each test is independent
- [ ] Descriptive test names that explain expected behavior

## General Unit Testing Best Practices

### Test One Thing Per Test

Each test should verify a single behavior. If a test fails, it should be immediately clear what broke.

```typescript
// ❌ Testing multiple behaviors
it("should create and validate user", () => {
    const user = service.create({ name: "John" });
    expect(user.id).toBeDefined();
    expect(service.validate(user)).toBe(true);
    expect(service.save(user)).resolves.toBe(true);
});

// ✅ Separate tests for each behavior
it("should create user with generated id", () => { /* ... */ });
it("should validate user successfully", () => { /* ... */ });
it("should save user to database", () => { /* ... */ });
```

### Descriptive Test Names

Test names should describe the expected behavior, not the implementation:

```typescript
// ❌ Implementation-focused names
it("calls calculateDistance", () => { /* ... */ });
it("returns number", () => { /* ... */ });

// ✅ Behavior-focused names
it("should return distance of 5 for 3-4-5 triangle", () => { /* ... */ });
it("should throw when start point is undefined", () => { /* ... */ });
```

### Avoid Logic in Tests

Tests should be straightforward without conditionals, loops, or complex logic:

```typescript
// ❌ Logic in test
it("should process items", () => {
    const items = [1, 2, 3];
    let sum = 0;
    for (const item of items) {
        sum += service.process(item);
    }
    expect(sum).toBe(6);
});

// ✅ Direct assertion
it("should process items and return sum", () => {
    const result = service.processAll([1, 2, 3]);
    expect(result).toBe(6);
});
```

### Test Boundary Conditions

Always test edge cases and boundaries:

- Empty inputs (empty arrays, empty strings)
- Null/undefined values
- Zero values
- Negative numbers
- Maximum/minimum values
- Single element collections

```typescript
describe("boundary conditions", () => {
    it("should handle empty array", () => { /* ... */ });
    it("should handle single element", () => { /* ... */ });
    it("should handle maximum value", () => { /* ... */ });
    it("should handle negative input", () => { /* ... */ });
});
```

### Keep Tests Fast

Unit tests should execute quickly:

- Mock external dependencies (APIs, databases, file system)
- Avoid real network calls
- Use minimal test data
- Avoid unnecessary `setTimeout` or delays

### Don't Test Implementation Details

Test the public interface, not private methods or internal state:

```typescript
// ❌ Testing internal implementation
it("should set internal cache", () => {
    service.getData();
    expect(service["_cache"]).toBeDefined();
});

// ✅ Testing observable behavior
it("should return cached data on second call", () => {
    const first = service.getData();
    const second = service.getData();
    expect(second).toBe(first);
});
```

### Use Test Fixtures Wisely

For complex test data, create reusable fixtures:

```typescript
// In test-helpers.ts or fixtures.ts
export const validUserData = {
    name: "Test User",
    email: "test@example.com",
    age: 25
};

export const invalidUserData = {
    name: "",
    email: "invalid",
    age: -1
};
```

### Prefer Strict Equality

Use strict matchers when possible:

```typescript
// ❌ Loose matching
expect(result == 5).toBe(true);

// ✅ Strict matching
expect(result).toBe(5);
expect(result).toStrictEqual({ a: 1, b: 2 });
```

### Reset State Between Tests

Ensure clean state for each test:

```typescript
describe("StatefulService", () => {
    let service: StatefulService;

    beforeEach(() => {
        service = new StatefulService();
        jest.clearAllMocks();
    });

    afterEach(() => {
        service.cleanup();
    });
});
```

### Avoid Test Interdependence

Tests should pass regardless of execution order. Never rely on:

- State from previous tests
- Specific test execution order
- Shared mutable data between tests
