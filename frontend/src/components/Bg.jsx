import React from 'react';
import styled from 'styled-components';

const Bg = () => {
  return (
    <StyledWrapper>
      <div className="container">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bubble">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  background: #111;
  overflow: hidden;
  z-index: 0;

  .container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .bubble {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    box-shadow: inset 0 0 25px rgba(255, 255, 255, 0.25);
    animation: animate_4010 8s ease-in-out infinite;
  }

  .bubble:nth-child(2) {
    position: relative;
    zoom: 0.45;
    left: -10px;
    top: -100px;
    animation-delay: -4s;
  }

  .bubble:nth-child(3) {
    position: relative;
    zoom: 0.45;
    right: -80px;
    top: -300px;
    animation-delay: -6s;
  }

  .bubble:nth-child(4) {
    position: relative;
    zoom: 0.35;
    left: -120px;
    bottom: -200px;
    animation-delay: -3s;
  }

  .bubble:nth-child(5) {
    position: relative;
    zoom: 0.5;
    left: 0px;
    top: 200px;
    animation-delay: -5s;
  }

  .bubble:nth-child(6) {
    position: absolute;
    zoom: 0.3; /* small bubble */
    right: 20px;
    bottom: 60px;
    animation-delay: -2s;
  }

  .bubble:nth-child(7) {
    position: absolute;
    zoom: 0.5; /* medium bubble */
    right: 170px;
    bottom: 60px;
    animation-delay: -1s;
  }

  @keyframes animate_4010 {
    0%, 100% {
      transform: translateY(-20px);
    }
    50% {
      transform: translateY(20px);
    }
  }

  .bubble::before,
  .bubble::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: #fff;
    z-index: 10;
    filter: blur(2px);
  }

  .bubble::before {
    top: 50px;
    left: 45px;
    width: 30px;
    height: 30px;
  }

  .bubble::after {
    top: 80px;
    left: 80px;
    width: 20px;
    height: 20px;
  }

  .bubble span {
    position: absolute;
    border-radius: 50%;
  }

  .bubble span:nth-child(1) {
    inset: 10px;
    border-left: 15px solid #0fb4ff;
    filter: blur(8px);
  }

  .bubble span:nth-child(2) {
    inset: 10px;
    border-right: 15px solid #ff4484;
    filter: blur(8px);
  }

  .bubble span:nth-child(3) {
    inset: 10px;
    border-top: 15px solid #ffeb3b;
    filter: blur(8px);
  }

  .bubble span:nth-child(4) {
    inset: 30px;
    border-left: 15px solid #ff4484;
    filter: blur(12px);
  }

  .bubble span:nth-child(5) {
    inset: 10px;
    border-bottom: 10px solid #fff;
    filter: blur(8px);
    transform: rotate(330deg);
  }
`;

export default Bg;
