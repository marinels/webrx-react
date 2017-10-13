import { Observable } from  'rxjs';
import * as clone from 'clone';

import { BaseSampleDataStore, SampleDataActionSet, SampleDataAction } from './BaseSampleDataStore';

export class SampleData {
  protected actions: SampleDataActionSet | undefined;

  constructor(private readonly initializeActions: () => void, protected readonly delay = 0) {
  }

  protected getActions() {
    if (this.actions == null) {
      this.actions = {};

      this.initializeActions();
    }

    return this.actions;
  }

  protected getAction(action: string) {
    return this.getActions()[action];
  }

  public addDataStore(data: BaseSampleDataStore, name: string): void {
    Object.assign(this.getActions(), data.getActions());

    (<StringMap<any>>this)[name] = data;
  }

  public addAction(action: string, dataAction: SampleDataAction) {
    this.getActions()[action] = dataAction;
  }

  public getData<T, TData = any>(name: string, selector: (data: TData) => T) {
    const data: TData | undefined = (<StringMap<any>>this)[name];

    return data == null ? undefined : clone(selector(data));
  }

  public getObservable<T>(action: string, params?: any): Observable<T> {
    return Observable
      .of(this.getAction(action))
      .delay(this.delay)
      .flatMap(sampleDataAction => {
        if (sampleDataAction == null) {
          return Observable.throw(new Error(`Sample DataStore Action Not Found: ${ action }`));
        }

        return sampleDataAction(params);
      });
  }
}
