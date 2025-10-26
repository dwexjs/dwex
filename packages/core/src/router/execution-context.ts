import type { ExecutionContext as IExecutionContext } from "@dwex/common";

/**
 * Implementation of ExecutionContext.
 */
export class ExecutionContext implements IExecutionContext {
  constructor(
    private readonly request: any,
    private readonly response: any,
    private readonly handler: Function,
    private readonly controller: any
  ) {}

  getRequest<T = any>(): T {
    return this.request;
  }

  getResponse<T = any>(): T {
    return this.response;
  }

  getHandler(): Function {
    return this.handler;
  }

  getClass(): Function {
    return this.controller.constructor;
  }
}
