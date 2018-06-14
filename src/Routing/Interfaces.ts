import { Observable } from  'rxjs';

export interface Route {
  path: string;
  params?: string;
  state: { route?: Route };
  match?: RegExpMatchArray;
}

export interface HashManager {
  readonly hashChanged: Observable<string>;
  // hash will contain the # prefix
  updateHash: (hash: string, state: {}, title: string, replace: boolean) => void;
}
