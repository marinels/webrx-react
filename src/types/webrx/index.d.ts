import { Observable, Observer, IObservable, Promise, IPromise, CompositeDisposable, IDisposable, IScheduler } from 'rx';

// Type alias for observables and properties
type ObservableOrProperty<T> = Observable<T> | IObservableProperty<T>;

/**
/* Dependency Injector and service locator
/* @interface
**/
export interface IInjector {
    register(key: string, factory: Array<any>, singleton?: boolean): IInjector;
    register(key: string, factory: () => any, singleton?: boolean): IInjector;
    register(key: string, instance: any): IInjector;
    get<T>(key: string, args?: any): T;
    resolve<T>(iaa: Array<any>, args?: any): T;
}

/**
/* IObservableProperty combines a function signature for value setting and getting with
/* observables for monitoring value changes
/* @interface
**/
export interface IObservableProperty<T> extends IDisposable {
    (newValue: T): void;
    (): T;
    changing: Observable<T>;
    changed: Observable<T>;
}

/**
* IObservableReadOnlyProperty provides observable source and exception
* handling members with the standard observable property members
* @interface
**/
export interface IObservableReadOnlyProperty<T> extends IObservableProperty<T> {
  source: Observable<T>;
  thrownExceptions: Observable<Error>;

  catchExceptions(onError: (error: Error) => void): IObservableReadOnlyProperty<T>;
}

export interface IRangeInfo {
    from: number;
    to?: number;
}

/**
/* Provides information about a changed property value on an object
/* @interface
**/
export interface IPropertyChangedEventArgs {
    sender: any;
    propertyName: string;
}

/**
/* Encapsulates change notifications published by various IObservableList members
/* @interface
**/
export interface IListChangeInfo<T> extends IRangeInfo {
    items: T[];
}

/**
/* INotifyListItemChanged provides notifications for collection item updates, ie when an object in
/* a list changes.
/* @interface
**/
export interface INotifyListItemChanged {
    /**
    /* Provides Item Changing notifications for any item in collection that
    /* implements IReactiveNotifyPropertyChanged. This is only enabled when
    /* ChangeTrackingEnabled is set to True.
    **/
    itemChanging: Observable<IPropertyChangedEventArgs>;
    /**
    /* Provides Item Changed notifications for any item in collection that
    /* implements IReactiveNotifyPropertyChanged. This is only enabled when
    /* ChangeTrackingEnabled is set to True.
    **/
    itemChanged: Observable<IPropertyChangedEventArgs>;
    /**
    /* Enables the ItemChanging and ItemChanged properties; when this is
    /* enabled, whenever a property on any object implementing
    /* IReactiveNotifyPropertyChanged changes, the change will be
    /* rebroadcast through ItemChanging/ItemChanged.
    **/
    changeTrackingEnabled: boolean;
}

/**
/* INotifyListChanged of T provides notifications when the contents
/* of a list are changed (items are added/removed/moved).
/* @interface
**/
export interface INotifyListChanged<T> {
    /**
    /* This Observable fires before the list is changing, regardless of reason
    **/
    listChanging: Observable<boolean>;
    /**
    /* This Observable fires after list has changed, regardless of reason
    **/
    listChanged: Observable<boolean>;
    /**
    /* Fires when items are added to the list, once per item added.
    /* Functions that add multiple items such addRange should fire this
    /* multiple times. The object provided is the item that was added.
    **/
    itemsAdded: Observable<IListChangeInfo<T>>;
    /**
    /* Fires before an item is going to be added to the list.
    **/
    beforeItemsAdded: Observable<IListChangeInfo<T>>;
    /**
    /* Fires once an item has been removed from a list, providing the
    /* item that was removed.
    **/
    itemsRemoved: Observable<IListChangeInfo<T>>;
    /**
    /* Fires before an item will be removed from a list, providing
    /* the item that will be removed.
    **/
    beforeItemsRemoved: Observable<IListChangeInfo<T>>;
    /**
    /* Fires before an items moves from one position in the list to
    /* another, providing the item(s) to be moved as well as source and destination
    /* indices.
    **/
    beforeItemsMoved: Observable<IListChangeInfo<T>>;
    /**
    /* Fires once one or more items moves from one position in the list to
    /* another, providing the item(s) that was moved as well as source and destination
    /* indices.
    **/
    itemsMoved: Observable<IListChangeInfo<T>>;
    /**
    /* Fires before an item is replaced indices.
    **/
    beforeItemReplaced: Observable<IListChangeInfo<T>>;
    /**
    /* Fires after an item is replaced
    **/
    itemReplaced: Observable<IListChangeInfo<T>>;
    /**
    /* Fires when the list length changes, regardless of reason
    **/
    lengthChanging: Observable<number>;
    /**
    /* Fires when the list length changes, regardless of reason
    **/
    lengthChanged: Observable<number>;
    /**
    /* Fires when the empty state changes, regardless of reason
    **/
    isEmptyChanged: Observable<boolean>;
    /**
    /* This Observable is fired when a shouldReset fires on the list. This
    /* means that you should forget your previous knowledge of the state
    /* of the collection and reread it.
    /*
    /* This does *not* mean Clear, and if you interpret it as such, you are
    /* Doing It Wrong.
    **/
    shouldReset: Observable<any>;
    /**
    /* Suppresses change notification from the list until the disposable returned by this method is disposed
    **/
    suppressChangeNotifications(): IDisposable;
}

