# Bitbybit Unit Testing Guide

This guide covers unit testing best practices and conventions for the Bitbybit monorepo.

## Additional Resources

For more information about our unit testing philosophy and live coverage reports, visit:
- [Unit Testing Approach](https://learn.bitbybit.dev/learn/github/unit-tests) - Learn about our pragmatic approach to testing 3D algorithms
- [The report every CI run publishes](https://github.com/bitbybit-dev/bitbybit/actions/workflows/verify.yml) - every suite's tests and coverage, and what each moved against its floor

## Tech Stack

- **Language:** TypeScript
- **Test Framework:** Vitest
- **Assertion Style:** Vitest's built-in expect assertions
- **Imports:** every test API is imported explicitly - `import { describe, it, expect, vi } from "vitest"` - so nothing a test uses is invisible

## Package Structure

Each folder under `packages/dev/` is an **independent npm package** with its own:
- `package.json` with dependencies and test scripts
- a `vitest.config.ts` that calls the shared factory in `packages/dev/vitest.shared.ts` and states
  only what differs: the coverage globs, and where needed a jsdom environment, a process per file,
  or a module to stand in for another
- Coverage report (generated in the package directory when running `npm run test:coverage`)

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
vi.mock("@babylonjs/core", async () => {
    const { createBabylonJSMock } = await vi.importActual("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});
```

`vi.mock` is hoisted above the imports, so its factory may not close over anything declared in the
file; reach for the mock module inside the factory, as above. `vi.importActual` is asynchronous,
which is why the factory is `async`.

A mock the code under test reaches through `new` must be a **function**, never an arrow: only a
function can be constructed, and one that returns an object hands that object back to `new`.

```typescript
MeshInstance: vi.fn(function (mesh, material, node = mockNode) {
    return { mesh, material, node };
}),
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
- `npm run test` - one run
- `npm run test:coverage` - one run with coverage (what CI runs)
- `npm run test:watch` - re-run as you edit

Coverage is a floor, not a report: `packages/dev/coverage-baseline.json` records what each suite
reaches, and `npm run check:coverage-baseline` at the root fails a run that reaches less or that
lost tests. Raise the floor with `npm run coverage-baseline:save` when a suite genuinely improves.

## AAA Pattern (Arrange-Act-Assert)

Structure every test using the AAA pattern:

```typescript
it("should calculate distance between two points", () => {
    // Arrange
    const startPoint = [0, 0, 0];
    const endPoint = [3, 4, 0];

    // Act
    const result = bitByBit.point.distance({ startPoint, endPoint });

    // Assert
    expect(result).toBeCloseTo(5, 5);
});
```

### The three markers are the only comments a test may carry

`bitbybit/no-loose-comments` runs over every `*.test.ts`, and it allows exactly `// Arrange`,
`// Act`, `// Assert` and `// Act & Assert` - the marker on its own, with nothing after it. Every
other comment in a test file is an error, and there is no fixer, so the rule never rewrites your file.

The markers are structure rather than description: they say which part of the test a line belongs to,
and a marker cannot drift from the code because it makes no claim about it. A sentence explaining
*why* can drift, and in a test it has somewhere better to go:

| What you wanted to write in a comment | Where it goes instead |
| --- | --- |
| what this test proves | the name of the `it` |
| what this group of tests is about | the name of the `describe` |
| why this input, and not another | the name of the value: `const unevenlySpacedCorners = ...` |
| what this arrangement is | a named helper: `const documentOfOneBox = () => ...` |
| what a magic number means | a named constant: `const FULL_TURN_DEGREES = 360;` |
| a caveat the code cannot express | the `it` name, as behaviour: `"should ... , because a turn is baked into the geometry"` |

```typescript
// Wrong - the note is a second description, and the name says nothing
it("should subdivide", () => {
    // a face longer than it is wide, so the two sides differ
    const f = face.createRectangleFace({ width: 20, length: 5, center: [0, 0, 0], direction: [0, 0, 1] });
    ...
});

// Right - the name carries the claim, the value carries the reason
it("should round the rectangles by the shorter of their two sides", () => {
    // Arrange
    const longerThanItIsWide = face.createRectangleFace({ width: 20, length: 5, center: [0, 0, 0], direction: [0, 0, 1] });
    ...
});
```

## TypeScript Best Practices

### Avoid `as any`, and avoid `as unknown as T`

Both discard what the compiler knew. `as any` says nothing is checked; `as unknown as T` widens
until nothing is left to check and then declares a type, so the declared type can be wrong in every
way and the build stays green. The lint rule `bitbybit/no-double-assertion` fails a double assertion
wherever it appears, tests included, so reach for one of these instead:

1. **A mock class that satisfies the contract**, so no assertion is needed at all. Extending the
   stand-in a package already ships is usually the shortest route: `class RecordingWorker extends
   JSCADWorkerMock`, or `class RecordingWorker extends EventTarget implements Worker` where a whole
   `Worker` is what the method declares.
2. **A single `as` from a value declared opaque.** `unknown` converts to anything in one step, which
   is honest about what the test is doing: `const SENTINEL: unknown = { ... }` and then
   `SENTINEL as T` at the point of use.
3. **`Partial<T> as T`** for a mock that carries only the members the code under test reaches.
4. **A helper in `__mocks__` that reads an engine-typed handle as the stand-in it actually is**, so
   the one assertion lives beside the mock rather than in every suite.

```typescript
// ❌ Avoid - nothing is checked
const mockScene = {} as any;

// ❌ Avoid - the assertion is unfalsifiable, and lint fails it
const mockScene = new MockScene() as unknown as BABYLON.Scene;

// ✅ A mock class that satisfies the contract, asserted once from Partial
const mockScene: Partial<BABYLON.Scene> = { meshes: [] };
const scene = mockScene as BABYLON.Scene;

// ✅ Or, where the engine can run headless, no stand-in at all
const engine = new BABYLON.NullEngine();
const scene = new BABYLON.Scene(engine);
```

### Prefer the real thing to a stand-in

Where a library can run outside a browser, run it. BabylonJS ships `NullEngine` for exactly this, the
OCCT, JSCAD and Manifold kernels load under the test runner, and verb is plain JavaScript. A suite
over the real library asserts what the library ends up holding, which is what a user gets; a suite
over a mock asserts which call was made, which is only what the code says it does. Stand something in
when the real one cannot reach the case at all - a kernel that throws a string, a transport that
refuses a message - and say so in the file.

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
- [ ] No comment in the file except those three markers, each on its own
- [ ] Specific assertions used (not `toBeDefined`, `toBeGreaterThan(0)`)
- [ ] Failure scenarios included
- [ ] `as any` avoided, and `as unknown as T` too - `bitbybit/no-double-assertion` bans both
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
        vi.clearAllMocks();
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
