import * as React from 'react';
import './Code.module.less';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

interface IProps extends IDefaultProps {
  onComplete?: (value?: string) => void;
  length: number;
}

/**
 * @class Code
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props (usually email stuff)
 * Can be overrided by parent set props
 */
class Code extends React.PureComponent<IProps, IDefaultState> {
  static defaultProps = {
    id: 'code',
    label: '',
    length: 6,
    onComplete: () => {},
    rules: [],
    type: IType.Text,
  };

  handleOnChange: (count: number) => void;
  handleOnFocus: (count: number) => void;
  handleRefs: (index: number, node: HTMLInputElement) => void;

  inputs: any = {};
  constructor(props: any) {
    super(props);

    this.handleOnChange = this.change.bind(this);
    this.handleOnFocus = this.focus.bind(this);
    this.handleRefs = this.inputRefs.bind(this);
  }

  inputRefs(index: number, node: HTMLInputElement) {
    if (node) {
      this.inputs[index] = node;
    }
  }

  getCurrentValue() {
    const { onComplete } = this.props;

    let currentValue = '';
    Object.keys(this.inputs).map(i => {
      currentValue += this.inputs[i].value;
    });

    if (currentValue.length === 6) {
      onComplete && onComplete(currentValue);
    }
  }

  change(count: number) {
    if (this.inputs) {
      const current = this.inputs[count];
      let next = this.inputs[count + 1];

      if (current) {
        if (current.value.length > 1) {
          const values = current.value;
          current.value = values[0];
          current.blur();

          setTimeout(() => {
            values.split('').map((v: string, i: number) => {
              next = this.inputs[count + i];
              if (next) {
                next.value = v;
              }
            });
            this.getCurrentValue();
          }, 100);
        } else if (current.value.length === 1) {
          next && next.focus();
          this.getCurrentValue();
        }
      }
    }
  }

  focus(count: number) {
    this.inputs && this.inputs[count] && this.inputs[count].select();
  }

  render() {
    const { id, length, onComplete, ...rest } = this.props;
    return (
      <div className="input-code">
        {Array.from(Array(length).keys()).map((v: any, i: number) => (
          <IDefault
            autoFocus={i === 0 ? true : false}
            key={`${i}`}
            defaultValue={this.inputs && this.inputs[i] && this.inputs[i].value}
            inputRef={this.handleRefs.bind(null, i)}
            onChange={this.handleOnChange.bind(null, i)}
            onFocus={this.handleOnFocus.bind(null, i)}
            id={`${id}-${i}`}
            className={`input-code-${i}`}
            {...rest}
          />
        ))}
      </div>
    );
  }
}

export default Code;