/**
/* Represents a read-only collection of objects that can be individually accessed by index.
/* @interface
**/
export interface IList<T> {
    length: IObservableProperty<number>;
    get(index: number): T;
    toArray(): Array<T>;
    isReadOnly: boolean;
}

/**
/* Represents an observable read-only collection of objects that can be individually accessed by index.
/* @interface
**/
export interface IObservableReadOnlyList<T> extends IList<T>, INotifyListChanged<T>, INotifyListItemChanged {
    isEmpty: IObservableProperty<boolean>;

    contains(item: T): boolean;
    indexOf(item: T): number;

    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[];
    every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
}

/**
/* Represents an observable read-only collection which can be projected and paged
/* @interface
**/
export interface IProjectableObservableReadOnlyList<T> extends IObservableReadOnlyList<T> {
    /**
    /* Creates a live-projection of itself that can be filtered, re-ordered and mapped.
    /* @param filter {(item: T) => boolean} A filter to determine whether to exclude items in the derived collection
    /* @param orderer {(a: TNew, b: TNew) => number} A comparator method to determine the ordering of the resulting collection
    /* @param selector {(T) => TNew} A function that will be run on each item to project it to a different type
    /* @param refreshTrigger {Observable<TDontCare>} When this Observable is signalled, the derived collection will be manually reordered/refiltered.
    **/
    project<TNew, TDontCare>(filter?: (item: T) => boolean, orderer?: (a: TNew, b: TNew) => number,
        selector?: (item: T) => TNew, refreshTrigger?: Observable<TDontCare>, scheduler?: IScheduler): IProjectableObservableReadOnlyList<TNew>;
    /**
    /* Creates a live-projection of itself that can be filtered, re-ordered and mapped.
    /* @param filter {(item: T) => boolean} A filter to determine whether to exclude items in the derived collection
    /* @param orderer {(a: TNew, b: TNew) => number} A comparator method to determine the ordering of the resulting collection
    /* @param refreshTrigger {Observable<TDontCare>} When this Observable is signalled, the derived collection will be manually reordered/refiltered.
    **/
    project<TDontCare>(filter?: (item: T) => boolean, orderer?: (a: T, b: T) => number,
        refreshTrigger?: Observable<TDontCare>, scheduler?: IScheduler): IProjectableObservableReadOnlyList<T>;
    /**
    /* Creates a live-projection of itself that can be filtered, re-ordered and mapped.
    /* @param filter {(item: T) => boolean} A filter to determine whether to exclude items in the derived collection
    /* @param refreshTrigger {Observable<TDontCare>} When this Observable is signalled, the derived collection will be manually reordered/refiltered.
    **/
    project<TDontCare>(filter?: (item: T) => boolean, refreshTrigger?: Observable<TDontCare>,
        scheduler?: IScheduler): IProjectableObservableReadOnlyList<T>;
    /**
    /* Creates a live-projection of itself that can be filtered, re-ordered and mapped.
    /* @param refreshTrigger {Observable<TDontCare>} When this Observable is signalled, the derived collection will be manually reordered/refiltered.
    **/
    project<TDontCare>(refreshTrigger?: Observable<TDontCare>, scheduler?: IScheduler): IProjectableObservableReadOnlyList<T>;

