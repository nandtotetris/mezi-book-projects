import { Col, Row } from 'antd';
import * as React from 'react';

/**
 * @props
 */
interface IProps {
  className?: string;
  title?: React.ReactNode | string;
  rows?: React.ReactNode[];
  renderRow?: (row: React.ReactNode) => React.ReactNode;
}

/**
 * @state
 *
 * error
 */
interface IState {}

/**
 * @class Submit
 *
 */
class Default extends React.PureComponent<IProps, IState> {
  render() {
    const { className, title, rows, renderRow } = this.props;

    return (
      <Row className={`${className ? 'className ' : ''}`}>
        <div className="card-row-title">{title}</div>
        {rows &&
          rows.map((row, i) => (
            <Col className="card-row-item" key={`${i}`}>
              {renderRow ? renderRow(row) : row}
            </Col>
          ))}
      </Row>
    );
  }
}

export default Default;
