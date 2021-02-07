import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import styled from 'styled-components';

import ListOfExchanges from './ListOfExchanges';
import TabPanel, { a11yProps } from '../../TabPanel';

const SideListDiv = styled.div`
  background-color: white;
  border-radius: 5px;
  width: 400px;
`;

const SideList = ({
  exchanges,
  selectedExchange,
  changeExchange,
  isConnection = false,
  isLoading = false,
}) => {
  const [ongoingExchanges, setOngoingExchanges] = useState([]);
  const [completedExchanges, setCompletedExchanges] = useState([]);
  const [tab, setTab] = useState(0); // Tab of ongoing exchanges

  console.log('Side List: ', selectedExchange);

  useEffect(() => {
    console.log('no use effect: ', selectedExchange);
    if (exchanges && exchanges.length) {
      // Divide exchanges by state
      const ongoingList = [];
      const completedList = [];
      exchanges.forEach((e) => {
        e.state !== 'done' && e.state !== 'complete' ? ongoingList.push(e) : completedList.push(e);
      });
      setOngoingExchanges(ongoingList);
      setCompletedExchanges(completedList);

      // Set tab of the selected exchange
      if (selectedExchange) {
        selectedExchange.state !== 'done' && selectedExchange.state !== 'complete'
          ? setTab(0)
          : setTab(1);
      } else {
        if (tab !== 0 && tab !== 1) {
          setTab(0);
        } else if (tab === 1 && completedList.length) {
          changeExchange(completedList[0].id);
        } else if (tab === 0 && ongoingList.length) {
          changeExchange(ongoingList[0].id);
        }
      }
    }
  }, [exchanges]);

  const handleChangeTabs = (e, newValue) => {
    if (newValue !== tab) {
      setTab(newValue);
      if (newValue === 0 && ongoingExchanges.length) {
        changeExchange(ongoingExchanges[0].id);
      } else if (newValue === 1 && completedExchanges.length) {
        changeExchange(completedExchanges[0].id);
      } else {
        changeExchange(null);
      }
    }
  };

  return (
    <SideListDiv className="p-1">
      <div style={{ display: 'flex' }}>
        <AppBar
          position="relative"
          color="transparent"
          style={{ width: 320, margin: 'auto', boxShadow: 'none' }}
        >
          <Tabs
            value={tab}
            onChange={handleChangeTabs}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Ongoing" {...a11yProps(0)} />
            <Tab label={isConnection ? 'Active' : 'Finished'} {...a11yProps(1)} />
          </Tabs>
        </AppBar>
      </div>
      <TabPanel value={tab} index={0} p={0} className="py-3 pr-3">
        <ListOfExchanges
          exchanges={ongoingExchanges}
          selectedExchangeId={(selectedExchange && selectedExchange.id) || null}
          changeExchange={changeExchange}
          isLoading={isLoading}
          tab={tab}
          isConnection={isConnection}
        />
      </TabPanel>
      <TabPanel value={tab} index={1} p={0} className="py-3 pr-3">
        <ListOfExchanges
          exchanges={completedExchanges}
          selectedExchangeId={(selectedExchange && selectedExchange.id) || null}
          changeExchange={changeExchange}
          tab={tab}
          isConnection={isConnection}
        />
      </TabPanel>
    </SideListDiv>
  );
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(SideList);
