# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-03

### Added
- Initial release of @flow-platform/node-core
- BaseNode abstract class for creating custom nodes
- Built-in PostgreSQL Query Node with connection pooling
- Built-in MongoDB Operations Node with aggregation support
- Built-in Data Filter Node with complex condition support
- Built-in Field Mapper Node with transformation capabilities
- NodeRegistry for managing node types and instances
- WorkflowExecutor for running complete workflows
- RabbitMQ client for real-time messaging
- Comprehensive TypeScript support with strict typing
- Performance tracking and metrics collection
- Structured logging with Winston
- Input/output validation with Zod schemas
- Compatibility validation between nodes
- Comprehensive test suite with Jest
- CLI tools for node development
- Docker support and production configurations
- Complete documentation and examples

### Features
- Type-safe node architecture
- Extensible plugin system
- Real-time workflow execution
- Distributed processing support
- Performance monitoring
- Security best practices
- Enterprise-grade error handling
- Comprehensive testing utilities

### Dependencies
- Node.js 18+ support
- TypeScript 5.4+ compatibility
- PostgreSQL and MongoDB database support
- RabbitMQ message broker integration
- Redis caching support
