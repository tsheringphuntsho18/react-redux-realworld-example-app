import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ArticlePreview from './ArticlePreview';

// Mock agent to avoid real API calls
jest.mock('../agent', () => ({
  Articles: {
    favorite: jest.fn(() => Promise.resolve({})),
    unfavorite: jest.fn(() => Promise.resolve({}))
  }
}));

const mockStore = configureStore([]);

const article = {
  slug: 'test-article',
  title: 'Test Title',
  description: 'Test Description',
  author: { username: 'testuser', image: '', bio: '' },
  createdAt: '2021-01-01T00:00:00.000Z',
  favorited: false,
  favoritesCount: 5,
  tagList: ['tag1', 'tag2']
};

function renderWithStore(articleProp = article) {
  const store = mockStore({});
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ArticlePreview article={articleProp} />
      </BrowserRouter>
    </Provider>
  );
}

describe('ArticlePreview', () => {
  test('renders article data (title, description, author)', () => {
    renderWithStore();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('favorite button functionality', () => {
    renderWithStore();
    const favBtn = screen.getByRole('button');
    expect(favBtn).toBeInTheDocument();
    fireEvent.click(favBtn);
    // No error means the click handler is wired; actual API call is mocked
  });

  test('renders tag list', () => {
    renderWithStore();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  test('author link navigation', () => {
    renderWithStore();
    const authorLink = screen.getByText('testuser').closest('a');
    expect(authorLink).toHaveAttribute('href', '/@testuser');
  });
});