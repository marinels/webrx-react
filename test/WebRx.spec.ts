import { Observable, Subject, BehaviorSubject, Scheduler, Disposable } from 'rx';

import { should } from './setup';
import { wx } from '../src/WebRx';

describe('for WebRx', () => {
  describe('observable properties', () => {
    it('can create a property', () => {
      const prop = wx.property();
      should.exist(prop);
      should.not.exist(prop.value);
    });

    it('are not read only with the default source', () => {
      const prop = wx.property();
      prop.isReadOnly.should.be.false;
    });

    it('are not read only with a subject source', () => {
      const subj = new BehaviorSubject('test');
      const prop = wx.property(undefined, subj);
      prop.isReadOnly.should.be.false;
    });

    it('are read only with an observable source', () => {
      const obs = Observable.of('test');
      const prop = wx.property(undefined, obs);
      prop.isReadOnly.should.be.true;
    });

    it('can create a property with an initial value', () => {
      const prop = wx.property('test');

      should.exist(prop.value);
      prop.value.should.eql('test');
    });

    it('can set a property value', () => {
      const prop = wx.property('test1');

      prop.value = 'test2';
      prop.value.should.eql('test2');
    });

    it('can get the value using legacy functional notation', () => {
      const prop = wx.property('test');

      should.exist(prop());
      prop().should.eql('test');
    });

    it('can set the value using legacy functional notation', () => {
      const prop = wx.property('test1');

      prop('test2');
      prop.value.should.eql('test2');
    });

    it('can set a property value to undefined', () => {
      const prop = wx.property<string | undefined>('test');

      prop.value = undefined;
      should.equal(prop.value, undefined);
    });

    it('can set a property value to null', () => {
      const prop = wx.property<string | null>('test');

      prop.value = null;
      should.equal(prop.value, null);
    });

    it('consumes events from the source', () => {
      const subj = new BehaviorSubject('test1');
      const prop = wx.property('', subj);

      prop.value.should.eql(subj.getValue());
      subj.onNext('test2');
      prop.value.should.eql(subj.getValue());
    });

    it('does not generate an initial changed event with no initial value', () => {
      const prop = wx.property<string>();
      let isChanged = false;
      prop.changed
        .observeOn(Scheduler.immediate)
        .subscribe(() => { isChanged = true; });

      isChanged.should.be.false;
    });

    it('does not generate an initial changed event with an initial value', () => {
      const prop = wx.property('test');
      let isChanged = false;
      prop.changed
        .observeOn(Scheduler.immediate)
        .subscribe(() => { isChanged = true; });

      isChanged.should.be.false;
    });

    it('generates a changed event when the value changes', () => {
      const prop = wx.property('test1');
      let isChanged = false;
      prop.changed
        .observeOn(Scheduler.immediate)
        .subscribe(() => { isChanged = true; });

      prop.value = 'test2';
      isChanged.should.be.true;
    });

    it('does not generate a changed event when the value does not change', () => {
      const prop = wx.property('test');
      let isChanged = false;
      prop.changed
        .observeOn(Scheduler.immediate)
        .subscribe(() => { isChanged = true; });

      prop.value = 'test';
      isChanged.should.be.false;
    });
  });

  describe('observable commands', () => {
    it('can check if the command is executing', () => {
      let isExecuting: boolean | undefined;

      const cmd = wx.command();
      cmd.isExecutingObservable
        .subscribe(x => {
          isExecuting = x;
        });

      should.exist(isExecuting);
      isExecuting!.should.be.false;
    });

    it('can check if the command can execute', () => {
      const cmd = wx.command();

      should.exist(cmd.canExecute());
      cmd.canExecute().should.be.true;
    });

    it('can generate results from the parameter', () => {
      let result: string | undefined;
      const cmd = wx.command<string>();

      cmd.results
        .subscribe(x => { result = x; });

      cmd.execute('test');
      should.exist(result);
      result!.should.eql('test');
    });

    it('can create a command that emits a custom result', () => {
      let result: string | undefined;
      const cmd = wx.command<string>((x: number) => `test${ x }`);

      cmd.results
        .subscribe(x => { result = x; });

      cmd.execute(1);
      should.exist(result);
      result!.should.eql('test1');
    });

    it('can create a command that defines canExecute', () => {
      const cmd = wx.command(undefined, Observable.of(false));

      cmd.canExecute().should.be.false;
    });

    it('can observe execution', () => {
      let result: string | undefined;
      const cmd = wx.command<string>();

      cmd.observeExecution('test')
        .subscribe(x => { result = x; });

      should.exist(result);
      result!.should.eql('test');
    });

    it('can execute', () => {
      let result: string | undefined;
      const cmd = wx.command<string>(x => { result = x; return x; });

      cmd.execute('test');

      should.exist(result);
      result!.should.eql('test');
    });

    it('can allow immediate execution if no canExecute observable is supplied', () => {
      let cmd1Executed = false;
      let cmd2Executed = false;
      let cmd2CanExecute = false;
      const cmd1 = wx.command();

      cmd1.results.subscribe(() => {
        cmd1Executed = true;
        const cmd2 = wx.command(() => { cmd2Executed = true; });

        cmd2CanExecute = cmd2.canExecute();
        cmd2.execute();
      });

      cmd1.execute();

      cmd1Executed.should.be.true;
      cmd2Executed.should.be.true;
      cmd2CanExecute.should.be.true;
    });

    it('updates isExecuting while executing', () => {
      let isExecuting = false;

      const cmd = wx.command(() => {
        isExecuting = (<any>cmd).isExecutingSubject.getValue();
      });

      cmd.execute();

      isExecuting.should.be.true;
    });

    it('prevents execution while executing', () => {
      let isExecutionPrevented = false;
      const result = new BehaviorSubject('');
      const cmd = wx.command(x => {
        result.onNext(x);

        return x;
      });

      Observable
        .combineLatest(result, cmd.isExecutingObservable, cmd.canExecuteObservable, (r, ie, ce) => ({ r, ie, ce }))
        .filter(x => x.r === 'test')
        .take(1)
        .subscribe(x => {
          isExecutionPrevented = x.ie === true && x.ce === false;
        });

      cmd.execute('test');

      isExecutionPrevented.should.be.true;
    });
  });

  describe('whenAny', () => {
    it('produces an observable for a single element', () => {
      let result: string[] | undefined;

      wx
        .whenAny(Observable.of('test1'))
        .subscribe(x => { result = x; });

      should.exist(result);
      result!.should.eql([ 'test1' ]);
    });

    it('produces an observable combining two elements', () => {
      let result: string[] | undefined;

      wx
        .whenAny(Observable.of('test1'), Observable.of('test2'))
        .subscribe(x => { result = x; });

      should.exist(result);
      result!.should.eql([ 'test1', 'test2' ]);
    });

    it('produces an observable combining three elements', () => {
      let result: string[] | undefined;

      wx
        .whenAny(Observable.of('test1'), Observable.of('test2'), Observable.of('test3'))
        .subscribe(x => { result = x; });

      should.exist(result);
      result!.should.eql([ 'test1', 'test2', 'test3' ]);
    });

    it('produces events only after all sources emit', () => {
      let result: string[] | undefined;
      const subj1 = new Subject<string>();
      const subj2 = new Subject<string>();

      wx
        .whenAny(subj1, subj2)
        .subscribe(x => { result = x; });

      should.not.exist(result);

      subj1.onNext('test1');
      should.not.exist(result);

      subj2.onNext('test2');
      should.exist(result);

      result!.should.eql([ 'test1', 'test2' ]);
    });

    it('produces additional events for each source emit', () => {
      let result: string[] | undefined;
      const subj1 = new BehaviorSubject<string>('test1');
      const subj2 = new BehaviorSubject<string>('test2');

      wx
        .whenAny(subj1, subj2)
        .subscribe(x => { result = x; });

      should.exist(result);
      result!.should.eql([ 'test1', 'test2' ]);

      result = undefined;
      subj1.onNext('test3');
      should.exist(result);
      result!.should.eql([ 'test3', 'test2' ]);

      result = undefined;
      subj2.onNext('test4');
      should.exist(result);
      result!.should.eql([ 'test3', 'test4' ]);
    });
  });

  describe('observable extensions', () => {
    describe('subscribeWith', () => {
      it('subscribes with an observer', () => {
        const observer = new BehaviorSubject<string | undefined>(undefined);
        const sub = Observable.of('test').subscribeWith(observer);

        Disposable.isDisposable(sub).should.be.true;
        should.exist(observer.getValue());
        observer.getValue()!.should.eql('test');
      });

      it('subscribes with functions without an error', () => {
        let onNextCalled = false;
        let onCompletedCalled = false;

        Observable
          .of('test')
          .subscribeWith(
            x => {
              onNextCalled = x === 'test';
            },
            undefined,
            () => {
              onCompletedCalled = true;
            },
          );

        onNextCalled.should.be.true;
        onCompletedCalled.should.be.true;
      });

      it('subscribes with functions with an error', () => {
        let onErrorCalled = false;
        const error = new Error('error');

        Observable
          .throw(error)
          .subscribeWith(
            undefined,
            e => {
              onErrorCalled = e === error;
            },
            undefined,
          );

        onErrorCalled.should.be.true;
      });
    });

    describe('toProperty', () => {
      it('creates a property for the observable source without an initial value', () => {
        const obs = Observable.of('test');
        const prop = obs.toProperty();

        should.exist(prop);
        should.exist(prop.value);
        prop.value.should.eql('test');
      });

      it('creates a property for the observable source with an initial value', () => {
        const obs = Observable.never<string>();
        const prop = obs.toProperty('test');

        should.exist(prop);
        should.exist(prop.value);
        prop.value.should.eql('test');
      });
    });

    describe('observeCommand', () => {
      it('observes static command results', () => {
        let executed = false;
        const cmd = wx.command((x: string) => x);

        Observable
          .of('test')
          .observeCommand(cmd)
          .subscribe(x => {
            executed = x === 'test';
          });

        executed.should.be.true;
      });

      it('observes dynamic command results', () => {
        let executed = false;
        const cmd = wx.command((x: string) => x);

        Observable
          .of('test')
          .observeCommand(() => cmd)
          .subscribe(x => {
            executed = x === 'test';
          });

        executed.should.be.true;
      });
    });

    describe('invokeCommand', () => {
      it('invokes a static command', () => {
        let executed = false;
        let param: string | undefined;
        const cmd = wx.command((x: string) => { executed = true; param = x; return x; });

        Observable
          .of('test')
          .invokeCommand(cmd);

        executed.should.be.true;
        should.exist(param);
        param!.should.eql('test');
      });

      it('invokes a dynamic command', () => {
        let executed = false;
        let param: string | undefined;
        const cmd = wx.command((x: string) => { executed = true; param = x; return x; });

        Observable
          .of('test')
          .invokeCommand(() => cmd);

        executed.should.be.true;
        should.exist(param);
        param!.should.eql('test');
      });
    });
  });
});
