import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';
const Sidebar = React.lazy(() => import('./Sidebar'));

const ProfileSidebar: React.FunctionComponent<{}> = () => {
  return (
    <div
      className="sidebar-wrapper sub-sidebar-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <React.Suspense
        fallback={
          <div className="sidebar sub-sidebar stripe">
            <ul className="ant-menu ant-menu-inline" />
          </div>
        }
      >
        <Sidebar
          sticky
          name="profile"
          className="sub-sidebar"
          stripe
          items={[
            {
              icon: IconValue.Profile,
              items: [
                {
                  key: 'informations',
                  title: 'account.submenu.profile_informations',
                },
                {
                  disabled: true,
                  key: 'contacts',
                  title: 'account.submenu.profile_contacts',
                },
                {
                  disabled: true,
                  key: 'notifications',
                  title: 'account.submenu.profile_notifications',
                },
              ],
              key: 'profile',
              title: 'account.submenu.profile',
            },
            {
              icon: IconValue.Briefcase,
              items: [
                {
                  key: 'informations',
                  title: 'account.submenu.company_informations',
                },
                {
                  disabled: true,
                  key: 'proof',
                  title: 'account.submenu.company_proof',
                },
                {
                  key: 'bank',
                  title: 'account.submenu.company_bank',
                },
                {
                  disabled: true,
                  key: 'collaborators',
                  title: 'account.submenu.company_collaborators',
                },
                {
                  key: 'accounting',
                  title: 'account.submenu.company_accounting',
                },
              ],
              key: 'company',
              title: 'account.submenu.company',
            },
            {
              icon: IconValue.Rocket,
              key: 'balance',
              title: 'account.submenu.balance',
            },
          ]}
        />
      </React.Suspense>
    </div>
  );
};

export default ProfileSidebar;
