import { Row } from 'antd';
import { Content } from 'components/Layout';
import { Heading } from 'components/Typo';
import * as React from 'react';

export type LayoutSkeletonType = 'default' | 'dashboard' | 'list';

interface ILayoutSkeletonProps {
  type?: LayoutSkeletonType;
}

const Layout: React.FunctionComponent<ILayoutSkeletonProps> = ({
  type = 'default',
}) => {
  let skeleton = null;

  switch (type) {
    case 'default':
      skeleton = (
        <Content>
          <Row
            type="flex"
            style={{
              justifyContent: 'flex-end',
            }}
          >
            <Heading
              loading={true}
              title="common.heading.title_loading"
              description="common.heading.description_loading"
            />
          </Row>
        </Content>
      );
  }

  return skeleton;
};

export default Layout;
