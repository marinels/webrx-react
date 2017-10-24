import { Observable, Scheduler } from  'rxjs';

export interface Route {
  path: string;
  params: string;
  state: any;
  match: RegExpMatchArray;
}

export interface HashManager {
  readonly hashChanged: Observable<string>;
  // hash will contain the # prefix
  updateHash: (hash: string, state: any, title: string, replace: boolean) => void;
}
