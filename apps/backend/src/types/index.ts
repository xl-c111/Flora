// Re-export all types for easy importing
export * from './api';

// Additional utility types
export type ID = string;

export interface RequestWithQuery extends Request {
  query: {
    [key: string]: string | undefined;
  };
}
