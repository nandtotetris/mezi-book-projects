import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import Skeleton from 'components/Skeleton';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Card from './Card';

/**
 * @props
 */
interface IProps {
  center?: boolean;
  className?: string;
  title?: React.ReactNode;
  description?: string;
  color?: string;
  icon?: IconValue;
  loading?: boolean;
  style?: React.CSSProperties;
}

const CondensedCard: React.FunctionComponent<IProps> = ({
  className,
  center,
  title,
  description,
  icon,
  style,
  loading,
  color,
}) => {
  return (
    <Card
      style={style}
      center={center}
      className={`condensed-card${className ? ` ${className}` : ''}`}
      shadow
    >
      <div className="condensed-card-left">
        <Skeleton.Bloc
          loading={Boolean(loading)}
          className="condensed-card-title"
        >
          {title}
        </Skeleton.Bloc>
        {description && (
          <Skeleton.Bloc
            loading={Boolean(loading)}
            className="condensed-card-description"
          >
            <FormattedMessage id={description} />
          </Skeleton.Bloc>
        )}
      </div>
      <div className={`condensed-card-right${color ? ` ${color}` : ''}`}>
        <Icon value={icon} />
      </div>
    </Card>
  );
};

export default CondensedCard;
