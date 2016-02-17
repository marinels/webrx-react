///<reference path="../react/react.d.ts"/>
/// <reference path="../moment/moment.d.ts"/>

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

  interface DateTimeField extends React.ReactElement<DateTimeFieldProps> { }
  interface DateTimeFieldClass extends React.ComponentClass<DateTimeFieldProps> { }
}

declare module 'react-bootstrap-datetimepicker' {
  var DateTimeField: __ReactBootstrapDateTimePicker.DateTimeFieldClass;
  export = DateTimeField;
}
