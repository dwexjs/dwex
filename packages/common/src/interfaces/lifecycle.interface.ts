/**
 * Interface for components that need to perform initialization
 * after the module has been initialized.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class DatabaseService implements OnModuleInit {
 *   async onModuleInit() {
 *     await this.connect();
 *   }
 * }
 * ```
 */
export interface OnModuleInit {
	/**
	 * Called after the module has been initialized.
	 * Use this hook to perform any initialization logic that depends on
	 * the module's dependencies being ready.
	 */
	onModuleInit(): Promise<void> | void;
}
