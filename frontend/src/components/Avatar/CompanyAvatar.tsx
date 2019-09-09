import { Avatar } from 'antd';
import * as React from 'react';
import './Avatar.module.less';

interface IProps {
  company: any;
}

class CompanyAvatar extends React.PureComponent<IProps> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { company } = this.props;

    let avatar;
    if (company && company.domainName) {
      avatar = (
        <Avatar
          src={
            company.domainName &&
            `https://logo.clearbit.com/${company.domainName
              .replace(/http(.?):\/\//, '')
              .toLowerCase()}?size=32`
          }
        />
      );
    } else {
      const name = company && (company.name || company.brandName);
      avatar = (
        <Avatar className={!name ? 'hidden' : ''}>
          {name && name.substring(0, 2)}
        </Avatar>
      );
    }

    return avatar || null;
  }
}

export default CompanyAvatar;
