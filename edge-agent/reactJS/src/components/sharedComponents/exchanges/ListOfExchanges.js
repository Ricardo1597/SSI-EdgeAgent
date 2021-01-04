import React from 'react';
import RecordSummary from './RecordSummary';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

const S = {
  StyledGrid: styled(Grid)`
    margin-top: -15px !important;
    margin-bottom: 30px !important;
  `,
};

const SideList = ({ exchanges, selectedExchangeId, changeExchange, transformState }) => {
  return (
    <Container
      className="scrollBar p-0 m-0"
      style={{ overflowY: 'scroll', height: 'calc(80vh - 100px)' }}
    >
      {exchanges.length ? (
        exchanges.map((exchange) => (
          <S.StyledGrid item xs={12} key={exchange.id} onClick={() => changeExchange(exchange.id)}>
            <RecordSummary
              record={{
                id: exchange.id,
                state: exchange.stateToDisplay,
                createdAt: exchange.createdAt,
                updatedAt: exchange.updatedAt,
                // other attributes
              }}
              selected={exchange.id === selectedExchangeId}
              transformState={transformState}
            />
          </S.StyledGrid>
        ))
      ) : (
        <Grid item xs={12} className="px-4 py-2">
          <p>You haven't started any exchange yet</p>
        </Grid>
      )}
    </Container>
  );
};

export default SideList;
