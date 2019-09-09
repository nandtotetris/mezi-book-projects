import { Col, Row } from 'antd';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import './SubHeading.module.less';

interface IProps {
  children?: React.ReactNode;
  title?: string;
  icon?: IconValue;
  titleVariables?: any;
}

class SubHeading extends React.PureComponent<IProps, {}> {
  render() {
    const { title, icon, titleVariables, children } = this.props;

    return (
      <div
        style={{
          display: 'block',
          width: '100%',
        }}
      >
        <Row
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <Col className={`sub-heading`}>
            {title && (
              <h2>
                <FormattedHTMLMessage id={title} values={titleVariables} />
                {icon && <Icon className="heading-icon" value={icon} />}
              </h2>
            )}
          </Col>
          <div className="sub-heading-right">{children}</div>
        </Row>
      </div>
    );
  }
}

export default SubHeading;
