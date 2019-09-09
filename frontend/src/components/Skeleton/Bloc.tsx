import * as React from 'react';

interface IProps {
  loading: boolean;
  block?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
  transparent?: boolean;
  loadedClassName?: string;
  useSpace?: boolean;
}

const Bloc: React.FunctionComponent<IProps> = ({
  block,
  children,
  className,
  loadedClassName,
  loading,
  style,
  transparent,
  useSpace,
}) => (
  <>
    <div
      style={style}
      className={`${className ? className : ''}${
        loading
          ? ' skeleton-bloc'
          : loadedClassName
          ? ` ${loadedClassName}`
          : ''
      }${transparent ? ' transparent' : ''}${block ? ' block' : ''}${
        loading && useSpace ? ' full-space' : ''
      }`}
    >
      {children}
    </div>
  </>
);

export default Bloc;
