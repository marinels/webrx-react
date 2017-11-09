import { RoutingStateChanged } from '../../Events';

export interface ViewModelLifecyle {
  initializeViewModel(): void;
  loadedViewModel(): void;
  updatedViewModel(): void;
  cleanupViewModel(): void;
}

export interface RoutingStateHandler<T> {
  isRoutingStateHandler(): boolean;
  createRoutingState(): T;
  applyRoutingState(state: T): void;
}

export interface HandlerRoutingStateChanged extends RoutingStateChanged {
  source: RoutingStateHandler<any>;
}

export interface Search {
}
