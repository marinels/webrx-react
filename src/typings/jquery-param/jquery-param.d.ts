declare namespace __JQueryParam {
  interface JQueryParamStatic {
    (obj: Object): string;
  }
}

declare module 'jquery-param' {
    var param: __JQueryParam.JQueryParamStatic;
    export = param;
}

declare var param: __JQueryParam.JQueryParamStatic;
