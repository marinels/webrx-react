export * from './React';
export * from './Common';

if (DEBUG) {
  // we want to dynamically import the demo framework, so we need to do a standalone require
  // tslint:disable-next-line:no-var-requires
  require('./Demo');
}
