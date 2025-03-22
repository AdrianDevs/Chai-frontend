import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Title from '../../src/components/title';

describe('App', () => {
  it('should render', () => {
    render(<Title>Chai Chat</Title>);

    // screen.debug(); // prints out the tsx in the component unto the command line

    const title = screen.getByText('Chai Chat');
    expect(title).toBeDefined();
  });
});
