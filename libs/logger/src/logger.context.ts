import { AsyncLocalStorage } from 'async_hooks';

export const loggerContext = new AsyncLocalStorage<Map<string, string>>();