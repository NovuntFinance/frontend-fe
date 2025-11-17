import React from 'react';
import { render, screen } from '@testing-library/react';
import Typing from '../typing';

test('renders emoji and initial text', () => {
  render(<Typing phrases={["Hello world"]} typingSpeed={1} deleteSpeed={1} pause={10} emoji="🪙" />);
  expect(screen.getByText('🪙')).toBeInTheDocument();
});
