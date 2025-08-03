# flow-platform-node-core

🚀 **Core library for Flow Platform** - A powerful TypeScript library for building distributed data processing workflows with type safety and microservices architecture.

[![npm version](https://badge.fury.io/js/flow-platform-node-core.svg)](https://badge.fury.io/js/flow-platform-node-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## 🌟 Features

- **🔒 Type-Safe Architecture**: Complete TypeScript support with strict type checking
- **🧩 Extensible Node System**: Create custom data processing nodes with ease  
- **🔗 Smart Compatibility**: Automatic validation of node connections and data flow
- **📊 Built-in Processors**: PostgreSQL, MongoDB, Data Filter, Field Mapper nodes
- **⚡ High Performance**: Optimized for distributed processing and scalability
- **📈 Monitoring Ready**: Built-in metrics, logging, and performance tracking
- **🛡️ Enterprise Grade**: Comprehensive error handling and validation
- **🧪 Test Coverage**: 100% test coverage with Jest and comprehensive examples

## 📦 Installation

```bash
# Using npm
npm install flow-platform-node-core

# Using yarn
yarn add flow-platform-node-core

# Using pnpm
pnpm add flow-platform-node-core
```

## 🚀 Quick Start

### Creating Your First Node

```typescript
import { 
  BaseNode, 
  NodeConfiguration, 
  NodeDataSchema,
  ExecutionContext,
  ExecutionResult 
} from '@flow-platform/node-core';

// Define your data types
interface TextProcessorInput {
  text: string;
  operation: 'uppercase' | 'lowercase' | 'reverse';
}

interface TextProcessorOutput {
  processedText: string;
  originalLength: number;
  processedLength: number;
}

// Create your custom node
class TextProcessorNode extends BaseNode<TextProcessorInput, TextProcessorOutput> {
  get inputSchema(): NodeDataSchema {
    return {
      text: { 
        type: 'string', 
        required: true, 
        description: 'Text to process' 
      },
      operation: { 
        type: 'string', 
        required: true, 
        enum: ['uppercase', 'lowercase', 'reverse'],
        description: 'Operation to perform' 
      }
    };
  }

  get outputSchema(): NodeDataSchema {
    return {
      processedText: { 
        type: 'string', 
        required: true, 
        description: 'Processed text result' 
      },
      originalLength: { 
        type: 'number', 
        required: true, 
        description: 'Length of original text' 
      },
      processedLength: { 
        type: 'number', 
        required: true, 
        description: 'Length of processed text' 
      }
    };
  }

  protected async executeInternal(
    input: TextProcessorInput,
    context: ExecutionContext
  ): Promise<TextProcessorOutput> {
    context.logger.info(`Processing text with operation: ${input.operation}`);
    
    let processedText: string;
    
    switch (input.operation) {
      case 'uppercase':
        processedText = input.text.toUpperCase();
        break;
      case 'lowercase':
        processedText = input.text.toLowerCase();
        break;
      case 'reverse':
        processedText = input.text.split('').reverse().join('');
        break;
      default:
        throw new Error(`Unsupported operation: ${input.operation}`);
    }

    return {
      processedText,
      originalLength: input.text.length,
      processedLength: processedText.length
    };
  }
}

// Usage
const config: NodeConfiguration = {
  id: 'text-processor-1',
  name: 'Text Processor',
  type: 'text-processor',
  version: '1.0.0'
};

const textNode = new TextProcessorNode(config);
```

## 🧩 Built-in Nodes

### 🗄️ PostgreSQL Query Node

Execute SQL queries with full parameter support and connection pooling:

```typescript
import { 
  PostgreSQLQueryNode, 
  createExecutionContext 
} from '@flow-platform/node-core';

const pgNode = new PostgreSQLQueryNode({
  id: 'user-query',
  name: 'User Data Query',
  type: 'postgresql-query',
  version: '1.0.0'
});

const input = {
  connectionString: 'postgresql://user:password@localhost:5432/mydb',
  query: `
    SELECT id, name, email, created_at 
    FROM users 
    WHERE department = $1 AND active = $2
    ORDER BY created_at DESC
    LIMIT $3
  `,
  parameters: ['Engineering', true, 50]
};

const context = createExecutionContext('user-query-exec');
const result = await pgNode.execute(input, context);

console.log(`Found ${result.data.rowCount} users`);
console.log('Users:', result.data.result);
```

### 🍃 MongoDB Operations Node

Perform MongoDB operations with full aggregation pipeline support:

```typescript
import { MongoDBOperationsNode } from '@flow-platform/node-core';

const mongoNode = new MongoDBOperationsNode({
  id: 'mongo-aggregation',
  name: 'User Analytics',
  type: 'mongodb-operations',
  version: '1.0.0'
});

const input = {
  connectionString: 'mongodb://localhost:27017/analytics',
  database: 'analytics',
  collection: 'users',
  operation: 'aggregate',
  pipeline: [
    { $match: { status: 'active' } },
    { $group: { 
        _id: '$department', 
        count: { $sum: 1 },
        avgAge: { $avg: '$age' }
      }
    },
    { $sort: { count: -1 } }
  ]
};

const result = await mongoNode.execute(input, context);
console.log('Department analytics:', result.data.result);
```

### 🔍 Data Filter Node

Filter arrays of data with complex conditions:

```typescript
import { DataFilterNode } from '@flow-platform/node-core';

const filterNode = new DataFilterNode({
  id: 'employee-filter',
  name: 'Senior Employees Filter',
  type: 'data-filter',
  version: '1.0.0'
});

const input = {
  data: [
    { id: 1, name: 'Alice', age: 28, salary: 75000, department: 'Engineering' },
    { id: 2, name: 'Bob', age: 35, salary: 85000, department: 'Engineering' },
    { id: 3, name: 'Charlie', age: 42, salary: 95000, department: 'Marketing' }
  ],
  conditions: [
    { field: 'age', operator: 'greater_than', value: 30 },
    { field: 'salary', operator: 'greater_than', value: 80000 }
  ],
  logicalOperator: 'AND'
};

const result = await filterNode.execute(input, context);
console.log(`Filtered ${result.data.filtered_count} senior employees`);
```

### 🔄 Field Mapper Node

Transform and map data structures with powerful transformations:

```typescript
import { FieldMapperNode } from '@flow-platform/node-core';

const mapperNode = new FieldMapperNode({
  id: 'user-mapper',
  name: 'User Data Mapper',
  type: 'field-mapper',
  version: '1.0.0'
});

const input = {
  source: [
    { 
      first_name: 'John', 
      last_name: 'Doe', 
      birth_year: 1990,
      salary_usd: 75000 
    }
  ],
  mapping: [
    {
      sourceField: 'first_name',
      targetField: 'firstName',
      transformation: 'rename'
    },
    {
      sourceField: 'last_name', 
      targetField: 'lastName',
      transformation: 'rename'
    },
    {
      sourceField: 'birth_year',
      targetField: 'age',
      transformation: 'custom',
      transformFunction: 'currentYear - value'
    },
    {
      sourceField: 'salary_usd',
      targetField: 'salaryFormatted',
      transformation: 'custom',
      transformFunction: '"$" + value.toLocaleString()'
    }
  ]
};

const result = await mapperNode.execute(input, context);
console.log('Mapped data:', result.data.mapped);
```

## 🔧 Advanced Usage

### Creating Complex Workflows

```typescript
import { 
  NodeRegistry, 
  WorkflowExecutor,
  createExecutionContext 
} from '@flow-platform/node-core';

// Register your custom nodes
const registry = new NodeRegistry();
registry.registerNode('text-processor', TextProcessorNode);
registry.registerNode('postgresql-query', PostgreSQLQueryNode);
registry.registerNode('data-filter', DataFilterNode);

// Create a workflow
const workflow = {
  id: 'data-processing-workflow',
  name: 'Customer Data Processing',
  nodes: [
    {
      id: 'fetch-customers',
      type: 'postgresql-query',
      config: {
        connectionString: process.env.DATABASE_URL,
        query: 'SELECT * FROM customers WHERE status = $1',
        parameters: ['active']
      }
    },
    {
      id: 'filter-premium',
      type: 'data-filter',
      config: {
        conditions: [
          { field: 'subscription_type', operator: 'equals', value: 'premium' }
        ]
      }
    },
    {
      id: 'process-names',
      type: 'text-processor',
      config: {
        operation: 'uppercase'
      }
    }
  ],
  connections: [
    { from: 'fetch-customers', to: 'filter-premium' },
    { from: 'filter-premium', to: 'process-names' }
  ]
};

// Execute workflow
const executor = new WorkflowExecutor(registry);
const context = createExecutionContext('workflow-exec-001');
const result = await executor.execute(workflow, context);
```

### Real-time Messaging with RabbitMQ

```typescript
import { 
  RabbitMQClient, 
  FlowExecutionMessage,
  MessageHandler 
} from '@flow-platform/node-core';

// Create RabbitMQ client
const rabbitClient = new RabbitMQClient({
  url: 'amqp://localhost:5672',
  exchange: 'flow-processing',
  queues: {
    execution: 'flow.execution',
    results: 'flow.results',
    errors: 'flow.errors'
  }
});

// Message handler
const messageHandler: MessageHandler<FlowExecutionMessage> = async (message) => {
  console.log('Received execution request:', message);
  
  // Process the flow
  const result = await processFlow(message.flowDefinition, message.inputData);
  
  // Send result back
  await rabbitClient.publish('flow.results', {
    executionId: message.executionId,
    result,
    timestamp: new Date()
  });
};

// Subscribe to execution queue
await rabbitClient.subscribe('flow.execution', messageHandler);
```

## 🧪 Testing

### Unit Testing Nodes

```typescript
import { createTestExecutionContext } from '@flow-platform/node-core/testing';

describe('TextProcessorNode', () => {
  let node: TextProcessorNode;
  let context: ExecutionContext;

  beforeEach(() => {
    node = new TextProcessorNode({
      id: 'test-node',
      name: 'Test Text Processor',
      type: 'text-processor',
      version: '1.0.0'
    });
    
    context = createTestExecutionContext();
  });

  it('should uppercase text correctly', async () => {
    const input = {
      text: 'hello world',
      operation: 'uppercase' as const
    };

    const result = await node.execute(input, context);

    expect(result.success).toBe(true);
    expect(result.data?.processedText).toBe('HELLO WORLD');
    expect(result.data?.originalLength).toBe(11);
    expect(result.data?.processedLength).toBe(11);
  });

  it('should handle invalid operation', async () => {
    const input = {
      text: 'hello world',
      operation: 'invalid' as any
    };

    const result = await node.execute(input, context);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('EXECUTION_ERROR');
  });
});
```

## 🏗️ Architecture

### Node Lifecycle

```mermaid
graph TD
    A[Node Created] --> B[Validate Configuration]
    B --> C[Initialize Dependencies]
    C --> D[Ready for Execution]
    D --> E[Execute Input Validation]
    E --> F[Execute Internal Logic]
    F --> G[Execute Output Validation]
    G --> H[Return Results]
    H --> I[Update Metrics]
    I --> D
```

### Type System

The library uses a comprehensive type system to ensure data safety:

```typescript
// Core interfaces
interface NodeDataSchema {
  [field: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    description?: string;
    enum?: string[];
    format?: string;
    minimum?: number;
    maximum?: number;
  };
}

interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    executionTime: number;
    memoryUsage: number;
    nodeId: string;
    timestamp: Date;
  };
}
```

## 📊 API Reference

### Core Classes

#### BaseNode<TInput, TOutput>
The abstract base class for all nodes.

**Methods:**
- `execute(input: TInput, context: ExecutionContext): Promise<ExecutionResult<TOutput>>`
- `validate(input: TInput): Promise<ValidationResult>`
- `getCapabilities(): NodeCapabilities`

#### NodeRegistry
Registry for managing node types and instances.

**Methods:**
- `registerNode(type: string, nodeClass: typeof BaseNode): void`
- `createNode(type: string, config: NodeConfiguration): BaseNode`
- `getRegisteredTypes(): string[]`

#### WorkflowExecutor
Executes complete workflows with multiple connected nodes.

**Methods:**
- `execute(workflow: WorkflowDefinition, context: ExecutionContext): Promise<WorkflowResult>`
- `validateWorkflow(workflow: WorkflowDefinition): ValidationResult`

### Built-in Node Types

| Node Type | Input | Output | Description |
|-----------|-------|--------|-------------|
| `postgresql-query` | `{ connectionString, query, parameters }` | `{ result, rowCount, metadata }` | Execute PostgreSQL queries |
| `mongodb-operations` | `{ connectionString, operation, collection, ...}` | `{ result, matchedCount, modifiedCount }` | MongoDB operations |
| `data-filter` | `{ data, conditions, logicalOperator }` | `{ filtered, filtered_count, original_count }` | Filter array data |
| `field-mapper` | `{ source, mapping }` | `{ mapped, mapping_stats }` | Transform data structures |

## 🚀 Production Usage

### Docker Configuration

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-cache && npm cache clean --force
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
USER nodejs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
LOG_LEVEL=warn
METRICS_ENABLED=true

# Database
DATABASE_URL=postgresql://user:pass@db:5432/prod
DATABASE_POOL_SIZE=50

# Message Queue
RABBITMQ_URL=amqp://user:pass@mq:5672/prod
RABBITMQ_PREFETCH=100

# Security
JWT_SECRET=your-super-secure-secret
RATE_LIMIT_MAX=1000
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yarangodev/flow-platform-node-core.git
cd flow-platform-node-core

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Run development server
npm run dev
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run all checks
npm run ci
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NestJS** for the modular architecture inspiration
- **TypeScript** for type safety and developer experience
- **Jest** for comprehensive testing framework
- **Winston** for structured logging capabilities

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yarangodev/flow-platform-node-core/issues)
- **Documentation**: [Full API documentation](https://yarangodev.github.io/flow-platform-node-core)
- **Discord**: [Join our community](https://discord.gg/flow-platform)
- **Email**: support@flow-platform.dev

---

<div align="center">

**Built with ❤️ by the Flow Platform Team**

[Website](https://flow-platform.dev) • [Documentation](https://docs.flow-platform.dev) • [Examples](https://github.com/yarangodev/flow-platform-examples)

</div>
