import { Divider, Menu } from 'antd';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import './Sidebar.module.less';

const SubMenu = Menu.SubMenu;

interface ISidebarItem {
  key: string;
  title: React.ReactNode;
  dividerAfter?: boolean;
  dividerBefore?: boolean;
  disabled?: boolean;
  to?: string;
  icon?: IconValue;
  right?: React.ReactNode;
  reverse?: boolean;
  onClick?: () => void;
}

interface ISidebarItems extends ISidebarItem {
  items?: ISidebarItem[];
}

interface IProps extends RouteComponentProps {
  className?: string;
  name?: string;
  items: ISidebarItems[];
  collapsable?: boolean;
  sticky?: boolean;
  contrast?: boolean;
  stripe?: boolean;
}

interface IState {
  collapsed: boolean;
}

class Sidebar extends React.PureComponent<IProps, IState> {
  static defaultProps = {
    collapsable: true,
  };

  state = {
    collapsed: false,
  };

  handleClick: (cb: () => void, e: React.MouseEvent<any>) => void;
  handleToggle: () => void;
  constructor(props: any) {
    super(props);

    this.handleClick = this.click.bind(this);
    this.handleToggle = this.toggle.bind(this);
  }

  click(cb: () => void, e: React.MouseEvent<any>) {
    e.preventDefault();
    cb();
  }

  toggle() {
    const { name } = this.props;
    const { collapsed } = this.state;
    localStorage.setItem(`collapsed-${name}`, !collapsed ? 'true' : 'false');

    this.setState({
      collapsed: !collapsed,
    });
  }

  renderItem(item: ISidebarItem) {
    return item.disabled ? null : (
      <Menu.Item key={item.key}>
        <div
          className={`ant-menu-item-wrapper ${
            item.reverse ? ' reverse' : 'default'
          }`}
        >
          {item.dividerBefore && <Divider />}
          {item.disabled ? (
            <div className="sidebar-item disabled">
              {item.icon && <Icon value={item.icon} />}
              <span className="sidebar-item-left">
                {typeof item.title === 'string' ? (
                  <FormattedMessage id={item.title} />
                ) : (
                  item.title
                )}
              </span>
              {item.right && (
                <span className="sidebar-item-right">
                  {typeof item.right === 'string' ? (
                    <FormattedMessage id={item.right} />
                  ) : (
                    item.right
                  )}
                </span>
              )}
            </div>
          ) : (
            <NavLink
              onClick={
                item.onClick
                  ? this.handleClick.bind(null, item.onClick)
                  : undefined
              }
              className="sidebar-item"
              to={item.to ? item.to : `/${item.key}`}
            >
              {item.icon && <Icon value={item.icon} />}
              <span className="sidebar-item-left">
                {typeof item.title === 'string' ? (
                  <FormattedMessage id={item.title} />
                ) : (
                  item.title
                )}
              </span>
              {item.right && (
                <span className="sidebar-item-right">
                  {typeof item.right === 'string' ? (
                    <FormattedMessage id={item.right} />
                  ) : (
                    item.right
                  )}
                </span>
              )}
            </NavLink>
          )}
          {item.dividerAfter && <Divider />}
        </div>
      </Menu.Item>
    );
  }

  componentDidMount() {
    const { name } = this.props;
    const defaultCollapsed = localStorage.getItem(`collapsed-${name}`);
    this.setState({
      collapsed: defaultCollapsed === 'true' ? true : false,
    });
  }

  render() {
    const {
      location,
      sticky,
      contrast,
      stripe,
      collapsable,
      items,
      className,
    } = this.props;
    const { collapsed } = this.state;
    const current = location.pathname.replace(/^\//g, '').replace(/\//g, '-');
    const isHome = location.pathname === '/';
    const selected = location.pathname.replace(/^\//g, '').split('/');

    return (
      <div
        className={`sidebar${className ? ` ${className}` : ''}${` collapsable-${
          collapsable ? 'true' : 'false'
        }`}${contrast ? ' contrast' : ''}${stripe ? ' stripe' : ''}${
          sticky ? ' sticky' : ''
        }${collapsed ? ' sidebar-collapsed' : ' sidebar-expended'}`}
      >
        {collapsable && (
          <div onClick={this.handleToggle} className="toggle-sidebar">
            <Icon value={IconValue.ChevronLeft} />
            <FormattedMessage id="sidebar.link.hide" />
          </div>
        )}
        <Menu
          inlineCollapsed={collapsed}
          defaultOpenKeys={isHome ? ['home'] : [selected[0]]}
          selectedKeys={
            isHome ? ['home'] : [selected[0], `${selected[0]}-${selected[1]}`]
          }
          mode="inline"
        >
          {items.map(item =>
            item.items ? (
              item.disabled ? null : (
                <SubMenu
                  key={item.key}
                  title={
                    <div
                      className={`ant-menu-item-wrapper ${
                        item.reverse ? ' reverse' : 'default'
                      }`}
                    >
                      {item.dividerBefore && <Divider />}
                      <div className="sidebar-item">
                        {item.icon && <Icon value={item.icon} />}
                        <span className="sidebar-item-left">
                          {typeof item.title === 'string' ? (
                            <FormattedMessage id={item.title} />
                          ) : (
                            item.title
                          )}
                        </span>
                        {item.right && (
                          <span className="sidebar-item-right">
                            {typeof item.right === 'string' ? (
                              <FormattedMessage id={item.right} />
                            ) : (
                              item.right
                            )}
                          </span>
                        )}
                      </div>
                      {item.dividerAfter && <Divider />}
                    </div>
                  }
                >
                  {item.items.map(subitem =>
                    this.renderItem({
                      ...subitem,
                      key: `${item.key}-${subitem.key}`,
                      to: `/${item.key}/${subitem.key}`,
                    }),
                  )}
                </SubMenu>
              )
            ) : (
              this.renderItem(item)
            ),
          )}
        </Menu>
      </div>
    );
  }
}

export default withRouter(Sidebar);
