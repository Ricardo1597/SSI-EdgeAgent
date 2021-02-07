import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import Divider from '@material-ui/core/Divider';
import styled from 'styled-components';

import Credentials from './Credentials';
import Presentations from './Presentations';

const Root = styled.div`
  display: flex;
`;

const Sidebar = styled.div`
  width: 275px !important;
  color: #222222;
  background-color: #fafafa;
  border-right: #dddddd 1px solid;
`;

const Body = styled.div`
  flex-grow: 1;
  min-height: calc(100vh - 55px);
`;

const SidebarTitle = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 25px;
  font-size: 1.4em;
`;

const SidebarList = styled.div`
  margin-top: 10px;
`;

const SidebarItem = styled.div`
  display: inline-block;
  width: 100%;
  padding: 10px 25px;
  background-color: ${(props) => (props.selected ? '#eef2ff' : 'white')};
  color: ${(props) => (props.selected ? '#3f51b5' : '#222222')};
  cursor: pointer;
  &:hover {
    background: #eaeaea;
  }
`;

const Exchanges = () => {
  const history = useHistory();
  const location = useLocation();
  const urlPath = location.pathname;

  useEffect(() => {
    const path = location.pathname.split('/')[2];
    if (!path) history.push('/exchanges/credentials');
  }, [location.pathname]);

  const renderSwitch = () => {
    const path = location.pathname.split('/')[2];

    switch (path) {
      case 'credentials':
        return <Credentials />;
      case 'presentations':
        return <Presentations />;
      default:
        return 'Page not found';
    }
  };

  return (
    <Root className={`root-background`}>
      <Sidebar id="exchangesSidebar">
        <SidebarTitle item xs={12}>
          Exchanges
        </SidebarTitle>
        <Divider />
        <SidebarList>
          <SidebarItem
            item
            xs={12}
            selected={urlPath.match('/credentials$')}
            onClick={() => history.push('/exchanges/credentials')}
          >
            Credential Exchanges
          </SidebarItem>
          <SidebarItem
            item
            xs={12}
            selected={urlPath.match('/presentations$')}
            onClick={() => history.push('/exchanges/presentations')}
          >
            Presentation Exchanges
          </SidebarItem>
        </SidebarList>
      </Sidebar>
      <Body id="exchangesBody">{renderSwitch()}</Body>
    </Root>
  );
};

export default Exchanges;
