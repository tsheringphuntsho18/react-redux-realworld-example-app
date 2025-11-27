import editor from './editor';
import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ARTICLE_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

describe('editor reducer', () => {
  it('should update form fields with UPDATE_FIELD_EDITOR', () => {
    const prevState = { title: '', description: '', body: '' };
    const action = { type: UPDATE_FIELD_EDITOR, key: 'title', value: 'New Title' };
    const nextState = editor(prevState, action);
    expect(nextState.title).toBe('New Title');
  });

  it('should handle EDITOR_PAGE_LOADED for new article', () => {
    const prevState = {};
    const action = { type: EDITOR_PAGE_LOADED, payload: null };
    const nextState = editor(prevState, action);
    expect(nextState.articleSlug).toBe('');
    expect(nextState.title).toBe('');
    expect(nextState.description).toBe('');
    expect(nextState.body).toBe('');
    expect(nextState.tagInput).toBe('');
    expect(nextState.tagList).toEqual([]);
  });

  it('should handle EDITOR_PAGE_LOADED for edit article', () => {
    const prevState = {};
    const article = {
      slug: 'test-article',
      title: 'Test Title',
      description: 'Test Desc',
      body: 'Test Body',
      tagList: ['tag1', 'tag2']
    };
    const action = { type: EDITOR_PAGE_LOADED, payload: { article } };
    const nextState = editor(prevState, action);
    expect(nextState.articleSlug).toBe('test-article');
    expect(nextState.title).toBe('Test Title');
    expect(nextState.description).toBe('Test Desc');
    expect(nextState.body).toBe('Test Body');
    expect(nextState.tagInput).toBe('');
    expect(nextState.tagList).toEqual(['tag1', 'tag2']);
  });

  it('should add a tag with ADD_TAG', () => {
    const prevState = { tagInput: 'react', tagList: ['redux'] };
    const action = { type: ADD_TAG };
    const nextState = editor(prevState, action);
    expect(nextState.tagList).toEqual(['redux', 'react']);
    expect(nextState.tagInput).toBe('');
  });

  it('should remove a tag with REMOVE_TAG', () => {
    const prevState = { tagList: ['redux', 'react'] };
    const action = { type: REMOVE_TAG, tag: 'redux' };
    const nextState = editor(prevState, action);
    expect(nextState.tagList).toEqual(['react']);
    });
});