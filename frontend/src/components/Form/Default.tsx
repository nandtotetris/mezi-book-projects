import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Tooltip,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { FormComponentProps, ValidationRule } from 'antd/lib/form';
import { RadioChangeEvent } from 'antd/lib/radio';
import { OptionProps } from 'antd/lib/select';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import { BtnType, Button } from 'components/Button';
import { Moment } from 'moment';
import * as React from 'react';

const Search = Input.Search;

const FormItem = Form.Item;

/**
 * type for antd `getFieldDecorator` validation rules
 * @see https://ant.design/components/form/
 *
 * @param message: string;
 * @param pattern?: RegExp;
 * @param required: boolean;
 */
export type InputRules = ValidationRule;

/**
 * Enum of `input html` type for if equal
 * @type Checkbox (a special case see Class for more information)
 * @type Email
 * @type Password
 * @type Text
 */
export enum IType {
  Hidden = 'hidden',
  Checkbox = 'checkbox',
  Date = 'date',
  Email = 'email',
  Password = 'password',
  Text = 'text',
  Number = 'number',
  Autocomplete = 'autocomplete',
  Search = 'search',
  Select = 'select',
  Slider = 'slider',
  Radios = 'radios',
}

export interface IDefaultProps extends FormComponentProps {
  autoFocus?: boolean;
  autoComplete?: string | undefined;
  children?: React.ReactNode;
  options?: React.ReactNode;
  id: string;
  inputRef?: (node: HTMLInputElement) => void;
  checkboxRef?: (node: Checkbox) => void;
  label: string | React.ReactNode;
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputKeyUp?: (value: string) => void;
  onChange?: (node: React.ChangeEvent) => void;
  onChangeDate?: (date: Moment, dateString: string) => void;
  onChangeSelect?: (
    value: Moment,
    option: React.ReactElement<any> | Array<React.ReactElement<any>>,
  ) => void;
  onCheck?: (node: CheckboxChangeEvent) => void;
  format?: string;
  placeholder?: string;
  rules: ValidationRule[];
  validateTrigger?: string | string[];
  type: IType;
  hint?: string | React.ReactNode;
  loading?: boolean;
  open?: boolean;
  getCalendarContainer?: () => HTMLElement;
  size?: string;
  maxLength?: number;
  disabled?: boolean;
  labelInValue?: boolean;
  filterOption?:
    | boolean
    | ((inputValue: string, option: React.ReactElement<OptionProps>) => any);
  value?: any;
  values?: any;
  defaultValue?: any;
  defaultChecked?: any;
  className?: string;
  // addonBefore?: PropTypes.ReactNodeLike;
  // addonAfter?: PropTypes.ReactNodeLike;
  onPressEnter?: (...args: any[]) => any;
  onKeyDown?: (...args: any[]) => any;
  onKeyUp?: (...args: any[]) => any;
  onFocus?: (...args: any[]) => any;
  onBlur?: (...args: any[]) => any;
  onSearch?: (...args: any[]) => any;
  tipFormatter?: (value: number) => React.ReactNode;
  range?: boolean;
  prefix?: string | React.ReactNode;
  showSearch?: boolean;
  suffix?: string | React.ReactNode;
  enterButton?: React.ReactNode;
  button?: React.ReactNode;
  small?: boolean;
  marge?: boolean;
  mode?: 'default' | 'multiple' | 'tags' | 'combobox' | string;
}

/**
 * Default State
 *
 * error is set by antd `getFieldDecorator`
 * @see https://ant.design/components/form/
 */
export interface IDefaultState {
  defaultValue?: any;
  value?: any;
  active?: boolean;
  autofill?: boolean;
  error?: string;
}

/**
 * IDefault (input default)
 *
 * This is the base class used for inputs inside all the application
 */
class IDefault extends React.PureComponent<IDefaultProps, IDefaultState> {
  /** DEFAULT PROPS */
  static defaultProps: Partial<IDefaultProps> = {
    id: 'text',
    label: 'text',
    rules: [],
    type: IType.Text,
  };

