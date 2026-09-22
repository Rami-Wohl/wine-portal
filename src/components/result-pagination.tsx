import Link from "next/link";
import { PaginationScrollManager } from "./pagination-scroll-manager";

type PaginationItem = number | "ellipsis";

interface ResultPaginationProps {
  currentPage: number;
  hrefForPage: (page: number) => string;
  label: string;
  pageCount: number;
  position: "top" | "bottom";
  targetId: string;
}

export function paginationItems(currentPage: number, pageCount: number): PaginationItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", pageCount];
  if (currentPage >= pageCount - 3) {
    return [1, "ellipsis", ...Array.from({ length: 5 }, (_, index) => pageCount - 4 + index)];
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pageCount];
}

function targetedHref(href: string, targetId: string): string {
  return `${href}#${targetId}`;
}

export function ResultPagination({
  currentPage,
  hrefForPage,
  label,
  pageCount,
  position,
  targetId,
}: ResultPaginationProps) {
  const items = paginationItems(currentPage, pageCount);
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav
      className={`result-pagination result-pagination-${position}`}
      aria-label={`${label}, ${position === "top" ? "boven" : "onder"} de lijst`}
    >
      <PaginationScrollManager
        active={position === "top"}
        currentPage={currentPage}
        targetId={targetId}
      />
      {currentPage > 1 ? (
        <Link
          className="pagination-direction pagination-previous"
          href={targetedHref(hrefForPage(previousPage), targetId)}
          aria-label={`Ga naar vorige pagina, pagina ${previousPage}`}
        >
          <span aria-hidden="true">←</span> Vorige
        </Link>
      ) : (
        <span className="pagination-direction pagination-previous is-disabled" aria-disabled="true">
          <span aria-hidden="true">←</span> Vorige
        </span>
      )}

      <div className="pagination-center">
        <span className="pagination-status">
          Pagina {currentPage} van {pageCount}
        </span>
        <span className="pagination-pages" aria-label="Kies een pagina">
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <span className="pagination-ellipsis" aria-hidden="true" key={`ellipsis-${index}`}>
                …
              </span>
            ) : item === currentPage ? (
              <span
                className="pagination-page is-current"
                aria-current="page"
                aria-label={`Pagina ${item}`}
                key={item}
              >
                {item}
              </span>
            ) : (
              <Link
                className="pagination-page"
                href={targetedHref(hrefForPage(item), targetId)}
                aria-label={`Ga naar pagina ${item}`}
                key={item}
              >
                {item}
              </Link>
            ),
          )}
        </span>
      </div>

      {currentPage < pageCount ? (
        <Link
          className="pagination-direction pagination-next"
          href={targetedHref(hrefForPage(nextPage), targetId)}
          aria-label={`Ga naar volgende pagina, pagina ${nextPage}`}
        >
          Volgende <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="pagination-direction pagination-next is-disabled" aria-disabled="true">
          Volgende <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
