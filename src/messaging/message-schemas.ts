/**
 * Message Schemas for Flow Orchestration Platform
 * TypeScript interfaces for RabbitMQ message payloads
 */

// Base message interface
export interface BaseMessage {
  id: string;
  timestamp: string;
  correlationId?: string;
  version: string;
}

// Task Priority levels
export type TaskPriority = 'high' | 'normal' | 'low';

// Task execution status
export type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'timeout' | 'cancelled';

// Worker status
export type WorkerStatus = 'available' | 'busy' | 'maintenance' | 'offline';

// Worker health status  
export type HealthStatus = 'healthy' | 'degraded' | 'critical';

/**
 * Task Message - Sent from API Gateway/Orchestrator to Workers
 */
export interface TaskMessage extends BaseMessage {
  flowId: string;
  nodeId: string;
  nodeType: string;
  priority: TaskPriority;
  configuration: Record<string, any>;
  inputs: Record<string, any>;
  metadata: {
    createdAt: string;
    userId?: string;
    flowName?: string;
    nodeIndex: number;
    totalNodes: number;
  };
  retry: {
    attempts: number;
    maxAttempts: number;
    backoffMs: number;
  };
  timeout: {
    executionTimeoutMs: number;
    queueTimeoutMs: number;
  };
}

/**
 * Result Message - Sent from Workers back to Orchestrator
 */
export interface ResultMessage extends BaseMessage {
  taskId: string;
  workerId: string;
  status: TaskStatus;
  outputs?: Record<string, any>;
  metadata: {
    startedAt: string;
    completedAt: string;
    duration: number;
    memoryUsed: number;
    cpuUsed: number;
    recordsProcessed?: number;
  };
  error?: {
    code: string;
    message: string;
    stack?: string;
    nodeType: string;
    retryable: boolean;
  };
}

/**
 * Worker Registration Message - Sent when worker starts up
 */
export interface WorkerRegistrationMessage extends BaseMessage {
  workerId: string;
  hostname: string;
  capacity: {
    maxConcurrentFlows: number;
    maxConcurrentNodes: number;
    memoryLimitMB: number;
    cpuLimitCores: number;
  };
  supportedNodeTypes: string[];
  status: WorkerStatus;
  metadata: {
    version: string;
    startedAt: string;
    environment: string;
    region?: string;
  };
}

/**
 * Worker Heartbeat Message - Sent periodically by workers
 */
export interface WorkerHeartbeatMessage extends BaseMessage {
  workerId: string;
  status: HealthStatus;
  currentLoad: {
    activeFlows: number;
    activeNodes: number;
    memoryUsagePercent: number;
    cpuUsagePercent: number;
    queuedTasks: number;
  };
  lastHeartbeat: string;
  uptime: number;
}

/**
 * System Metrics Message - Sent by services for monitoring
 */
export interface SystemMetricsMessage extends BaseMessage {
  serviceId: string;
  serviceType: 'api-gateway' | 'orchestrator' | 'worker';
  metrics: {
    // Common metrics
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    
    // Service-specific metrics
    [key: string]: number | string | boolean;
  };
  tags: Record<string, string>;
}

/**
 * System Alert Message - Sent when critical events occur
 */
export interface SystemAlertMessage extends BaseMessage {
  alertType: 'error' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  serviceId: string;
  serviceType: 'api-gateway' | 'orchestrator' | 'worker';
  title: string;
  description: string;
  metadata: Record<string, any>;
  resolvedAt?: string;
}

/**
 * Flow Status Update Message - Sent when flow status changes
 */
export interface FlowStatusMessage extends BaseMessage {
  flowId: string;
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    completedNodes: number;
    totalNodes: number;
    percentage: number;
  };
  metadata: {
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    userId?: string;
  };
}

/**
 * Flow Execution Message - Sent from API Gateway to Orchestrator to execute a complete flow
 */
export interface FlowExecutionMessage extends BaseMessage {
  flowId: string;
  executionId: string;
  priority: TaskPriority;
  flowData: {
    name: string;
    version: number;
    nodes: Array<{
      id: string;
      type: string;
      config: Record<string, any>;
      position?: { x: number; y: number };
    }>;
    connections: Array<{
      sourceId: string;
      targetId: string;
      sourcePort?: string;
      targetPort?: string;
    }>;
  };
  inputs?: Record<string, any>;
  metadata: {
    userId?: string;
    triggeredBy: 'manual' | 'scheduled' | 'webhook' | 'api';
    scheduledAt?: string;
  };
}

// Routing Key Patterns
export const RoutingKeys = {
  // Flow Execution
  FLOW_EXECUTE_HIGH: 'flow.execute.high',
  FLOW_EXECUTE_NORMAL: 'flow.execute.normal',
  FLOW_EXECUTE_LOW: 'flow.execute.low',
  
  // Tasks
  TASK_HIGH: 'task.high.execute',
  TASK_NORMAL: 'task.normal.execute', 
  TASK_LOW: 'task.low.execute',
  
  // Workers
  WORKER_REGISTER: 'worker.register.new',
  WORKER_HEARTBEAT: 'worker.heartbeat.update',
  WORKER_RESULT: 'worker.result.completed',
  
  // System
  SYSTEM_METRICS: 'system.metrics.update',
  SYSTEM_ALERT: 'system.alert.new',
  
  // Flow Status
  FLOW_STATUS: 'flow.status.update'
} as const;

// Exchange Names
export const Exchanges = {
  MAIN: 'flow_orchestration',
  DEAD_LETTER: 'flow_orchestration_dlx'
} as const;

// Queue Names
export const Queues = {
  FLOWS_HIGH: 'flows.high_priority',
  FLOWS_NORMAL: 'flows.normal_priority',
  FLOWS_LOW: 'flows.low_priority',
  TASKS_HIGH: 'tasks.high_priority',
  TASKS_NORMAL: 'tasks.normal_priority', 
  TASKS_LOW: 'tasks.low_priority',
  WORKER_REGISTRATION: 'worker.registration',
  WORKER_HEARTBEAT: 'worker.heartbeat',
  WORKER_RESULTS: 'worker.results',
  SYSTEM_METRICS: 'system.metrics',
  SYSTEM_ALERTS: 'system.alerts',
  DEAD_LETTER: 'dead_letter_queue'
} as const;
