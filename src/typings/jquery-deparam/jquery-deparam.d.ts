declare namespace __JQueryDeparam {
  interface JQueryDeparamStatic {
    (params: string, coerce?: boolean): any;
    <T>(params: string, coerce?: boolean): T;
  }
}

declare module 'jquery-deparam' {
    const deparam: __JQueryDeparam.JQueryDeparamStatic;
    export = deparam;
}
