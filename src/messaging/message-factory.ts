/**
 * Message Factory Utilities
 * Helper functions to create well-formed messages
 */

import { v4 as uuidv4 } from 'uuid';
import {
  TaskMessage,
  ResultMessage,
  WorkerRegistrationMessage,
  WorkerHeartbeatMessage,
  SystemMetricsMessage,
  SystemAlertMessage,
  FlowStatusMessage,
  FlowExecutionMessage,
  TaskPriority,
  TaskStatus,
  WorkerStatus,
  HealthStatus
} from './message-schemas';

export class MessageFactory {
  private static version = '1.0.0';

  /**
   * Create a new task message
   */
  static createTaskMessage(params: {
    flowId: string;
    nodeId: string;
    nodeType: string;
    priority?: TaskPriority;
    configuration: Record<string, any>;
    inputs: Record<string, any>;
    userId?: string;
    flowName?: string;
    nodeIndex: number;
    totalNodes: number;
    maxAttempts?: number;
    executionTimeoutMs?: number;
  }): TaskMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      flowId: params.flowId,
      nodeId: params.nodeId,
      nodeType: params.nodeType,
      priority: params.priority || 'normal',
      configuration: params.configuration,
      inputs: params.inputs,
      metadata: {
        createdAt: new Date().toISOString(),
        userId: params.userId,
        flowName: params.flowName,
        nodeIndex: params.nodeIndex,
        totalNodes: params.totalNodes
      },
      retry: {
        attempts: 0,
        maxAttempts: params.maxAttempts || 3,
        backoffMs: 1000
      },
      timeout: {
        executionTimeoutMs: params.executionTimeoutMs || 300000, // 5 minutes
        queueTimeoutMs: 600000 // 10 minutes
      }
    };
  }

  /**
   * Create a result message
   */
  static createResultMessage(params: {
    taskId: string;
    workerId: string;
    status: TaskStatus;
    outputs?: Record<string, any>;
    startedAt: string;
    duration: number;
    memoryUsed: number;
    cpuUsed: number;
    recordsProcessed?: number;
    error?: {
      code: string;
      message: string;
      stack?: string;
      nodeType: string;
      retryable: boolean;
    };
  }): ResultMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      taskId: params.taskId,
      workerId: params.workerId,
      status: params.status,
      outputs: params.outputs,
      metadata: {
        startedAt: params.startedAt,
        completedAt: new Date().toISOString(),
        duration: params.duration,
        memoryUsed: params.memoryUsed,
        cpuUsed: params.cpuUsed,
        recordsProcessed: params.recordsProcessed
      },
      error: params.error
    };
  }

  /**
   * Create a worker registration message
   */
  static createWorkerRegistrationMessage(params: {
    workerId: string;
    hostname: string;
    maxConcurrentFlows: number;
    maxConcurrentNodes: number;
    memoryLimitMB: number;
    cpuLimitCores: number;
    supportedNodeTypes: string[];
    status?: WorkerStatus;
    environment?: string;
    region?: string;
  }): WorkerRegistrationMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      workerId: params.workerId,
      hostname: params.hostname,
      capacity: {
        maxConcurrentFlows: params.maxConcurrentFlows,
        maxConcurrentNodes: params.maxConcurrentNodes,
        memoryLimitMB: params.memoryLimitMB,
        cpuLimitCores: params.cpuLimitCores
      },
      supportedNodeTypes: params.supportedNodeTypes,
      status: params.status || 'available',
      metadata: {
        version: this.version,
        startedAt: new Date().toISOString(),
        environment: params.environment || 'production',
        region: params.region
      }
    };
  }

  /**
   * Create a worker heartbeat message
   */
  static createWorkerHeartbeatMessage(params: {
    workerId: string;
    status: HealthStatus;
    activeFlows: number;
    activeNodes: number;
    memoryUsagePercent: number;
    cpuUsagePercent: number;
    queuedTasks: number;
    uptime: number;
  }): WorkerHeartbeatMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      workerId: params.workerId,
      status: params.status,
      currentLoad: {
        activeFlows: params.activeFlows,
        activeNodes: params.activeNodes,
        memoryUsagePercent: params.memoryUsagePercent,
        cpuUsagePercent: params.cpuUsagePercent,
        queuedTasks: params.queuedTasks
      },
      lastHeartbeat: new Date().toISOString(),
      uptime: params.uptime
    };
  }

  /**
   * Create a system metrics message
   */
  static createSystemMetricsMessage(params: {
    serviceId: string;
    serviceType: 'api-gateway' | 'orchestrator' | 'worker';
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    customMetrics?: Record<string, number | string | boolean>;
    tags?: Record<string, string>;
  }): SystemMetricsMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      serviceId: params.serviceId,
      serviceType: params.serviceType,
      metrics: {
        uptime: params.uptime,
        memoryUsage: params.memoryUsage,
        cpuUsage: params.cpuUsage,
        ...params.customMetrics
      },
      tags: params.tags || {}
    };
  }

  /**
   * Create a system alert message
   */
  static createSystemAlertMessage(params: {
    alertType: 'error' | 'warning' | 'info';
    severity: 'critical' | 'high' | 'medium' | 'low';
    serviceId: string;
    serviceType: 'api-gateway' | 'orchestrator' | 'worker';
    title: string;
    description: string;
    metadata?: Record<string, any>;
  }): SystemAlertMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      alertType: params.alertType,
      severity: params.severity,
      serviceId: params.serviceId,
      serviceType: params.serviceType,
      title: params.title,
      description: params.description,
      metadata: params.metadata || {}
    };
  }

  /**
   * Create a flow status message
   */
  static createFlowStatusMessage(params: {
    flowId: string;
    executionId: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    completedNodes: number;
    totalNodes: number;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    userId?: string;
  }): FlowStatusMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      flowId: params.flowId,
      executionId: params.executionId,
      status: params.status,
      progress: {
        completedNodes: params.completedNodes,
        totalNodes: params.totalNodes,
        percentage: Math.round((params.completedNodes / params.totalNodes) * 100)
      },
      metadata: {
        startedAt: params.startedAt,
        completedAt: params.completedAt,
        duration: params.duration,
        userId: params.userId
      }
    };
  }

  /**
   * Create a flow execution message
   */
  static createFlowExecutionMessage(params: {
    flowId: string;
    priority?: TaskPriority;
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
    userId?: string;
    triggeredBy?: 'manual' | 'scheduled' | 'webhook' | 'api';
    scheduledAt?: string;
  }): FlowExecutionMessage {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: this.version,
      flowId: params.flowId,
      executionId: uuidv4(),
      priority: params.priority || 'normal',
      flowData: params.flowData,
      inputs: params.inputs || {},
      metadata: {
        userId: params.userId,
        triggeredBy: params.triggeredBy || 'manual',
        scheduledAt: params.scheduledAt
      }
    };
  }
}