    /**
    * Creates a paged live-projection of itself.
    * @param pageSize {number} Initial page-size of the projection
    * @param currentPage {number} Current page of the projection
    **/
    page(pageSize: number, currentPage?: number, scheduler?: IScheduler): IPagedObservableReadOnlyList<T>;
}

/**
* IObservablePagedReadOnlyList represents a virtual paging projection over an existing observable list
* @interface
**/
export interface IPagedObservableReadOnlyList<T> extends IObservableReadOnlyList<T> {
    source: IObservableReadOnlyList<T>;
    pageSize: IObservableProperty<number>;
    currentPage: IObservableProperty<number>;
    pageCount: IObservableProperty<number>;
}

/**
* IObservableList of T represents a list that can notify when its
* contents are changed (either items are added/removed, or the object
* itself changes).
* @interface
**/
export interface IObservableList<T> extends IProjectableObservableReadOnlyList<T> {
    set(index: number, item: T): any;

    add(item: T): void;
    push(item: T): void;
    clear(): void;
    remove(item: T): boolean;
    insert(index: number, item: T): void;
    removeAt(index: number): void;
    addRange(collection: Array<T>): void;
    insertRange(index: number, collection: Array<T>): void;
    move(oldIndex: any, newIndex: any): void;
    removeAll(itemsOrSelector: Array<T> | ((item: T) => boolean)): Array<T>;
    removeRange(index: number, count: number): void;
    reset(contents?: Array<T>): void;

    sort(comparison: (a: T, b: T) => number): void;
}

/**
/* This interface is implemented by I objects which are given
/* IObservables as input - when the input IObservables OnError, instead of
/* disabling the I object, we catch the Observable and pipe it into
/* this property.
/*
/* Normally this Observable is implemented with a ScheduledSubject whose
/* default Observer is app.defaultExceptionHandler - this means, that if
/* you aren't listening to thrownExceptions and one appears, the exception
/* will appear on the UI thread and crash the application.
/* @interface
**/
export interface IHandleObservableErrors {
    /**
    /* Fires whenever an exception would normally terminate the app
    /* internal state.
    **/
    thrownExceptions: Observable<Error>;
}

/**
/* ICommand represents an ICommand which also notifies when it is
/* executed (i.e. when Execute is called) via IObservable. Conceptually,
/* this represents an Event, so as a result this IObservable should never
/* onComplete or onError.
/* @interface
**/
export interface ICommand<T> extends IDisposable, IHandleObservableErrors {
    canExecute(parameter: any): boolean;
    execute(parameter: any): void;
    /**
    /* Gets a value indicating whether this instance can execute observable.
    **/
    canExecuteObservable: Observable<boolean>;
    /**
    /* Gets a value indicating whether this instance is executing. This
    /* Observable is guaranteed to always return a value immediately (i.e.
    /* it is backed by a BehaviorSubject), meaning it is safe to determine
    /* the current state of the command via IsExecuting.First()
    **/
    isExecuting: Observable<boolean>;
    /**
    /* Gets an observable that returns command invocation results
    **/
    results: Observable<T>;
    /**
    /* Executes a Command and returns the result asynchronously. This method
    /* makes it *much* easier to test Command, as well as create
    /* Commands who invoke inferior commands and wait on their results.
    /*
    /* Note that you **must** Subscribe to the Observable returned by
    /* ExecuteAsync or else nothing will happen (i.e. ExecuteAsync is lazy)
    /*
    /* Note also that the command will be executed, irrespective of the current value
    /* of the command's canExecute observable.
    /* @return An Observable representing a single invocation of the Command.
    /* @param parameter Don't use this.
    **/
    executeAsync(parameter?: any): Observable<T>;
}

