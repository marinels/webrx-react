declare namespace __JQueryDeparam {
  interface JQueryDeparamStatic {
    (params: string, coerce?: boolean): Object;
  }
}

declare module 'jquery-deparam' {
    var deparam: __JQueryDeparam.JQueryDeparamStatic;
    export = deparam;
}

declare var deparam: __JQueryDeparam.JQueryDeparamStatic;
