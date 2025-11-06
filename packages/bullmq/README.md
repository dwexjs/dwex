# @dwex/bullmq

BullMQ integration for Dwex framework - Redis-backed job queues with TypeScript decorators.

## Installation

```bash
bun add @dwex/bullmq bullmq
```

## Quick Start

### 1. Configure BullMQ Module

```typescript
import { Module } from '@dwex/core';
import { BullMQModule } from '@dwex/bullmq';

@Module({
  imports: [
    BullMQModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

### 2. Register Queues

```typescript
import { Module } from '@dwex/core';
import { BullMQModule } from '@dwex/bullmq';

@Module({
  imports: [
    BullMQModule.registerQueue(
      { name: 'emails' },
      { name: 'notifications' }
    ),
  ],
})
export class TasksModule {}
```

### 3. Create a Processor

```typescript
import { Processor, WorkerHost, OnWorkerEvent } from '@dwex/bullmq';
import type { Job } from 'bullmq';

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

@Processor('emails')
export class EmailProcessor extends WorkerHost<EmailData> {
  async process(job: Job<EmailData>) {
    const { to, subject, body } = job.data;

    // Send email logic
    console.log(`Sending email to ${to}`);
    await sendEmail(to, subject, body);

    return { sent: true, timestamp: Date.now() };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    console.log(`Job ${job.id} completed:`, result);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error);
  }
}
```

### 4. Add Jobs to Queue

```typescript
import { Injectable } from '@dwex/core';
import { InjectQueue } from '@dwex/bullmq';
import type { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('emails') private emailQueue: Queue
  ) {}

  async sendWelcomeEmail(email: string) {
    await this.emailQueue.add('welcome', {
      to: email,
      subject: 'Welcome!',
      body: 'Thanks for signing up',
    });
  }
}
```

## API Reference

### Module Methods

#### `BullMQModule.forRoot(options)`

Configure global BullMQ settings.

```typescript
BullMQModule.forRoot({
  connection: {
    host: 'localhost',
    port: 6379,
  },
  prefix: 'myapp',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})
```

#### `BullMQModule.forRootAsync(options)`

Configure with async factory.

```typescript
BullMQModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    connection: {
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    },
  }),
  inject: [ConfigService],
})
```

#### `BullMQModule.registerQueue(...options)`

Register one or more queues.

```typescript
BullMQModule.registerQueue(
  { name: 'emails' },
  { name: 'notifications', options: { /* queue options */ } }
)
```

#### `BullMQModule.registerQueueAsync(options)`

Register queue with async configuration.

```typescript
BullMQModule.registerQueueAsync({
  name: 'emails',
  useFactory: (config: ConfigService) => ({
    defaultJobOptions: {
      attempts: config.get('JOB_ATTEMPTS'),
    },
  }),
  inject: [ConfigService],
})
```

### Decorators

#### `@Processor(queueName, options?)`

Mark a class as a queue processor.

```typescript
@Processor('emails', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  // ...
}
```

#### `@InjectQueue(queueName)`

Inject a Queue instance.

```typescript
constructor(@InjectQueue('emails') private queue: Queue) {}
```

#### `@InjectFlowProducer(flowName)`

Inject a FlowProducer for complex workflows.

```typescript
constructor(@InjectFlowProducer('workflows') private flow: FlowProducer) {}
```

#### `@OnWorkerEvent(eventName)`

Handle worker events.

Supported events: `'active'`, `'completed'`, `'failed'`, `'progress'`, `'stalled'`, `'drained'`, `'error'`, `'ready'`, `'closed'`, `'paused'`, `'resumed'`

```typescript
@OnWorkerEvent('completed')
onCompleted(job: Job, result: any) {
  console.log('Job completed');
}

@OnWorkerEvent('failed')
onFailed(job: Job, error: Error) {
  console.error('Job failed');
}
```

## Advanced Usage

### Flow Producers

Create complex job workflows with dependencies:

```typescript
import { Injectable } from '@dwex/core';
import { InjectFlowProducer } from '@dwex/bullmq';
import type { FlowProducer } from 'bullmq';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectFlowProducer('workflows') private flow: FlowProducer
  ) {}

  async createUserWorkflow(userId: string) {
    await this.flow.add({
      name: 'create-user',
      queueName: 'users',
      data: { userId },
      children: [
        {
          name: 'send-welcome-email',
          queueName: 'emails',
          data: { userId },
        },
        {
          name: 'setup-profile',
          queueName: 'profiles',
          data: { userId },
        },
      ],
    });
  }
}
```

### Job Progress

Report job progress:

```typescript
@Processor('video-encoding')
export class VideoProcessor extends WorkerHost {
  async process(job: Job) {
    await job.updateProgress(25);
    // ... encoding step 1

    await job.updateProgress(50);
    // ... encoding step 2

    await job.updateProgress(75);
    // ... encoding step 3

    await job.updateProgress(100);
    return { encoded: true };
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    console.log(`Job ${job.id} progress: ${progress}%`);
  }
}
```

## License

MIT
