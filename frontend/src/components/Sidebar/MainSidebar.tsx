import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';
const Sidebar = React.lazy(() => import('./Sidebar'));

const MainSidebar: React.FunctionComponent<{}> = () => {
  return (
    <div
      className="sidebar-wrapper main-sidebar-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <React.Suspense
        fallback={
          <div className="sidebar main-sidebar stripe">
            <ul className="ant-menu ant-menu-inline" />
          </div>
        }
      >
        <Sidebar
          sticky
          name="main"
          className="main-sidebar"
          stripe
          items={[
            {
              icon: IconValue.Pulse,
              key: 'home',
              title: 'sidebar.link.dashboard',
              to: '/',
            },
            {
              icon: IconValue.Sell,
              items: [
                {
                  key: 'draft',
                  title: 'sidebar.link.purchases_imports',
                },
                {
                  key: 'bills',
                  title: 'sidebar.link.purchases_bills',
                },
                {
                  disabled: true,
                  key: 'quotation',
                  title: 'sidebar.link.purchases_quotations',
                },
              ],
              key: 'purchase',
              title: 'sidebar.link.purchases',
            },
            {
              icon: IconValue.Buy,
              items: [
                {
                  key: 'draft',
                  title: 'sidebar.link.sales_drafts',
                },
                {
                  disabled: true,
                  key: 'bills',
                  title: 'sidebar.link.sales_quotations',
                },
                {
                  disabled: true,
                  key: 'quotation',
                  title: 'sidebar.link.sales_bills',
                },
              ],
              key: 'sell',
              title: 'sidebar.link.sales',
            },
            {
              disabled: true,
              icon: IconValue.Stat,
              key: 'statistics',
              title: 'sidebar.link.stats',
            },
            {
              icon: IconValue.Network,
              key: 'network',
              title: 'sidebar.link.network',
            },
          ]}
        />
      </React.Suspense>
    </div>
  );
};

export default MainSidebar;
