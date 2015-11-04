export const AlertCreatedKey = 'AlertCreated';

export interface IAlertCreated {
  text: string;
  header?: string;
  style?: string;
  timeout?: number;
}

export default AlertCreatedKey;
