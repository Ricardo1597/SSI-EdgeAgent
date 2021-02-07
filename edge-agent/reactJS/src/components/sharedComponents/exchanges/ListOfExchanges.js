import React, { useState, useEffect } from 'react';
import RecordSummary from './RecordSummary';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import styled from 'styled-components';

const S = {
  StyledGrid: styled(Grid)`
    margin-top: -15px !important;
    margin-bottom: 30px !important;
  `,
  FilterDiv: styled.div`
    flex-grow: 1;
    display: flex;
    margin-bottom: 12px;
  `,
  MySearchIcon: styled(SearchIcon)`
    transform: translateY(4px);
    margin-right: 10px;
  `,
};

const ListOfExchanges = ({
  exchanges,
  selectedExchangeId,
  changeExchange,
  transformState = null,
  isLoading,
  tab,
  isConnection,
}) => {
  const [filter, setFilter] = useState('');
  const [filteredExchanges, setFilteredExchanges] = useState([]);

  useEffect(() => {
    setFilteredExchanges(
      (exchanges || []).filter((exchange) =>
        (exchange.title || exchange.id || '').toLowerCase().includes(filter)
      )
    );
  }, [filter, exchanges]);

  console.log('No ListOfExchanges', selectedExchangeId);

  return (
    <Container className="p-0 m-0">
      <S.FilterDiv className="px-4">
        <S.MySearchIcon />
        <TextField
          fullWidth
          id="filter"
          name="filter"
          placeholder="Search by title"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </S.FilterDiv>
      <div className="scrollBar" style={{ overflowY: 'scroll', height: 'calc(85vh - 185px)' }}>
        {isLoading ? (
          <Grid item xs={12} className="px-4 pb-3">
            <p>Loading Exchanges</p>
          </Grid>
        ) : exchanges.length ? (
          filteredExchanges.map((exchange) => (
            <S.StyledGrid
              item
              xs={12}
              key={exchange.id}
              onClick={() => changeExchange(exchange.id)}
            >
              <RecordSummary
                record={{
                  title: exchange.label || exchange.id,
                  state: exchange.stateToDisplay,
                  createdAt:
                    new Date(exchange.createdAt).toLocaleDateString() +
                    ' - ' +
                    new Date(exchange.createdAt).toLocaleTimeString(),
                  updatedAt:
                    new Date(exchange.updatedAt).toLocaleDateString() +
                    ' - ' +
                    new Date(exchange.updatedAt).toLocaleTimeString(),
                  // other attributes
                }}
                selected={exchange.id === selectedExchangeId}
                transformState={transformState}
              />
            </S.StyledGrid>
          ))
        ) : (
          <Grid item xs={12} className="px-4 py-2">
            {tab === 0 ? (
              isConnection ? (
                <p>You don't have any connection being established!</p>
              ) : (
                <p>You don't have any ongoing exchange!</p>
              )
            ) : isConnection ? (
              <p>You don't have any active connections!</p>
            ) : (
              <p>You don't have any finished exchanges!</p>
            )}
          </Grid>
        )}
      </div>
    </Container>
  );
};

export default ListOfExchanges;
