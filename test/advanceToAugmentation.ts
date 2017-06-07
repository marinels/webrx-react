import { VirtualTimeScheduler } from 'rxjs/scheduler/VirtualTimeScheduler';

declare module 'rxjs/scheduler/VirtualTimeScheduler' {
  interface VirtualTimeScheduler {
    advancedTo(frame: number): void;
  }
}

function advancedTo(this: VirtualTimeScheduler, frame: number) {
  while (true) {
    const action = this.actions[0];

    if (action == null || action.delay > frame) {
      break;
    }

    const err = action.execute(action.state, action.delay);
    this.actions.shift();

    if (err != null) {
      this.actions
        .forEach(x => x.unsubscribe());

      throw err;
    }

    this.frame = action.delay;
  }

  this.frame = frame;
}
VirtualTimeScheduler.prototype.advancedTo = advancedTo;
