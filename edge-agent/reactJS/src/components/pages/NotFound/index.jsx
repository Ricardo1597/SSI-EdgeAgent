import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Button from '@material-ui/core/Button';

import './styles.scss';

import styled from 'styled-components';

const MyButton = styled(Button)`
  margin-top: 10px !important;
  color: white !important; 
  background-color: #363e49 !important; 
`;

const NotFound = () => {
  let history = useHistory();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = './script.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main>
      <div class="moon"></div>
      <div class="moon__crater moon__crater1"></div>
      <div class="moon__crater moon__crater2"></div>
      <div class="moon__crater moon__crater3"></div>

      <div class="star star1"></div>
      <div class="star star2"></div>
      <div class="star star3"></div>
      <div class="star star4"></div>
      <div class="star star5"></div>

      <div class="error">
        <div class="error__title">404</div>
        <div class="error__subtitle">Hmmm...</div>
        <div class="error__description">It looks like the page you are trying to access does not exist.</div>
        <MyButton 
          type="button"
          variant="contained"
          onClick={() => history.goBack()}>Go Back
        </MyButton>
      </div>

      <div class="astronaut">
        <div class="astronaut__backpack"></div>
        <div class="astronaut__body"></div>
        <div class="astronaut__body__chest"></div>
        <div class="astronaut__arm-left1"></div>
        <div class="astronaut__arm-left2"></div>
        <div class="astronaut__arm-right1"></div>
        <div class="astronaut__arm-right2"></div>
        <div class="astronaut__arm-thumb-left"></div>
        <div class="astronaut__arm-thumb-right"></div>
        <div class="astronaut__leg-left"></div>
        <div class="astronaut__leg-right"></div>
        <div class="astronaut__foot-left"></div>
        <div class="astronaut__foot-right"></div>
        <div class="astronaut__wrist-left"></div>
        <div class="astronaut__wrist-right"></div>

        <div class="astronaut__cord">
          <canvas id="cord" height="500px" width="500px"></canvas>
        </div>

        <div class="astronaut__head">
          <canvas id="visor" width="60px" height="60px"></canvas>
          <div class="astronaut__head-visor-flare1"></div>
          <div class="astronaut__head-visor-flare2"></div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