  static getDerivedStateFromProps(props: IDefaultProps, state: IDefaultState) {
    if (props.defaultValue !== state.defaultValue && props.defaultValue) {
      return {
        active: true,
        defaultValue: props.defaultValue,
        value: props.defaultValue,
      };
    } else if (
      props.defaultValue !== state.defaultValue &&
      !props.defaultValue
    ) {
      return {
        active: false,
        defaultValue: props.defaultValue,
        value: props.defaultValue,
      };
    }
    return state;
  }

  /** DEFAULT STATE */
  state: Partial<IDefaultState> = {
    active: undefined,
    autofill: true,
    defaultValue: undefined,
    error: undefined,
    value: undefined,
  };

  /** ATTRIBUTES */
  handleInnerRef: (node: any) => void;
  handleChange?: (event: React.FocusEvent<HTMLInputElement>) => any;
  handleChangeDate?: (date: Moment, dateString: string) => any;
  handleChangeNumber?: (value: string | number | undefined) => any;
  handleChangeRadio?: (event: RadioChangeEvent) => any;
  handleChangeSelect?: (
    value: Moment,
    option: React.ReactElement<any> | Array<React.ReactElement<any>>,
  ) => void;
  handleOpenChangePopup?: (status: boolean) => any;
  handleBlur?: (event: React.FocusEvent<HTMLInputElement>) => any;
  handleFocus?: (event: React.FocusEvent<HTMLInputElement>) => any;
  handleBlurRef?: () => any;
  handleFocusRef?: () => any;

  /**
   * @function innerRef
   * Dispatch node if checkbox or input to the right parent function
   */
  nodeRef: Input | Checkbox | React.ClassicComponent | null = null;

  /** CONSTRUCTOR */
  constructor(props: any) {
    super(props);

    this.handleInnerRef = this.innerRef.bind(this);
    this.handleChange = this.change.bind(this);
    this.handleChangeDate = this.changeDate.bind(this);
    this.handleChangeRadio = this.changeRadio.bind(this);
    this.handleChangeNumber = this.changeNumber.bind(this);
    this.handleChangeSelect = this.changeSelect.bind(this);
    this.handleOpenChangePopup = this.openChangePopup.bind(this);
    this.handleBlur = this.blur.bind(this);
    this.handleFocus = this.focus.bind(this);
    this.handleBlurRef = this.blurRef.bind(this);
    this.handleFocusRef = this.focusRef.bind(this);
  }

  blur(event: React.FocusEvent<HTMLInputElement>) {
    const { onBlur } = this.props;
    if (event.currentTarget && event.currentTarget.value === '') {
      this.setState({ active: false });
    }
    onBlur && onBlur();
  }

  focus(event: React.FocusEvent<HTMLInputElement>) {
    const { onFocus } = this.props;
    this.setState({ active: true });
    onFocus && onFocus();
  }

  blurRef() {
    const { onBlur } = this.props;
    if (this.state.value === '' || this.state.value === null) {
      this.setState({ active: false });
    }
    onBlur && onBlur();
  }

  focusRef() {
    const { onFocus } = this.props;
    this.setState({ active: true });
    onFocus && onFocus();
  }

  change(event: React.FocusEvent<HTMLInputElement>) {
    const { onChange } = this.props;
    const { autofill } = this.state;

    if (autofill) {
      if (event.currentTarget.value !== '') {
        this.setState({ autofill: false, active: true });
      } else {
        this.setState({ autofill: false });
      }
    }
    if (event && event.currentTarget && event.currentTarget.value) {
      this.setState({ value: event.currentTarget.value.trim() });
      onChange && onChange(event);
    }
  }

  changeNumber(value: string | number | undefined) {
    this.setState({
      value,
    });
  }

  changeRadio = (e: RadioChangeEvent) => {
    const { onChange } = this.props;
    this.setState({
      value: e.target.value,
    });
    onChange && onChange(e as any);
  };

  changeDate(date: Moment, dateString: string) {
    const { onChangeDate } = this.props;
    const { autofill } = this.state;

    if (autofill) {
      if (date === null) {
        this.setState({ autofill: false });
      } else {
        this.setState({ autofill: false, active: true });
      }
    }
    this.setState({ value: date });
    onChangeDate && onChangeDate(date, dateString);
  }