/**
/* IMessageBus represents an object that can act as a "Message Bus", a
/* simple way for ViewModels and other objects to communicate with each
/* other in a loosely coupled way.
/*
/* Specifying which messages go where is done via the contract parameter
**/
export interface IMessageBus {
    /**
    /* Registers a scheduler for the type, which may be specified at
    /* runtime, and the contract.
    /*
    /* If a scheduler is already registered for the specified
    /* runtime and contract, this will overrwrite the existing
    /* registration.
    /*
    /* @param {string} contract A unique string to distinguish messages with
    /* identical types (i.e. "MyCoolViewModel")
    **/
    registerScheduler(scheduler: IScheduler, contract: string): void;
    /**
    /* Listen provides an Observable that will fire whenever a Message is
    /* provided for this object via RegisterMessageSource or SendMessage.
    /*
    /* @param {string} contract A unique string to distinguish messages with
    /* identical types (i.e. "MyCoolViewModel")
    **/
    listen<T>(contract: string): IObservable<T>;
    /**
    /* Determines if a particular message Type is registered.
    /* @param {string} The type of the message.
    /*
    /* @param {string} contract A unique string to distinguish messages with
    /* identical types (i.e. "MyCoolViewModel")
    /* @return True if messages have been posted for this message Type.
    **/
    isRegistered(contract: string): boolean;
    /**
    /* Registers an Observable representing the stream of messages to send.
    /* Another part of the code can then call Listen to retrieve this
    /* Observable.
    /*
    /* @param {string} contract A unique string to distinguish messages with
    /* identical types (i.e. "MyCoolViewModel")
    **/
    registerMessageSource<T>(source: Observable<T>, contract: string): IDisposable;
    /**
    /* Sends a single message using the specified Type and contract.
    /* Consider using RegisterMessageSource instead if you will be sending
    /* messages in response to other changes such as property changes
    /* or events.
    /*
    /* @param {T} message The actual message to send
    /* @param {string} contract A unique string to distinguish messages with
    /* identical types (i.e. "MyCoolViewModel")
    **/
    sendMessage<T>(message: T, contract: string): void;
}

/**
* .Net's Lazy<T>
* @class
*/
export class Lazy<T> {
    constructor(createValue: () => T);
    value: T;
    isValueCreated: boolean;
    private createValue;
    private createdValue;
}

export interface IResources {
    injector: string;
    messageBus: string;
    httpClient: string;
}

declare var messageBus: IMessageBus;

/**
/* Determines if target is an instance of a IObservableProperty
/* @param {any} target
**/
export function isProperty(target: any): boolean;

/**
/* Wraps an action in try/finally block and disposes the resource after the action has completed even if it throws an exception
/* (mimics C# using statement)
/* @param {IDisposable} disp The resource to dispose after action completes
/* @param {() => void} action The action to wrap
**/
export function using<T extends IDisposable>(disp: T, action: (disp?: T) => void): void;

/**
/* Turns an AMD-Style require call into an observable
/* @param {string} Module The module to load
/* @return {Observable<any>} An observable that yields a value and completes as soon as the module has been loaded
**/
export function observableRequire<T>(module: string): Observable<T>;

/**
/* Returns an observable that notifes of any observable property changes on the target
/* @param {any} target The object to observe
/* @return {Observable<T>} An observable
**/
export function whenAny<TRet, T1>(
    arg1: ObservableOrProperty<T1>,
    selector: (arg1: T1) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    selector: (arg1: T1, arg2: T2) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>,
    selector: (arg1: T1, arg2: T2, arg3: T3) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
    selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
    arg5: ObservableOrProperty<T5>,
    selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
    arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
    selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
    arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
    arg7: ObservableOrProperty<T7>,
    selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
    arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
    arg7: ObservableOrProperty<T7>, arg8: ObservableOrProperty<T8>,
    selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
    arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
    arg7: ObservableOrProperty<T7>, arg8: ObservableOrProperty<T8>,
    arg9: ObservableOrProperty<T9>,
    selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8,
        arg9: T9) => TRet): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
    arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
    arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
    arg7: ObservableOrProperty<T7>, arg8: ObservableOrProperty<T8>,
    arg9: ObservableOrProperty<T9>, arg10: ObservableOrProperty<T10>,
    selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8,
        arg9: T9, arg10: T10) => TRet): Observable<TRet>;

export function whenAny(...args: Array<ObservableOrProperty<any>>): Observable<any>;

/**
/* Creates an observable property with an optional default value
/* @param {T} initialValue?
**/
export function property<T>(initialValue?: T): IObservableProperty<T>;

