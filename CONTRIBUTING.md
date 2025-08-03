# Contributing to @flow-platform/node-core

We love your input! We want to make contributing to @flow-platform/node-core as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/flow-platform-node-core.git
cd flow-platform-node-core

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Testing

We use Jest for testing. Please write tests for any new functionality:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- data-filter.node.test.ts
```

## Code Style

We use ESLint and Prettier for code formatting. Make sure to run:

```bash
# Lint and fix code
npm run lint

# Format code with Prettier
npm run format
```

## Commit Messages

We follow conventional commit format:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc.
- `refactor:` code change that neither fixes a bug nor adds a feature
- `test:` adding tests
- `chore:` updating build tasks, package manager configs, etc.

Examples:
```
feat: add MongoDB aggregation pipeline support
fix: resolve memory leak in PostgreSQL connection pool
docs: update README with new examples
test: add integration tests for field mapper
```

## Issue Reporting

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Provide a clear description of the feature
3. Explain why this feature would be useful
4. Consider providing a basic implementation plan

## Node Development Guidelines

When creating new node types:

### 1. Follow the BaseNode Pattern

```typescript
export class MyCustomNode extends BaseNode<MyInput, MyOutput> {
  get inputSchema(): NodeDataSchema {
    // Define input schema
  }

  get outputSchema(): NodeDataSchema {
    // Define output schema
  }

  protected async executeInternal(
    input: MyInput,
    context: ExecutionContext
  ): Promise<MyOutput> {
    // Implementation
  }
}
```

### 2. Include Comprehensive Tests

```typescript
describe('MyCustomNode', () => {
  let node: MyCustomNode;
  let context: ExecutionContext;

  beforeEach(() => {
    node = new MyCustomNode(config);
    context = createTestExecutionContext();
  });

  describe('validation', () => {
    // Input validation tests
  });

  describe('execution', () => {
    // Execution logic tests
  });

  describe('error handling', () => {
    // Error case tests
  });
});
```

### 3. Add Documentation

- Update README.md with usage examples
- Add JSDoc comments to all public methods
- Include the node in the compatibility matrix
- Add performance benchmarks if applicable

### 4. Performance Considerations

- Use connection pooling for database operations
- Implement proper cleanup in `onDestroy()` if needed
- Consider memory usage for large datasets
- Add performance metrics tracking

## Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add more examples
- Improve API documentation
- Add tutorials or guides
- Translate documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md release notes
- GitHub contributors page

## Getting Help

- Create an issue for bugs or feature requests
- Join our Discord community for discussions
- Check existing documentation and examples
- Review closed issues for similar problems

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Thank you for contributing to @flow-platform/node-core! 🚀
