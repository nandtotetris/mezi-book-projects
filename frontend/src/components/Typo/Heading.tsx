import { Col, Popover, Row } from 'antd';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import { Button } from 'components/Button';
import Skeleton from 'components/Skeleton';
import { Div, H1 } from 'components/Typo';
import * as React from 'react';
import {
  FormattedHTMLMessage,
  FormattedMessage,
  FormattedPlural,
} from 'react-intl';
import './Heading.module.less';

interface IProps {
  onClick?: () => void;
  right?: React.ReactNode;
  button?: string;
  buttonCta?: string;
  title?: string;
  icon?: IconValue;
  center?: boolean;
  loading?: boolean;
  small?: boolean;
  titleVariables?: any;
  description?: string;
  descriptionVariables?: any;
}

const Heading: React.FunctionComponent<IProps> = ({
  title,
  icon,
  center,
  small,
  titleVariables,
  description,
  loading,
  button,
  right,
  buttonCta,
  onClick,
  descriptionVariables,
}) => {
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
        <Col
          className={`heading${center ? ' center' : ''}${
            small ? ' small' : ''
          }`}
        >
          {title && (
            <H1>
              <Skeleton.Bloc loading={Boolean(loading)}>
                <FormattedHTMLMessage id={title} values={titleVariables} />
                {icon && <Icon className="heading-icon" value={icon} />}
              </Skeleton.Bloc>
            </H1>
          )}
          {description && (
            <Skeleton.Bloc loading={Boolean(loading)}>
              <Div className="heading-description">
                <FormattedPlural
                  one={
                    <FormattedMessage
                      id={description}
                      values={descriptionVariables}
                    />
                  }
                  other={
                    <FormattedMessage
                      id={`${description}_plural`}
                      values={descriptionVariables}
                    />
                  }
                  value={
                    descriptionVariables && descriptionVariables.count
                      ? descriptionVariables.count
                      : 0
                  }
                />
              </Div>
            </Skeleton.Bloc>
          )}
        </Col>
        {buttonCta ? (
          <Popover
            placement="leftTop"
            content={<FormattedMessage id={buttonCta} />}
          >
            <div>
              {button && (
                <Button onClick={onClick}>
                  <FormattedMessage id={button} />
                </Button>
              )}
            </div>
          </Popover>
        ) : (
          button && (
            <Button onClick={onClick}>
              <FormattedMessage id={button} />
            </Button>
          )
        )}
        {right}
      </Row>
    </div>
  );
};

export default Heading;
