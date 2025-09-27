import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StoryCard from '../components/StoryCard';

describe('StoryCard', () => {
  it('renders title and description', () => {
    const story = { id: '1', title: 'Test', description: 'Desc', created_at: new Date().toISOString() };
    render(<StoryCard story={story} />);
    expect(screen.getByText('Test')).toBeDefined();
    expect(screen.getByText('Desc')).toBeDefined();
  });
});
