import { ReactNode } from 'react';

export type ViewActivator = ((context?: {}, responsive?: boolean) => ReactNode);

export interface ViewMapper extends StringMap<ViewActivator | ReactNode> {}

export const ViewMap: ViewMapper = {};
