declare module 'jquery-deparam' {
  function deparam<T>(params: string, coerce?: boolean): T;

  namespace deparam {}
  export = deparam;
}
