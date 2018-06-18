import { Observable } from 'rxjs';

import { Command, wx } from '../WebRx';
import { HashManager } from './Interfaces';

// this is a more comprehensive hash manager that does support history replacement
// however, this hash manager requires at least IE11
// if support is not detected, then the window location hash manager is used instead
export class HistoryStateHashManager implements HashManager {
  private changeHash: Command<string>;

  constructor(protected readonly fallbackManager: HashManager) {
    this.changeHash = wx.command<string>();
  }

  updateHash(hash: string, state: {}, title: string, replace: boolean) {
    if (
      history != null &&
      history.replaceState instanceof Function &&
      history.pushState instanceof Function
    ) {
      if (replace === true) {
        history.replaceState(state, title, hash);
      } else {
        history.pushState(state, title, hash);
      }

      this.changeHash.execute(hash);
    } else {
      // history API not supported, fallback onto window location hash manager
      this.fallbackManager.updateHash(hash, state, title, replace);
    }
  }

  public get hashChanged() {
    return (
      Observable
        // we need to merge both hash change requests (from updateHash)
        // as well as manual URI hash changes from the window location hash manager
        .merge(this.changeHash.results, this.fallbackManager.hashChanged)
    );
  }
}

// this is a low level fallback hash manager (in case we can't construct a real one)
export const nullHashManager: HashManager = {
  hashChanged: Observable.never<string>(),
  updateHash: () => {
    // do nothing
  },
};

// this is a very basic hash manager, it does not support history replacement
// it's possible that the environment doesn't support `window` so we need to check it first
export const windowLocationHashManager: HashManager | undefined =
  typeof window === 'undefined'
    ? undefined
    : {
        hashChanged: Observable.fromEvent<HashChangeEvent>(
          window,
          'hashchange',
        ).map(() => window.location.hash),
        updateHash: hash => {
          window.location.hash = hash;
        },
      };

export const historyStateHashManager = new HistoryStateHashManager(
  windowLocationHashManager || nullHashManager,
);
