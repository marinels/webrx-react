export const AlertCreatedKey = 'AlertCreated';

export interface AlertCreated {
  content: any;
  header?: string;
  style?: string;
  timeout?: number;
}