  changeSelect(
    value: any,
    option: React.ReactElement<any> | Array<React.ReactElement<any>>,
  ) {
    const { onChangeSelect } = this.props;
    const { autofill } = this.state;

    if (autofill) {
      if (value === null) {
        this.setState({ autofill: false });
      } else {
        this.setState({ autofill: false, active: true });
      }
    }
    this.setState({ value: value.trim() });
    onChangeSelect && onChangeSelect(value.trim(), option);
  }

  openChangePopup(status: boolean) {
    // const { autofill } = this.state;
    // if (autofill) {
    //   if (date === null) {
    //     this.setState({ autofill: false });
    //   } else {
    //     this.setState({ autofill: false, active: true });
    //   }
    // }
  }

  checkAutofill() {
    if (this.nodeRef !== null) {
      const ref = this.nodeRef;
      if (ref instanceof Input) {
        setTimeout(() => {
          let autofilled = false;
          try {
            autofilled = ref.input.matches(':autofill');
          } catch (error) {
            try {
              autofilled = ref.input.matches(':-webkit-autofill');
            } catch (error) {
              try {
                autofilled = ref.input.matches(':-moz-autofill');
              } catch (error) {}
            }
          }
          if (autofilled) {
            this.setState({ active: true });
          }
        }, 1000);
      }
    }
  }

  onKeyUp = (e: any) => {
    const { onInputKeyUp } = this.props;
    onInputKeyUp && onInputKeyUp(e.currentTarget ? e.currentTarget.value : '');
  };

  componentWillUnmount() {
    const { onInputKeyUp, id } = this.props;
    if (id && onInputKeyUp) {
      const input = document.querySelector(`#${id} input`);
      if (input) {
        input.removeEventListener('keyup', this.onKeyUp);
      }
    }
  }

  innerRef(node: any) {
    const { inputRef, checkboxRef, onInputKeyUp, id } = this.props;

    this.nodeRef = node;
    if (id && onInputKeyUp) {
      const input = document.querySelector(`#${id} input`);
      if (input) {
        input.addEventListener('keyup', this.onKeyUp);
      }
    }
    if (node instanceof Input && inputRef) {
      inputRef(node.input);
    } else if (node instanceof Checkbox && checkboxRef) {
      checkboxRef(node);
    } else if (node instanceof Select && inputRef) {
      inputRef((node as any).rcSelect.inputRef);
    }
    this.checkAutofill();
  }

  search = () => {
    if (this.props.form) {
      const value = this.props.form.getFieldValue(this.props.id);
      this.props.onSearch && this.props.onSearch(value);
    }
  };

