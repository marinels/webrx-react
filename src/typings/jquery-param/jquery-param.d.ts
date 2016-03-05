declare namespace __JQueryParam {
  interface JQueryParamStatic {
    (obj: any): string;
  }
}

declare module 'jquery-param' {
    let param: __JQueryParam.JQueryParamStatic;
    export = param;
}

declare let param: __JQueryParam.JQueryParamStatic;
