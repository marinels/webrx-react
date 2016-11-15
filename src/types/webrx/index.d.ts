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
/* The WeakMap object is a collection of key/value pairs in which the keys are objects and the values can be arbitrary values. The keys are held using weak references.
/* @interface
**/
export interface IWeakMap<TKey extends Object, T> {
    set(key: TKey, value: T): void;
    get(key: TKey): T;
    has(key: TKey): boolean;
    delete(key: TKey): void;
    isEmulated: boolean;
}
/**
/* The Set object lets you store unique values of any type, whether primitive values or object references.
/* @interface
**/
export interface ISet<T> {
    add(value: T): ISet<T>;
    has(key: T): boolean;
    delete(key: T): boolean;
    clear(): void;
    forEach(callback: (item: T) => void, thisArg?: any): void;
    size: number;
    isEmulated: boolean;
}
/**
/* The Map object is a simple key/value map. Any value (both objects and primitive values) may be used as either a key or a value.
/* @interface
**/
export interface IMap<TKey extends Object, T> {
    set(key: TKey, value: T): void;
    get(key: TKey): T;
    has(key: TKey): boolean;
    delete(key: TKey): void;
    clear(): void;
    forEach(callback: (value: T, key: TKey, map: IMap<TKey, T>) => void, thisArg?: any): void;
    size: number;
    isEmulated: boolean;
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
/* Data context used in binding operations
/* @interface
**/
export interface IDataContext {
    $data: any;
    $root: any;
    $parent: any;
    $parents: any[];
}
/**
/* Extensible Node state
/* @interface
**/
export interface INodeState {
    cleanup: CompositeDisposable;
    isBound: boolean;
    model?: any;
    module?: any;
}
export interface IObjectLiteralToken {
    key?: string;
    unknown?: string;
    value?: string;
}
export interface IExpressionFilter {
    (...args: Array<any>): any;
}
export interface IExpressionCompilerOptions {
    disallowFunctionCalls?: boolean;
    filters?: {
        [filterName: string]: IExpressionFilter;
    };
}
export interface ICompiledExpression {
    (scope?: any, locals?: any): any;
    literal?: boolean;
    constant?: boolean;
    assign?: (self: any, value: any, locals: any) => any;
}
export interface ICompiledExpressionRuntimeHooks {
    readFieldHook?: (o: any, field: any) => any;
    writeFieldHook?: (o: any, field: any, newValue: any) => any;
    readIndexHook?: (o: any, field: any) => any;
    writeIndexHook?: (o: any, field: any, newValue: any) => any;
}
export interface IExpressionCompiler {
    compileExpression(src: string, options?: IExpressionCompilerOptions, cache?: {
        [exp: string]: ICompiledExpression;
    }): ICompiledExpression;
    getRuntimeHooks(locals: any): ICompiledExpressionRuntimeHooks;
    setRuntimeHooks(locals: any, hooks: ICompiledExpressionRuntimeHooks): void;
    parseObjectLiteral(objectLiteralString: any): Array<IObjectLiteralToken>;
}
export interface IAnimation {
    prepare(element: Node | Array<Node> | HTMLElement | Array<HTMLElement> | NodeList, params?: any): void;
    run(element: Node | Array<Node> | HTMLElement | Array<HTMLElement> | NodeList, params?: any): Observable<any>;
    complete(element: Node | Array<Node> | HTMLElement | Array<HTMLElement> | NodeList, params?: any): void;
}
export interface IAnimationCssClassInstruction {
    css: string;
    add: boolean;
    remove: boolean;
}
/**
/* The Dom Manager coordinates everything involving browser DOM-Manipulation
/* @interface
**/
    interface IDomManager {
    /**
    /* Applies bindings to the specified node and all of its children using the specified data context
    /* @param {IDataContext} ctx The data context
    /* @param {Node} rootNode The node to be bound
    **/
    applyBindings(model: any, rootNode: Node): void;
    /**
    /* Applies bindings to all the children of the specified node but not the node itself using the specified data context.
    /* You generally want to use this method if you are authoring a new binding handler that handles children.
    /* @param {IDataContext} ctx The data context
    /* @param {Node} rootNode The node to be bound
    **/
    applyBindingsToDescendants(ctx: IDataContext, rootNode: Node): void;
    /**
    /* Removes and cleans up any binding-related state from the specified node and its descendants.
    /* @param {Node} rootNode The node to be cleaned
    **/
    cleanNode(rootNode: Node): void;
    /**
    /* Removes and cleans up any binding-related state from all the children of the specified node but not the node itself.
    /* @param {Node} rootNode The node to be cleaned
    **/
    cleanDescendants(rootNode: Node): void;
    /**
    /* Stores updated state for the specified node
    /* @param {Node} node The target node
    /* @param {IBindingState} state The updated node state
    **/
    setNodeState(node: Node, state: INodeState): void;
    /**
    /* Computes the actual data context starting at the specified node
    /* @param {Node} node The node to be bound
    /* @return {IDataContext} The data context to evaluate the expression against
    **/
    getDataContext(node: Node): IDataContext;
    /**
    /* Retrieves the current node state for the specified node
    /* @param {Node} node The target node
    **/
    getNodeState(node: Node): INodeState;
    /**
    /* Initializes a new node state
    /* @param {any} model The model
    **/
    createNodeState(model?: any): INodeState;
    /**
    /* Returns true if the node is currently bound by one or more binding-handlers
    /* @param {Node} node The node to check
    **/
    isNodeBound(node: Node): boolean;
    /**
    /* Removes any binding-related state from the specified node. Use with care! In most cases you would want to use cleanNode!
    /* @param {Node} node The node to clear
    **/
    clearNodeState(node: Node): any;
    /**
    /* Compiles a simple string expression or multiple expressions within an object-literal recursively into an expression tree
    /* @param {string} value The expression(s) to compile
    **/
    compileBindingOptions(value: string, module: IModule): any;
    /**
    /* Tokenizes an object-literal into an array of key-value pairs
    /* @param {string} value The object literal tokenize
    **/
    getObjectLiteralTokens(value: string): Array<IObjectLiteralToken>;
    /**
    /* Returns data-binding expressions for a DOM-Node
    /* @param {Node} node The node
    **/
    getBindingDefinitions(node: Node): Array<{
        key: string;
        value: string;
    }>;
    /**
    /* Registers hook that gets invoked whenever a new data-context gets assembled
    /* @param {Node} node The node for which the data-context gets assembled
    /* @param {IDataContext} ctx The current data-context
    **/
    registerDataContextExtension(extension: (node: Node, ctx: IDataContext) => void): any;
    /**
    /* Evaluates an expression against a data-context and returns the result
    /* @param {IExpressionFunc} exp The source expression
    /* @param {IExpressionFunc} evalObs Allows monitoring of expression evaluation passes (for unit testing)
    /* @param {IDataContext} The data context to evaluate the expression against
    /* @return {any} A value representing the result of the expression-evaluation
    **/
    evaluateExpression(exp: ICompiledExpression, ctx: IDataContext): any;
    /**
    /* Creates an observable that produces values representing the result of the expression.
    /* If any observable input of the expression changes, the expression gets re-evaluated
    /* and the observable produces a new value.
    /* @param {IExpressionFunc} exp The source expression
    /* @param {IExpressionFunc} evalObs Allows monitoring of expression evaluation passes (for unit testing)
    /* @param {IDataContext} The data context to evaluate the expression against
    /* @return {Observable<any>} A sequence of values representing the result of the last evaluation of the expression
    **/
    expressionToObservable(exp: ICompiledExpression, ctx: IDataContext, evalObs?: Observer<any>): Observable<any>;
}
/**
/* Bindings are markers on a DOM element (such as an attribute or comment) that tell
/* Webs DOM compiler to attach a specified behavior to that DOM element or even
/* transform the element and its children.
/* @interface
**/
export interface IBindingHandler {
    /**
    /* Applies the binding to the specified element
    /* @param {Node} node The target node
    /* @param {any} options The options for the handler
    /* @param {IDataContext} ctx The curent data context
    /* @param {IDomElementState} state State of the target element
    /* @param {IModule} module The module bound to the current binding scope
    **/
    applyBinding(node: Node, options: string, ctx: IDataContext, state: INodeState, module: IModule): void;
    /**
    /* Configures the handler using a handler-specific options object
    /* @param {any} options The handler-specific options
    **/
    configure(options: any): void;
    /**
    /* When there are multiple bindings defined on a single DOM element,
    /* sometimes it is necessary to specify the order in which the bindings are applied.
    **/
    priority: number;
    /**
    /* If set to true then bindings won't be applied to children
    /* of the element such binding is encountered on. Instead
    /* the handler will be responsible for that.
    **/
    controlsDescendants?: boolean;
}

/**
* Simplified binding-handler
* @interface
**/
export interface ISimpleBindingHandler {
    init?(el: HTMLElement, value: any, ctx: IDataContext, domManager: IDomManager, state: any, cleanup: CompositeDisposable, module: IModule): void;
    update(el: HTMLElement, value: any, ctx: IDataContext, domManager: IDomManager, state: any, cleanup: CompositeDisposable, module: IModule): void;
    cleanup?(el: HTMLElement, domManager: IDomManager, state: any, cleanup: CompositeDisposable, module: IModule): void;
}

export interface IBindingRegistry {
    binding(name: string, handler: IBindingHandler|ISimpleBindingHandler, controlsDescendants?: boolean): IBindingRegistry;
    binding(name: string, handler: string): IBindingRegistry;
    binding(names: string[], handler: IBindingHandler): IBindingRegistry;
    binding(names: string[], handler: string): IBindingRegistry;
    binding(name: string): IBindingHandler;
}

export interface IComponentTemplateDescriptor {
    require?: string;
    promise?: IPromise<Node[]>;
    observable?: Observable<Node[]>;
    resolve?: string;
    element?: string | Node;
}
export interface IComponentViewModelDescriptor {
    require?: string;
    promise?: IPromise<any>;
    observable?: Observable<any>;
    resolve?: string;
    instance?: any;
}
export interface IComponentDescriptor {
    require?: string;
    resolve?: string;
    template?: string|Node[]|IComponentTemplateDescriptor|((params?: any)=> string|Node[]|Observable<Node[]>);
    viewModel?: Array<any>|IComponentViewModelDescriptor|((params: any)=> any|Observable<any>);
    preBindingInit?: string;
    postBindingInit?: string;
}
export interface IComponent {
    template?: Node[];
    viewModel?: any;
    preBindingInit?: string;
    postBindingInit?: string;
}
export interface IComponentRegistry {
    component(name: string, descriptor: IComponentDescriptor): IComponentRegistry;
    hasComponent(name: string): boolean;
    loadComponent(name: string, params?: Object): Observable<IComponent>;
}
export interface IExpressionFilterRegistry {
    filter(name: string, filter: IExpressionFilter): IExpressionFilterRegistry;
    filter(name: string): IExpressionFilter;
    filters(): {
        [filterName: string]: IExpressionFilter;
    };
}
export interface IAnimationRegistry {
    animation(name: string, animation: IAnimation): IAnimationRegistry;
    animation(name: string): IAnimation;
}
export interface IModuleDescriptor {
    (module: IModule): void;
    require?: string;
    promise?: IPromise<string>;
    resolve?: string;
    instance?: any;
}
export interface IModule extends IComponentRegistry, IBindingRegistry, IExpressionFilterRegistry, IAnimationRegistry {
    name: string;
    merge(other: IModule): IModule;
}
/**
/* Represents an engine responsible for converting arbitrary text fragements into a collection of Dom Nodes
/* @interface
**/
export interface ITemplateEngine {
    parse(templateSource: string): Node[];
}
export interface IWebpp extends IModule {
    defaultExceptionHandler: Observer<Error>;
    mainThreadScheduler: IScheduler;
    templateEngine: ITemplateEngine;
    history: IHistory;
    title: IObservableProperty<string>;
    version: string;
    devModeEnable(): void;
}
export interface IRoute {
    parse(url: any): Object;
    stringify(params?: Object): string;
    concat(route: IRoute): IRoute;
    isAbsolute: boolean;
    params: Array<string>;
}
export interface IViewAnimationDescriptor {
    enter?: string | IAnimation;
    leave?: string | IAnimation;
}
export interface IRouterStateConfig {
    name: string;
    url?: string | IRoute;
    views?: {
        [view: string]: string | {
            component: string;
            params?: any;
            animations?: IViewAnimationDescriptor;
        };
    };
    params?: any;
    onEnter?: (config: IRouterStateConfig, params?: any) => void;
    onLeave?: (config: IRouterStateConfig, params?: any) => void;
}
export interface IRouterState {
    name: string;
    url: string;
    params: any;
    views: {
        [view: string]: string | {
            component: string;
            params?: any;
            animations?: IViewAnimationDescriptor;
        };
    };
    onEnter?: (config: IRouterStateConfig, params?: any) => void;
    onLeave?: (config: IRouterStateConfig, params?: any) => void;
}
export interface IViewConfig {
    component: string;
    params?: any;
    animations?: IViewAnimationDescriptor;
}
export interface IViewTransition {
    view: string;
    fromComponent?: string;
    toComponent: string;
}
declare const enum RouterLocationChangeMode {
    add = 1,
    replace = 2,
}
export interface IStateChangeOptions {
/**
/* If true will update the url in the location bar, if false will not.
**/
    location?: boolean | RouterLocationChangeMode;
/**
/* If true will force transition even if the state or params have not changed, aka a reload of the same state.
**/
    force?: boolean;
}
export interface IHistory {
    onPopState: Observable<PopStateEvent>;
    location: Location;
    length: number;
    state: any;
    back(): void;
    forward(): void;
    replaceState(statedata: any, title: string, url?: string): void;
    pushState(statedata: any, title: string, url?: string): void;
    getSearchParameters(query?: string): Object;
}
export interface IRouter {
    /**
    /* Transitions to the state inferred from the specified url or the browser's current location
    /* This method should be invoked once after registering application states.
    /* @param {string} url If specified the router state will be synced to this value, otherwise to window.location.path
    **/
    sync(url?: string): void;
    /**
    /* Registers a state configuration under a given state name.
    /* @param {IRouterStateConfig} config State configuration to register
    **/
    state(config: IRouterStateConfig): IRouter;
    /**
    /* Represents the configuration object for the router's
    **/
    current: IObservableProperty<IRouterState>;
    /**
    /* An observable that notifies of completed view transitions in response to router state changes
    **/
    viewTransitions: Observable<IViewTransition>;
    /**
    /* Invoke this method to programatically alter or extend IRouter.current.params.
    /* Failure to modify params through this method will result in those modifications getting lost after state transitions.
    **/
    updateCurrentStateParams(withParamsAction: (params: any) => void): void;
    /**
    /* Method for transitioning to a new state.
    /* @param {string} to Absolute or relative destination state path. 'contact.detail' - will go to the
    /* contact.detail state. '^'  will go to a parent state. '^.sibling' - will go to a sibling state and
    /* '.child.grandchild' will go to grandchild state
    /* @param {Object} params A map of the parameters that will be sent to the state.
    /* Any parameters that are not specified will be inherited from currently defined parameters.
    /* @param {IStateChangeOptions} options Options controlling how the state transition will be performed
    **/
    go(to: string, params?: Object, options?: IStateChangeOptions): void;
    /**
    /* An URL generation method that returns the URL for the given state populated with the given params.
    /* @param {string} state Absolute or relative destination state path. 'contact.detail' - will go to the
    /* contact.detail state. '^'  will go to a parent state. '^.sibling' - will go to a sibling state and
    /* '.child.grandchild' will go to grandchild state
    /* @param {Object} params An object of parameter values to fill the state's required parameters.
    **/
    url(state: string, params?: {}): string;
    /**
    /* A method that force reloads the current state. All resolves are re-resolved, events are not re-fired,
    /* and components reinstantiated.
    **/
    reload(): void;
    /**
    /* Returns the state configuration object for any specific state.
    /* @param {string} state Absolute state path.
    **/
    get(state: string): IRouterStateConfig;
    /**
    /* Similar to IRouter.includes, but only checks for the full state name. If params is supplied then it will
    /* be tested for strict equality against the current active params object, so all params must match with none
    /* missing and no extras.
    /* @param {string} state Absolute state path.
    **/
    is(state: string, params?: any, options?: any): any;
    /**
    /* A method to determine if the current active state is equal to or is the child of the state stateName.
    /* If any params are passed then they will be tested for a match as well. Not all the parameters need
    /* to be passed, just the ones you'd like to test for equality.
    /* @param {string} state Absolute state path.
    **/
    includes(state: string, params?: any, options?: any): any;
    /**
    /* Resets internal state configuration to defaults (for unit-testing)
    **/
    reset(): void;
    /**
    /* Returns the view-configuration for the specified view at the current state
    **/
    getViewComponent(viewName: string): IViewConfig;
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
export interface ICommandBindingOptions {
    command: ICommand<any>;
    parameter?: any;
}
export interface IComponentBindingOptions {
    name: string;
    params?: Object;
}
export interface IEventBindingOptions {
    [eventName: string]: (ctx: IDataContext, event: Event) => any | Observer<Event> | {
        command: ICommand<any>;
        parameter: any;
    };
}
export interface IForeachAnimationDescriptor {
    itemEnter?: string | IAnimation;
    itemLeave?: string | IAnimation;
}
export interface IForEachBindingOptions extends IForeachAnimationDescriptor {
    data: any;
    hooks?: IForEachBindingHooks | string;
}
export interface IForEachBindingHooks {
    /**
    /* Is invoked each time the foreach block is duplicated and inserted into the document,
    /* both when foreach first initializes, and when new entries are added to the associated
    /* array later
    **/
    afterRender?(nodes: Node[], data: any): void;
    /**
    /* Is like afterRender, except it is invoked only when new entries are added to your array
    /* (and not when foreach first iterates over your array’s initial contents).
    /* A common use for afterAdd is to call a method such as jQuery’s $(domNode).fadeIn()
    /* so that you get animated transitions whenever items are added
    **/
    afterAdd?(nodes: Node[], data: any, index: number): void;
    /**
    /* Is invoked when an array item has been removed, but before the corresponding
    /* DOM nodes have been removed. If you specify a beforeRemove callback, then it
    /* becomes your responsibility to remove the DOM nodes. The obvious use case here
    /* is calling something like jQuery’s $(domNode).fadeOut() to animate the removal
    /* of the corresponding DOM nodes — in this case, Webcannot know how soon
    /* it is allowed to physically remove the DOM nodes (who knows how long your
    /* animation will take?)
    **/
    beforeRemove?(nodes: Node[], data: any, index: number): void;
    /**
    /* Is invoked when an array item has changed position in the array, but before
    /* the corresponding DOM nodes have been moved. You could use beforeMove
    /* to store the original screen coordinates of the affected elements so that you
    /* can animate their movements in the afterMove callback.
    **/
    beforeMove?(nodes: Node[], data: any, index: number): void;
    /**
    /* Is invoked after an array item has changed position in the array, and after
    /* foreach has updated the DOM to match.
    **/
    afterMove?(nodes: Node[], data: any, index: number): void;
}
export interface IHasFocusBindingOptions {
    property: any;
    delay: number;
}
export interface IIfAnimationDescriptor {
    enter?: string | IAnimation;
    leave?: string | IAnimation;
}
export interface IIfBindingOptions extends IIfAnimationDescriptor {
    condition: string;
}
export interface IKeyPressBindingOptions {
    [key: string]: (ctx: IDataContext, event: Event) => any | ICommand<any> | {
        command: ICommand<any>;
        parameter: any;
    };
}
export interface IVisibleBindingOptions {
    useCssClass: boolean;
    hiddenClass: string;
}
export interface IRadioGroupComponentParams {
    items: any;
    groupName?: string;
    itemText?: string;
    itemValue?: string;
    itemClass?: string;
    selectedValue?: any;
    afterRender?(nodes: Node[], data: any): void;
    noCache?: boolean;
}
export interface ISelectComponentParams {
    name?: string;
    items: any;
    itemText?: string;
    itemValue?: string;
    itemClass?: string;
    cssClass?: string;
    multiple?: boolean;
    required?: boolean;
    autofocus?: boolean;
    size?: number;
    selectedValue?: any;
    afterRender?(nodes: Node[], data: any): void;
    noCache?: boolean;
}
export interface IBrowserProperties {
    version: number;
}
export interface IIEBrowserProperties extends IBrowserProperties {
    getSelectionChangeObservable(el: HTMLElement): Observable<Document>;
}
export interface IStateActiveBindingOptions {
    name: string;
    params?: Object;
    cssClass?: string;
}
export interface IStateRefBindingOptions {
    name: string;
    params?: Object;
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

/**
* VirtualChildNodes implements consisent and predictable manipulation
* of a DOM Node's childNodes collection regardless its the true contents
* @class
**/
export class VirtualChildNodes {
    constructor(targetNode: Node, initialSyncToTarget: boolean, insertCB?: (node: Node, callbackData: any) => void, removeCB?: (node: Node) => void);
    appendChilds(nodes: Node[], callbackData?: any): void;
    insertChilds(index: number, nodes: Node[], callbackData?: any): void;
    removeChilds(index: number, count: number, keepDom: boolean): Node[];
    clear(): void;
    targetNode: Node;
    childNodes: Array<Node>;
    private insertCB;
    private removeCB;
}

export interface IEnvironment {
    ie: IIEBrowserProperties;
    opera: IBrowserProperties;
    safari: IBrowserProperties;
    firefox: IBrowserProperties;
    isSupported: boolean;
}

export interface IResources {
    app: string;
    injector: string;
    domManager: string;
    router: string;
    messageBus: string;
    httpClient: string;
    expressionCompiler: string;
    templateEngine: string;
    hasValueBindingValue: string;
    valueBindingValue: string;
}

declare var app: IWebpp;
declare var router: IRouter;
declare var messageBus: IMessageBus;

export class IID {
    static IDisposable: string;
    static IObservableProperty: string;
    static IObservableReadOnlyProperty: string;
    static IObservableList: string;
    static ICommand: string;
    static IHandleObservableErrors: string;
}

export class PropertyInfo<T> {
    constructor(propertyName: string, property: T);
    propertyName: string;
    property: T;
}

declare var noop: () => void;
/**
/* Returns true if a ECMAScript5 strict-mode is active
**/
export function isStrictMode(): boolean;
/**
/* Returns true if target is a javascript primitive
**/
export function isPrimitive(target: any): boolean;
/**
/* Tests if the target supports the interface
/* @param {any} target
/* @param {string} iid
**/
export function queryInterface(target: any, iid: string): boolean;
/**
/* Returns all own properties of target implementing interface iid
/* @param {any} target
/* @param {string} iid
**/
export function getOwnPropertiesImplementingInterface<T>(target: any, iid: string): PropertyInfo<T>[];
/**
/* Determines if target is an instance of a IObservableProperty
/* @param {any} target
**/
export function isProperty(target: any): boolean;
/**
/* Determines if target is an instance of a Scheduler
/* @param {any} target
**/
export function ischeduler(target: any): boolean;
/**
/* Determines if target is an instance of a Observable
/* @param {any} target
**/
export function isbservable(target: any): boolean;
/**
/* If the prop is an observable property return its value
/* @param {any} prop
**/
export function unwrapProperty(prop: any): any;
/**
/* Returns true if a Unit-Testing environment is detected
**/
export function isInUnitTest(): boolean;
/**
/* Transforms the current method's arguments into an array
**/
export function args2Array(args: IArguments): Array<any>;
/**
/* Formats a string using .net style format string
/* @param {string} fmt The format string
/* @param {any[]} ...args Format arguments
**/
export function formatString(fmt: string, ...args: any[]): string;
/**
/* Copies own properties from src to dst
**/
export function extend(src: Object, dst: Object, inherited?: boolean): Object;
/**
* Determines if the specified DOM element has the specified CSS-Class
* @param {Node} node The target element
* @param {string} className The classe to check
*/
export function hasCssClass(node: HTMLElement, className: string): boolean;
/**
/* Toggles one ore more css classes on the specified DOM element
/* @param {Node} node The target element
/* @param {boolean} shouldHaveClass True if the classes should be added to the element, false if they should be removed
/* @param {string[} classNames The list of classes to process
**/
export function toggleCssClass(node: HTMLElement, shouldHaveClass: boolean, ...classNames: string[]): void;
/**
/* Trigger a reflow on the target element
/* @param {HTMLElement} el
**/
export function triggerReflow(el: HTMLElement): void;
/**
/* Returns true if the specified element may be disabled
/* @param {HTMLElement} el
**/
export function elementCanBeDisabled(el: HTMLElement): boolean;
/**
/* Returns true if object is a Function.
/* @param obj
**/
export function isFunction(obj: any): boolean;
/**
/* Returns true if object is a Disposable
/* @param obj
**/
export function isDisposable(obj: any): boolean;
/**
/* Performs an optimized deep comparison between the two objects, to determine if they should be considered equal.
/* @param a Object to compare
/* @param b Object to compare to
**/
export function isEqual(a: any, b: any, aStack?: any, bStack?: any): boolean;
/**
/* Returns an array of clones of the nodes in the source array
**/
export function cloneNodeArray(nodes: Array<Node>): Array<Node>;
/**
/* Converts a NodeList into a javascript array
/* @param {NodeList} nodes
**/
export function nodeListToArray(nodes: NodeList): Node[];
/**
/* Converts the node's children into a javascript array
/* @param {Node} node
**/
export function nodeChildrenToArray<T>(node: Node): T[];
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
/* FOR INTERNAL USE ONLY
/* Throw an error containing the specified description
**/
export function throwError(fmt: string, ...args: any[]): void;

/**
/* Registers a CSS-Transition based animation
/* @param {string} prepareTransitionClass The css class(es) to apply before the animation runs.
/* Both prepareTransitionClass and startTransitionClass will be removed automatically from the
/* elements targeted by the animation as soon as the transition has ended.
/* @param {string} startTransitionClass The css class(es) to apply to trigger the transition.
/* @param {string} completeTransitionClass The css class(es) to apply to trigger to the element
/* as soon as the animation has ended.
/* @returns {Observable<any>} An observable that signals that the animation is complete
**/
export function animation(prepareTransitionClass: string | Array<string> | Array<IAnimationCssClassInstruction>, startTransitionClass: string | Array<string> | Array<IAnimationCssClassInstruction>, completeTransitionClass?: string | Array<string> | Array<IAnimationCssClassInstruction>): IAnimation;
/**
/* Registers a scripted animation
/* @param {(element: HTMLElement, params?: any)=> Observable<any>} run The function that carries out the animation
/* @param {(element: HTMLElement, params?: any)=> void} prepare The function that prepares the targeted elements for the animation
/* @param {(element: HTMLElement, params?: any)=> void} complete The function that performs and cleanup on the targeted elements
/* after the animation has ended
/* @returns {Observable<any>} An observable that signals that the animation is complete
**/
export function animation(run: (element: HTMLElement, params?: any) => Observable<any>, prepare?: (element: HTMLElement, params?: any) => void, complete?: (element: HTMLElement, params?: any) => void): IAnimation;

/**
/* Creates an observable property with an optional default value
/* @param {T} initialValue?
**/
export function property<T>(initialValue?: T): IObservableProperty<T>;

/**
/* Applies bindings to the specified node and all of its children using the specified data context.
/* @param {any} model The model to bind to
/* @param {Node} rootNode The node to be bound
**/
export function applyBindings(model: any, node?: Node): void;
/**
/* Removes and cleans up any binding-related state from the specified node and its descendants.
/* @param {Node} rootNode The node to be cleaned
**/
export function cleanNode(node: Node): void;

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

declare var env: IEnvironment;
declare var res: IResources;

/**
/* Strips any external data associated with the node from it
/* @param {Node} node The node to clean
**/
declare var cleanExternalData: (node: Node) => void;
/**
/* Defines a module.
/* @param {string} name The module name
/* @return {IModule} The module handle
**/
export function module(name: string, descriptor: Array<any> | IModuleDescriptor): any;
/**
/* Instantiate a new module instance and configure it using the user supplied configuration
/* @param {string} name The module name
/* @return {IModule} The module handle
**/
export function loadModule(name: string): Observable<IModule>;

export function route(route: any, rules?: any): IRoute;

/**
/* For certain elements such as select and input type=radio we store
/* the real element value in NodeState if it is anything other than a
/* string. This method returns that value.
/* @param {Node} node
/* @param {IDomManager} domManager
**/
export function getNodeValue(node: Node, domManager: IDomManager): any;
/**
/* Associate a value with an element. Either by using its value-attribute
/* or storing it in NodeState
/* @param {Node} node
/* @param {any} value
/* @param {IDomManager} domManager
**/
export function setNodeValue(node: Node, value: any, domManager: IDomManager): void;

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

/**
/* Creates a new WeakMap instance
/* @param {boolean} disableNativeSupport Force creation of an emulated implementation, regardless of browser native support.
/* @return {IWeakMap<TKey, T>} A new instance of a suitable IWeakMap implementation
**/
export function createWeakMap<TKey, T>(disableNativeSupport?: boolean): IWeakMap<TKey, T>;

/**
/* Creates a new WeakMap instance
/* @param {boolean} disableNativeSupport Force creation of an emulated implementation, regardless of browser native support.
/* @return {IWeakMap<TKey, T>} A new instance of a suitable IWeakMap implementation
**/
export function createMap<TKey, T>(disableNativeSupport?: boolean): IMap<TKey, T>;

/**
/* Creates a new Set instance
/* @param {boolean} disableNativeSupport Force creation of an emulated implementation, regardless of browser native support.
/* @return {ISet<T>} A new instance of a suitable ISet implementation
**/
export function createSet<T>(disableNativeSupport?: boolean): ISet<T>;
/**
/* Extracts the values of a Set by invoking its forEach method and capturing the output
**/
export function setToArray<T>(src: ISet<T>): Array<T>;

/**
* Returns the objects unique id or assigns it if unassigned
* @param {any} o
*/
export function getOid(o: any): string;

/**
* Base class for one-way bindings that take a single expression and apply the result to one or more target elements
* @class
*/
export class SingleOneWayBindingBase implements IBindingHandler {
    constructor(domManager: IDomManager, app: IWebpp);
    applyBinding(node: Node, options: string, ctx: IDataContext, state: INodeState, module: IModule): void;
    configure(options: any): void;
    priority: number;
    protected domManager: IDomManager;
    protected app: IWebpp;
    protected applyValue(el: HTMLElement, value: any): void;
}

/**
* Base class for one-way bindings that take multiple expressions defined as object literal and apply the result to one or more target elements
* @class
*/
export class MultiOneWayBindingBase implements IBindingHandler {
    constructor(domManager: IDomManager, app: IWebpp, supportsDynamicValues?: boolean);
    applyBinding(node: Node, options: string, ctx: IDataContext, state: INodeState, module: IModule): void;
    configure(options: any): void;
    priority: number;
    protected supportsDynamicValues: boolean;
    protected domManager: IDomManager;
    protected app: IWebpp;
    private subscribe(el, obs, key, state);
    protected applyValue(el: HTMLElement, key: string, value: any): void;
}

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
