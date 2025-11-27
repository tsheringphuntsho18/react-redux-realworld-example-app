import articleList from "./articleList";
import {
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  CHANGE_TAB,
} from "../constants/actionTypes";

describe("articleList reducer", () => {
  it("should update articles and pagination on SET_PAGE", () => {
    const prevState = { articles: [], articlesCount: 0, currentPage: 0 };
    const action = {
      type: SET_PAGE,
      payload: {
        articles: [{ slug: "a1" }, { slug: "a2" }],
        articlesCount: 2,
      },
      page: 1,
    };
    const nextState = articleList(prevState, action);
    expect(nextState.articles).toEqual([{ slug: "a1" }, { slug: "a2" }]);
    expect(nextState.articlesCount).toBe(2);
    expect(nextState.currentPage).toBe(1);
  });

  it("should update state on HOME_PAGE_LOADED", () => {
    const prevState = {};
    const action = {
      type: HOME_PAGE_LOADED,
      pager: jest.fn(),
      payload: [
        { tags: ["react", "redux"] },
        { articles: [{ slug: "a1" }], articlesCount: 1 },
      ],
      tab: "feed",
    };
    const nextState = articleList(prevState, action);
    expect(nextState.tags).toEqual(["react", "redux"]);
    expect(nextState.articles).toEqual([{ slug: "a1" }]);
    expect(nextState.articlesCount).toBe(1);
    expect(nextState.currentPage).toBe(0);
    expect(nextState.tab).toBe("feed");
  });

  it("should update state on APPLY_TAG_FILTER", () => {
    const prevState = {
      articles: [],
      articlesCount: 0,
      tag: null,
      currentPage: 0,
    };
    const action = {
      type: APPLY_TAG_FILTER,
      pager: jest.fn(),
      payload: {
        articles: [{ slug: "a3" }],
        articlesCount: 1,
      },
      tag: "react",
    };
    const nextState = articleList(prevState, action);
    expect(nextState.articles).toEqual([{ slug: "a3" }]);
    expect(nextState.articlesCount).toBe(1);
    expect(nextState.tag).toBe("react");
    expect(nextState.currentPage).toBe(0);
  });

  it("should update state on CHANGE_TAB", () => {
    const prevState = {
      articles: [],
      articlesCount: 0,
      tab: null,
      currentPage: 2,
      tag: "redux",
    };
    const action = {
      type: CHANGE_TAB,
      pager: jest.fn(),
      payload: {
        articles: [{ slug: "a4" }],
        articlesCount: 1,
      },
      tab: "all",
    };
    const nextState = articleList(prevState, action);
    expect(nextState.articles).toEqual([{ slug: "a4" }]);
    expect(nextState.articlesCount).toBe(1);
    expect(nextState.tab).toBe("all");
    expect(nextState.currentPage).toBe(0);
    expect(nextState.tag).toBeNull();
  });
});
