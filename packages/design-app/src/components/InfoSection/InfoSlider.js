import React, { useState, useEffect } from 'react';
import './style.css';
import CarouselSlide from './CarouselSlide';
import { SLIDE_INFO } from './constants';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Slide } from '@mui/material';

function Arrow(props) {
  const { direction, clickFunction } = props;
  const icon =
    direction === 'left' ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />;

  return <div onClick={clickFunction}>{icon}</div>;
}

function InfoSlider() {
  const [index, setIndex] = useState(0);
  const content = SLIDE_INFO[index];
  const numSlides = SLIDE_INFO.length;

  const [slideIn, setSlideIn] = useState(true);
  const [slideDirection, setSlideDirection] = useState('down');

  const onArrowClick = (direction) => {
    const increment = direction === 'left' ? -1 : 1;
    const newIndex = (index + increment + numSlides) % numSlides;

    const oppDirection = direction === 'left' ? 'right' : 'left';
    setSlideDirection(direction);
    setSlideIn(false);

    setTimeout(() => {
      setIndex(newIndex);
      setSlideDirection(oppDirection);
      setSlideIn(true);
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 39) {
        onArrowClick('right');
      }
      if (e.keyCode === 37) {
        onArrowClick('left');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className="InfoSlider">
      <Arrow direction="left" clickFunction={() => onArrowClick('left')} />
      <Slide in={slideIn} direction={slideDirection}>
        <div>
          <CarouselSlide content={content} />
        </div>
      </Slide>
      <Arrow direction="right" clickFunction={() => onArrowClick('right')} />
    </div>
  );
}

export default InfoSlider;