/**
/* Creates a default Command that has a synchronous action.
/* @param {(any) => void} execute The action to executed when the command gets invoked
/* @param {Observable<boolean>} canExecute An Observable that determines when the Command can Execute. WhenAny is a great way to create this!
/* @param {IScheduler} scheduler The scheduler to deliver events on. Defaults to App.mainThreadScheduler
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<any>} A Command whose ExecuteAsync just returns the CommandParameter immediately. Which you should ignore!
**/
export function command(execute: (param: any) => void, canExecute?: Observable<boolean>, scheduler?: IScheduler, thisArg?: any): ICommand<any>;

/**
/* Creates a default Command that has a synchronous action.
/* @param {(any) => void} execute The action to executed when the command gets invoked
/* @param {Observable<boolean>} canExecute An Observable that determines when the Command can Execute. WhenAny is a great way to create this!
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<any>} A Command whose ExecuteAsync just returns the CommandParameter immediately. Which you should ignore!
**/
export function command(execute: (param: any) => void, canExecute?: Observable<boolean>, thisArg?: any): ICommand<any>;

/**
/* Creates a default Command that has a synchronous action.
/* @param {(any) => void} execute The action to executed when the command gets invoked
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<any>} A Command whose ExecuteAsync just returns the CommandParameter immediately. Which you should ignore!
**/
export function command(execute: (param: any) => void, thisArg?: any): ICommand<any>;

/**
/* Creates a default Command that has no background action.
/* @param {Observable<boolean>} canExecute An Observable that determines when the Command can Execute. WhenAny is a great way to create this!
/* @param {IScheduler} scheduler The scheduler to deliver events on. Defaults to App.mainThreadScheduler
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<any>} A Command whose ExecuteAsync just returns the CommandParameter immediately. Which you should ignore!
**/
export function command(canExecute?: Observable<boolean>, scheduler?: IScheduler): ICommand<any>;

/**
/* Creates a Command typed to the given executeAsync Observable method. Use this method if your background method returns IObservable
/* @param {(any) => Observable<T>} executeAsync Method to call that creates an Observable representing an operation to execute in the background. The Command's canExecute will be false until this Observable completes. If this Observable terminates with OnError, the Exception is marshaled to ThrownExceptions
/* @param {Observable<boolean>} canExecute An Observable that determines when the Command can Execute. WhenAny is a great way to create this!
/* @param {IScheduler} scheduler The scheduler to deliver events on. Defaults to App.mainThreadScheduler
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<T>} A Command which returns all items that are created via calling executeAsync as a single stream.
**/
export function asyncCommand<T>(canExecute: Observable<boolean>, executeAsync: (param: any) => Observable<T>, scheduler?: IScheduler, thisArg?: any): ICommand<T>;

/**
/* Creates a Command typed to the given executeAsync Observable method. Use this method if your background method returns IObservable
/* @param {(any) => Observable<T>} executeAsync Method to call that creates an Observable representing an operation to execute in the background. The Command's canExecute will be false until this Observable completes. If this Observable terminates with OnError, the Exception is marshaled to ThrownExceptions
/* @param {Observable<boolean>} canExecute An Observable that determines when the Command can Execute. WhenAny is a great way to create this!
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<T>} A Command which returns all items that are created via calling executeAsync as a single stream.
**/
export function asyncCommand<T>(canExecute: Observable<boolean>, executeAsync: (param: any) => Observable<T>, thisArg?: any): ICommand<T>;

/**
/* Creates a Command typed to the given executeAsync Observable method. Use this method if your background method returns IObservable
/* @param {(any) => Observable<T>} executeAsync Method to call that creates an Observable representing an operation to execute in the background. The Command's canExecute will be false until this Observable completes. If this Observable terminates with OnError, the Exception is marshaled to ThrownExceptions
/* @param {IScheduler} scheduler The scheduler to deliver events on. Defaults to App.mainThreadScheduler
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<T>} A Command which returns all items that are created via calling executeAsync as a single stream.
**/
export function asyncCommand<T>(executeAsync: (param: any) => Observable<T>, scheduler?: IScheduler, thisArg?: any): ICommand<T>;

