import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import JSONPretty from 'react-json-pretty';
import styled from 'styled-components';
import PresentationCard from '../../pages/Exchanges/Presentations/components/PresentationCard';

const ExchangeDetailsDiv = styled.div`
  margin: 10px !important;
  background-color: white;
  border-radius: 10px;
`;

function RecordDetails(props) {
  const {
    isCredentialExchange = false,
    initiator,
    role,
    state,
    stateToDisplay,
    threadId,
    error,
    connectionId,
    recordId,
    proposal,
    request,
    // credential,
    presentation,
    verified,
  } = props.record;

  return (
    <ExchangeDetailsDiv>
      <CardContent className="m-2 pb-2">
        <div className="scrollBar" style={{ overflowY: 'scroll', height: 'calc(85vh - 90px)' }}>
          <Typography variant="h6" component="h2">
            {/* Here i could get the connection alias and display that.*/}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <div style={styles.marginBottom}>
              <div style={{ fontWeight: 'bold' }}>Record ID:</div>
              {recordId}
            </div>
            <div style={styles.marginBottom}>
              <div style={{ fontWeight: 'bold' }}>Connection ID:</div>
              {connectionId}
            </div>
            <div style={styles.marginBottom}>
              <div style={{ fontWeight: 'bold' }}>Initiator:</div>
              {initiator}
            </div>
            <div style={styles.marginBottom}>
              <div style={{ fontWeight: 'bold' }}>Role:</div>
              {role}
            </div>
            <div style={styles.marginBottom}>
              <div style={{ fontWeight: 'bold' }}>Thread ID:</div>
              {threadId}
            </div>
            <div style={styles.marginBottom}>
              <div style={{ fontWeight: 'bold' }}>Current State:</div>
              {stateToDisplay}
            </div>
            {state === 'error' && error && error.description && error.description.en ? (
              <div style={styles.marginBottom}>
                <div style={{ fontWeight: 'bold' }}>Error:</div>
                {error.description.en}
              </div>
            ) : null}
            <div style={styles.marginBottom}>
              <div style={{ fontWeight: 'bold' }}>
                {isCredentialExchange ? 'Credential ' : 'Presentation '} Proposal:
              </div>
              <JSONPretty data={proposal}></JSONPretty>
            </div>
            <div style={styles.marginBottom} hidden={!request}>
              <div style={{ fontWeight: 'bold' }}>
                {isCredentialExchange ? 'Credential ' : 'Presentation '} Request:
              </div>
              <JSONPretty data={request}></JSONPretty>
            </div>
            {presentation && (
              <PresentationCard
                id={recordId}
                presentation={presentation}
                request={request}
                verified={verified}
              />
            )}
          </Typography>
        </div>
      </CardContent>
    </ExchangeDetailsDiv>
  );
}

// Prop types
RecordDetails.propTypes = {
  record: PropTypes.object.isRequired,
};

// Styles
const styles = {
  marginBottom: {
    marginBottom: 8,
  },
};

export default RecordDetails;