  /**
   * @function render
   * render (IType) Input | Checkbox
   */
  render() {
    const {
      autoFocus,
      autoComplete,
      open,
      getCalendarContainer,
      children,
      options,
      defaultValue,
      defaultChecked,
      values,
      className,
      form,
      id,
      label,
      disabled,
      labelInValue,
      filterOption,
      onChange, // Input
      range,
      loading,
      mode,
      maxLength,
      onCheck, // Checkbox
      placeholder,
      prefix,
      format,
      hint,
      rules,
      validateTrigger,
      showSearch,
      suffix,
      type, // IType
      tipFormatter,
      onSearch,
      enterButton,
      button,
      small,
      marge,
      onInputKeyDown,
      onInputKeyUp,
    } = this.props;
    const { active } = this.state;

    const getFieldDecorator = form && form.getFieldDecorator;

    let TypedInput = null;
    if (type === IType.Checkbox) {
      TypedInput = (
        <Checkbox
          defaultChecked={defaultChecked}
          className={className}
          ref={this.handleInnerRef}
          onChange={onCheck}
        >
          {label}
        </Checkbox>
      );
    } else if (type === IType.Radios) {
      TypedInput = (
        <Radio.Group onChange={this.handleChangeRadio} className={className}>
          {values &&
            values.map &&
            values.map((radio: any, i: number) => (
              <Radio
                defaultChecked={radio.checked}
                disabled={radio.disabled}
                key={`${i}`}
                value={radio.value}
              >
                {radio.label}
              </Radio>
            ))}
        </Radio.Group>
      );
    } else if (type === IType.Slider) {
      TypedInput = (
        <Slider
          className={className}
          ref={this.handleInnerRef}
          range
          tipFormatter={tipFormatter}
        />
      );
    } else if (type === IType.Search) {
      TypedInput = (
        <Search
          disabled={disabled}
          onSearch={onSearch}
          onFocus={this.handleFocus}
          enterButton={enterButton}
          ref={this.handleInnerRef}
          onBlur={this.handleBlur}
          className={`main-color${className ? ` ${className}` : ''}${
            loading ? ` ${loading}` : ''
          }`}
          prefix={prefix}
          suffix={
            <span>
              {suffix}
              {hint && (
                <Tooltip placement="right" title={hint}>
                  <Icon value={IconValue.Information} />
                </Tooltip>
              )}
            </span>
          }
          autoComplete={autoComplete}
          onChange={this.handleChange}
          type={type}
          placeholder={placeholder || ''}
        />
      );
    } else if (type === IType.Date) {
      const dateProps: any = {};
      if (typeof open !== 'undefined') {
        dateProps.open = open;
      }

      TypedInput = (
        <DatePicker
          getCalendarContainer={getCalendarContainer}
          disabled={disabled}
          format={format || 'DD/MM/YYYY'}
          className={`main-color${className ? ` ${className}` : ''}`}
          ref={this.handleInnerRef}
          onChange={this.handleChangeDate}
          onOpenChange={this.openChangePopup}
          placeholder={placeholder || ''}
          {...dateProps}
        />
      );
    } else if (type === IType.Select) {
      TypedInput = (
        <Select
          onInputKeyDown={onInputKeyDown}
          mode={mode}
          onSearch={onSearch}
          labelInValue={labelInValue}
          filterOption={filterOption}
          disabled={disabled}
          showSearch={showSearch}
          className={`main-color${className ? ` ${className}` : ''}`}
          ref={this.handleInnerRef}
          onChange={this.handleChangeSelect}
          onFocus={this.handleFocusRef}
          onBlur={this.handleBlurRef}
          placeholder={placeholder || ''}
        >
          {options}
        </Select>
      );
    } else if (type === IType.Number) {
      TypedInput = (
        <InputNumber
          disabled={disabled}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          className={`main-color${className ? ` ${className}` : ''}`}
          ref={this.handleInnerRef}
          onChange={this.handleChangeNumber}
          type={type}
          placeholder={placeholder || ''}
        />
      );
    } else {
      TypedInput = (
        <Input
          onPressEnter={this.search}
          maxLength={maxLength}
          autoFocus={autoFocus}
          disabled={disabled}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          className={`main-color${className ? ` ${className}` : ''}`}
          prefix={prefix}
          suffix={
            <span>
              {suffix}
              {hint && (
                <Tooltip placement="right" title={hint}>
                  <Icon value={IconValue.Information} />
                </Tooltip>
              )}
            </span>
          }
          autoComplete={autoComplete}
          ref={this.handleInnerRef}
          onChange={this.handleChange}
          type={type}
          placeholder={placeholder || ''}
        />
      );
    }

    let initialValue = defaultValue;
    if (!initialValue && IType.Text) {
      initialValue = '';
    } else if (!initialValue) {
      initialValue = null;
    }

    return (
      <FormItem
        className={`form-item form-item-${type}${active ? ` active` : ''}${
          marge === false ? ` no-marge` : ''
        }${disabled ? ` disabled` : ''}${small ? ` small` : ''}${
          button ? ` button` : ''
        }`}
        label={
          type !== IType.Checkbox &&
          type !== IType.Radios &&
          type !== IType.Hidden &&
          label
        }
      >
        {type === IType.Select && suffix && (
          <span className="select-suffix">{suffix}</span>
        )}
        {getFieldDecorator
          ? getFieldDecorator(id, {
              initialValue: defaultValue || undefined,
              rules,
              validateTrigger,
            })(TypedInput)
          : TypedInput}
        {children}
        {button && (
          <Button
            onClick={this.search}
            loading={loading}
            type={BtnType.Primary}
          >
            {button}
          </Button>
        )}
      </FormItem>
    );
  }
}

export default IDefault;