/**
/* Creates a Command typed to the given executeAsync Observable method. Use this method if your background method returns IObservable
/* @param {(any) => Observable<T>} executeAsync Method to call that creates an Observable representing an operation to execute in the background. The Command's canExecute will be false until this Observable completes. If this Observable terminates with OnError, the Exception is marshaled to ThrownExceptions
/* @param {any} thisArg Object to use as this when executing the executeAsync
/* @return {Command<T>} A Command which returns all items that are created via calling executeAsync as a single stream.
**/
export function asyncCommand<T>(executeAsync: (param: any) => Observable<T>, thisArg?: any): ICommand<T>;

/**
/* Determines if target is an instance of a ICommand
/* @param {any} target
**/
export function isCommand(target: any): boolean;

declare var res: IResources;

declare var injector: IInjector;

/**
/* Creates a new observable list with optional default contents
/* @param {Array<T>} initialContents The initial contents of the list
/* @param {number = 0.3} resetChangeThreshold
**/
export function list<T>(initialContents?: Array<T>, resetChangeThreshold?: number, scheduler?: IScheduler): IObservableList<T>;

/**
/* Determines if target is an instance of a IObservableList
/* @param {any} target
**/
export function isList(target: any): boolean;

export interface IHttpClientOptions {
    url?: string;
    method?: string;
    params?: Object;
    data?: any;
    headers?: Object;
    raw?: boolean;  // do not deserialize response text
    dump?: (value: any)=> string;
    load?: (text: string)=> Object;
    xmlHttpRequest?: ()=> XMLHttpRequest;
    promise?: (executor: (resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => void)=> IPromise<any>;
}

export interface IHttpClient {
    /**
    * Performs a http-get-request
    *
    * @param {string} url The request url
    * @param {Object} params Query string parameters to be appended to the request url. Values will be uri-encoded
    * @param {IHttpClientOptions} options Configuration options, overriding the instance's current configuration
    **/
    get<T>(url: string, params?: Object, options?: IHttpClientOptions): IPromise<T>;

    /**
    * Performs a http-put-request
    *
    * @param {string} url The request url
    * @param {any} data The data to be sent to the server
    * @param {IHttpClientOptions} options Configuration options, overriding the instance's current configuration
    **/
    put<T>(url: string, data: any, options?: IHttpClientOptions): IPromise<T>;

    /**
    * Performs a http-post-request
    *
    * @param {string} url The request url
    * @param {any} data The data to be sent to the server
    * @param {IHttpClientOptions} options Configuration options, overriding the instance's current configuration
    **/
    post<T>(url: string, data: any, options?: IHttpClientOptions): IPromise<T>;

    /**
    * Performs a http-patch-request
    *
    * @param {string} url The request url
    * @param {any} data The data to be sent to the server
    * @param {IHttpClientOptions} options Configuration options, overriding the instance's current configuration
    **/
    patch<T>(url: string, data: any, options?: IHttpClientOptions): IPromise<T>;

    /**
    * Performs a http-delete-request
    *
    * @param {string} url The request url
    * @param {IHttpClientOptions} options Configuration options, overriding the instance's current configuration
    **/
    delete(url: string, options?: IHttpClientOptions): IPromise<any>;

    /**
    * Performs a http-options-request
    *
    * @param {string} url The request url
    * @param {IHttpClientOptions} options Configuration options, overriding the instance's current configuration
    **/
    options(url: string, options?: IHttpClientOptions): IPromise<any>;

    /**
    * Performs a http-request according to the specified options
    *
    * @param {IHttpClientOptions} options Configuration options, overriding the instance's current configuration
    **/
    request<T>(options: IHttpClientOptions): IPromise<T>;

    /**
    * Configures this HttpClient instance
    *
    * @param {IHttpClientOptions} opts The configuration object
    **/
    configure(opts: IHttpClientOptions): void;
}

/**
* Provides editable configuration defaults for all newly created HttpClient instances.
**/
export function getHttpClientDefaultConfig(): IHttpClientOptions;

declare module 'rx' {
  interface Observable<T> {
    toProperty(initialValue?: T): IObservableReadOnlyProperty<T>;

    invokeCommand<TResult>(command: ICommand<TResult>): IDisposable;
    invokeCommand<TResult>(commandSelector: (x: T) => ICommand<TResult>): IDisposable;
  }
}
