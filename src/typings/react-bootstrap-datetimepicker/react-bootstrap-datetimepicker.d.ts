/// <reference path="../../../typings/main/ambient/react/index.d.ts" />
/// <reference path="../../../typings/main/ambient/moment-node/index.d.ts" />

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
  const DateTimeField: DateTimeFieldClass;
}

declare module 'react-bootstrap-datetimepicker' {
  export = __ReactBootstrapDateTimePicker.DateTimeField;
}
