import * as React from 'react';

import './Shadow.css';

interface IProps {
  className?: string;
  children?: React.ReactNode;
}

const Shadow: React.FunctionComponent<IProps> = ({ children, className }) => (
  <div className={`shadow-wrapper${className ? ` ${className}` : ''}`}>
    {children}
  </div>
);

export default Shadow;
