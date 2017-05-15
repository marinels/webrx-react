import { Observable } from  'rx';

import { BaseSampleDataStore, SampleDataActionSet, SampleDataAction } from './BaseSampleDataStore';

export class SampleData {
  protected actions: SampleDataActionSet | undefined;

  constructor(private readonly initializeActions: () => void, protected readonly delay = 0) {
  }

  private getActions() {
    if (this.actions == null) {
      this.actions = {};

      this.initializeActions();
    }

    return this.actions;
  }

  protected getAction(action: string) {
    return this.getActions()[action];
  }

  public addDataStore(data: BaseSampleDataStore, name?: string): void {
    Object.assign(this.getActions(), data.getActions());

    if (String.isNullOrEmpty(name) === false) {
      (<any>this)[<string>name] = data;
    }
  }

  public addAction(action: string, dataAction: SampleDataAction) {
    this.getActions()[action] = dataAction;
  }

  getObservable<T>(action: string, params?: any) {
    let result: Observable<T>;
    const sampleDataAction = this.getAction(action);

    if (sampleDataAction != null) {
      result = sampleDataAction(params)
        .delay(this.delay);
    }
    else {
      result = Observable.throw<T>(new Error(`Sample DataStore Action Not Found: ${ action }`));
    }

    return result;
  }
}
