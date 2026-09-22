import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { paginationItems, ResultPagination } from "./result-pagination";

describe("ResultPagination", () => {
  it("keeps short page ranges complete and long ranges compact", () => {
    expect(paginationItems(2, 4)).toEqual([1, 2, 3, 4]);
    expect(paginationItems(1, 12)).toEqual([1, 2, 3, 4, 5, "ellipsis", 12]);
    expect(paginationItems(6, 12)).toEqual([1, "ellipsis", 5, 6, 7, "ellipsis", 12]);
    expect(paginationItems(12, 12)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12]);
  });

  it("targets the result list and communicates current and disabled states", () => {
    const html = renderToStaticMarkup(
      <ResultPagination
        currentPage={1}
        hrefForPage={(page) => `/explore/concepts?page=${page}`}
        label="Pagina's met concepten"
        pageCount={3}
        position="top"
        targetId="browse-results"
      />,
    );

    expect(html).toContain("Pagina&#x27;s met concepten, boven de lijst");
    expect(html).toContain('href="/explore/concepts?page=2#browse-results"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-disabled="true"');
  });
});
