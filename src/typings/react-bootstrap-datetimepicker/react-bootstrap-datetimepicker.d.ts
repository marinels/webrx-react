/// <reference path="../../../typings/main/ambient/react/react.d.ts" />
/// <reference path="../../../typings/main/ambient/moment-node/moment-node.d.ts" />

declare namespace __ReactBootstrapDateTimePicker {
  interface DateTimeFieldProps {
    dateTime?: string | number;
    format?: string;
    inputFormat?: string;
    onChange?: Function;
    showToday?: boolean;
    size?: string;
    daysOfWeekDisabled?: Array<number>;
    viewMode?: string | number;
    inputProps?: any;
    minDate?: moment.Moment;
    maxDate?: moment.Moment;
    mode?: string;
    defaultText?: string;
  }

  interface DateTimeField extends __React.ReactElement<DateTimeFieldProps> { }
  interface DateTimeFieldClass extends __React.ComponentClass<DateTimeFieldProps> { }
}

declare module 'react-bootstrap-datetimepicker' {
  let DateTimeField: __ReactBootstrapDateTimePicker.DateTimeFieldClass;
  export = DateTimeField;
}
