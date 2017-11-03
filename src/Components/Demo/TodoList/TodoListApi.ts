import { ObservableApi } from '../../../Stores/ObservableApi';
import { SampleData } from '../../../Stores/SampleData/SampleData';

export class TodoListApi extends ObservableApi {
  private static createSampleData() {
    return new SampleData(
      require('./SampleData/TodoListStore').Store,
    );
  }

  public static readonly default = new TodoListApi();

  constructor() {
    super('api/TodoList', TodoListApi.createSampleData);
  }
}
