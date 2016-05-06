declare namespace __JQueryParam {
  interface JQueryParamStatic {
    (obj: any): string;
  }
}

declare module 'jquery-param' {
    const param: __JQueryParam.JQueryParamStatic;
    export = param;
}
