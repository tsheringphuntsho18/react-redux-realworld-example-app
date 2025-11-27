import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ArticleList from './ArticleList';

// Mock ArticlePreview to test navigation
jest.mock('./ArticlePreview', () => ({ article }) => (
  <div data-testid="article-preview">
    <a href={`/article/${article.slug}`}>{article.title}</a>
  </div>
));

// Mock ListPagination to avoid Redux connect issues in tests
jest.mock('./ListPagination', () => () => <div data-testid="pagination" />);

const mockStore = configureStore([]);

describe('ArticleList', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
  });

  test('renders loading state', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticleList articles={null} />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders empty articles array', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticleList articles={[]} />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText(/no articles are here/i)).toBeInTheDocument();
  });

  test('renders multiple articles', () => {
    const articles = [
      { slug: 'test-1', title: 'Test Article 1', tagList: [], author: { username: 'user1' }, createdAt: '', favorited: false, favoritesCount: 0, description: '' },
      { slug: 'test-2', title: 'Test Article 2', tagList: [], author: { username: 'user2' }, createdAt: '', favorited: false, favoritesCount: 0, description: '' }
    ];
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticleList articles={articles} />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
  });

  test('article click navigation', () => {
    const articles = [
      { slug: 'test-1', title: 'Test Article 1', tagList: [], author: { username: 'user1' }, createdAt: '', favorited: false, favoritesCount: 0, description: '' }
    ];
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticleList articles={articles} />
        </BrowserRouter>
      </Provider>
    );
    const link = screen.getByText('Test Article 1').closest('a');
    expect(link).toHaveAttribute('href', '/article/test-1');
  });
});