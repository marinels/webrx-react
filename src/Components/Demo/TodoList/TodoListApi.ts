import { ObservableApi } from '../../../Stores/ObservableApi';
import { ObservableSampleDataApi } from '../../../Stores/SampleData/ObservableSampleDataApi';

export class TodoListApi extends ObservableApi {
  public static displayName = 'TodoListApi';

  public static readonly default = new TodoListApi();

  private static createSampleData() {
    return new ObservableSampleDataApi(
      require('./SampleData/TodoListStore').TodoListStore.default,
    );
  }

  constructor() {
    super('api/TodoList', TodoListApi.createSampleData);
  }
}
