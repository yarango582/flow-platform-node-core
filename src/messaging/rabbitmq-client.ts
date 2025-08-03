import * as amqp from "amqplib";
import { EventEmitter } from "events";
import {
  BaseMessage,
  TaskMessage,
  ResultMessage,
  WorkerRegistrationMessage,
  WorkerHeartbeatMessage,
  SystemMetricsMessage,
  SystemAlertMessage,
  FlowStatusMessage,
  Exchanges,
  Queues,
  RoutingKeys,
} from "./message-schemas";

export interface RabbitMQConfig {
  url: string;
  exchange: string;
  prefetch?: number;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface PublishOptions {
  persistent?: boolean;
  priority?: number;
  expiration?: string;
  headers?: Record<string, any>;
}

export interface ConsumeOptions {
  noAck?: boolean;
  exclusive?: boolean;
  prefetch?: number;
}

export class RabbitMQClient extends EventEmitter {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQConfig;
  private reconnectAttempts = 0;
  private isConnecting = false;

  constructor(config: RabbitMQConfig) {
    super();
    this.config = {
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      ...config,
      // Ensure prefetch is always a valid number
      prefetch: Number(config.prefetch) || 10,
    };
  }

  /**
   * Connect to RabbitMQ and setup channel
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.connection) {
      return;
    }

    this.isConnecting = true;

    try {
      console.log(`🐰 Connecting to RabbitMQ: ${this.config.url}`);

      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      // Set prefetch count
      console.log("🔍 Prefetch value:", this.config.prefetch, "Type:", typeof this.config.prefetch);
      await this.channel.prefetch(this.config.prefetch!);

      // Setup connection event handlers
      this.connection.on("error", this.handleConnectionError.bind(this));
      this.connection.on("close", this.handleConnectionClose.bind(this));

      this.reconnectAttempts = 0;
      this.isConnecting = false;

      console.log("✅ Connected to RabbitMQ successfully");
      this.emit("connected");
    } catch (error) {
      this.isConnecting = false;
      console.error("❌ Failed to connect to RabbitMQ:", error);
      this.emit("error", error);
      await this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }

    console.log("🔌 Disconnected from RabbitMQ");
  }

  /**
   * Publish a task message
   */
  async publishTask(
    message: TaskMessage,
    priority: "high" | "normal" | "low" = "normal"
  ): Promise<void> {
    const routingKey =
      priority === "high"
        ? RoutingKeys.TASK_HIGH
        : priority === "normal"
          ? RoutingKeys.TASK_NORMAL
          : RoutingKeys.TASK_LOW;

    await this.publish(Exchanges.MAIN, routingKey, message, {
      persistent: true,
      priority: priority === "high" ? 10 : priority === "normal" ? 5 : 1,
    });
  }

  /**
   * Publish a result message
   */
  async publishResult(message: ResultMessage): Promise<void> {
    await this.publish(Exchanges.MAIN, RoutingKeys.WORKER_RESULT, message, {
      persistent: true,
    });
  }

  /**
   * Publish worker registration
   */
  async publishWorkerRegistration(
    message: WorkerRegistrationMessage
  ): Promise<void> {
    await this.publish(Exchanges.MAIN, RoutingKeys.WORKER_REGISTER, message);
  }

  /**
   * Publish worker heartbeat
   */
  async publishWorkerHeartbeat(message: WorkerHeartbeatMessage): Promise<void> {
    await this.publish(Exchanges.MAIN, RoutingKeys.WORKER_HEARTBEAT, message);
  }

  /**
   * Publish system metrics
   */
  async publishSystemMetrics(message: SystemMetricsMessage): Promise<void> {
    await this.publish(Exchanges.MAIN, RoutingKeys.SYSTEM_METRICS, message);
  }

  /**
   * Publish system alert
   */
  async publishSystemAlert(message: SystemAlertMessage): Promise<void> {
    await this.publish(Exchanges.MAIN, RoutingKeys.SYSTEM_ALERT, message, {
      persistent: true,
      priority: message.severity === "critical" ? 10 : 5,
    });
  }

  /**
   * Publish flow status update
   */
  async publishFlowStatus(message: FlowStatusMessage): Promise<void> {
    await this.publish(Exchanges.MAIN, RoutingKeys.FLOW_STATUS, message);
  }

  /**
   * Generic publish method
   */
  async publish(
    exchange: string,
    routingKey: string,
    message: BaseMessage,
    options: PublishOptions = {}
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available");
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));

    const publishOptions: any = {
      persistent: options.persistent ?? false,
      priority: options.priority,
      expiration: options.expiration,
      headers: options.headers,
      timestamp: Date.now(),
      messageId: message.id,
      correlationId: message.correlationId,
    };

    const success = this.channel.publish(
      exchange,
      routingKey,
      messageBuffer,
      publishOptions
    );

    if (!success) {
      console.warn("⚠️ Message may have been lost due to high water mark");
    }
  }

  /**
   * Consume messages from a queue
   */
  async consume<T extends BaseMessage>(
    queue: string,
    handler: (message: T) => Promise<void>,
    options: ConsumeOptions = {}
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available");
    }

    await this.channel.consume(
      queue,
      async (msg: any) => {
        if (!msg) return;

        try {
          const messageContent = JSON.parse(msg.content.toString()) as T;
          await handler(messageContent);

          if (!options.noAck) {
            this.channel!.ack(msg);
          }
        } catch (error) {
          console.error("❌ Error processing message:", error);

          if (!options.noAck) {
            this.channel!.nack(msg, false, false);
          }

          this.emit("messageError", error, msg);
        }
      },
      {
        noAck: options.noAck ?? false,
        exclusive: options.exclusive ?? false,
      }
    );
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: Error): void {
    console.error("🔥 RabbitMQ connection error:", error);
    this.emit("error", error);
  }

  /**
   * Handle connection close
   */
  private handleConnectionClose(): void {
    console.warn("🔌 RabbitMQ connection closed");
    this.connection = null;
    this.channel = null;
    this.emit("disconnected");

    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  private async scheduleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error("💀 Max reconnection attempts reached");
      this.emit("maxReconnectAttemptsReached");
      return;
    }

    this.reconnectAttempts++;

    console.log(
      `🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${this.config.reconnectDelay}ms`
    );

    setTimeout(() => {
      this.connect();
    }, this.config.reconnectDelay);
  }
}
