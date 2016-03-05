declare namespace __JQueryDeparam {
  interface JQueryDeparamStatic {
    (params: string, coerce?: boolean): any;
    <T>(params: string, coerce?: boolean): T;
  }
}

declare module 'jquery-deparam' {
    let deparam: __JQueryDeparam.JQueryDeparamStatic;
    export = deparam;
}

declare let deparam: __JQueryDeparam.JQueryDeparamStatic;
