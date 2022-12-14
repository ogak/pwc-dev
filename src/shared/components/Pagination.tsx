import React, { useState, Fragment, useEffect } from "react";
import {
  Pagination as BsPagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import useWindowSize from "../hooks/useWindowSize";

// =============================================================================
// typedef
// =============================================================================

export interface PaginationProps {
  pageCount?: number;
  totalCount?: number; //totalCount take precedence over pageCount
  currentPage?: number;
  onPageChange?: (nextPage: number) => void;
  perPage?: number;
  className?: string;
}

const Pagination = ({
  totalCount,
  pageCount: pCount = 0,
  currentPage = 1,
  onPageChange,
  perPage = 8,
  className,
}: PaginationProps) => {
  const { width } = useWindowSize();
  const isMobile = width < 769;
  const perPageDecider = isMobile ? 4 : perPage;
  const pageCount = totalCount ? Math.ceil(totalCount / perPage) : pCount;

  const [_currentPage, setCurrentPage] = useState(currentPage - 1);

  useEffect(() => setCurrentPage(currentPage - 1), [currentPage]);

  const pages = [];
  const threshold = Math.round(perPageDecider / 2);

  let startPage = _currentPage < threshold ? 0 : _currentPage - threshold;

  let endPage = perPageDecider + startPage;

  if (pageCount < endPage) endPage = pageCount;

  const diff = startPage - endPage + perPageDecider;
  startPage -= startPage - diff > 0 ? diff : 0;

  // if on middle range
  // *removed this because it caused bug
  // if (startPage > 0) startPage = startPage + 2
  // if (endPage < pageCount) endPage = endPage - 2

  for (let i = startPage; i < endPage; i++) {
    pages.push(i);
  }

  //additional details
  // {_currentPage * perPageDecider + 1}-{(_currentPage + 1) * perPageDecider} of{' '}
  const startRecord = _currentPage * perPage + 1;
  const endRecord =
    startRecord + perPage > Number(totalCount)
      ? totalCount
      : startRecord + perPage - 1;

  function handlePageChange(page: number) {
    setCurrentPage(page);
    onPageChange && onPageChange(page + 1);
  }

  function goToFirst() {
    handlePageChange(0);
  }

  function goToLast() {
    handlePageChange(pageCount - 1);
  }

  function goToPrev() {
    handlePageChange(_currentPage - 1);
  }

  function goToNext() {
    handlePageChange(_currentPage + 1);
  }

  if (!pageCount) return null;

  return (
    <div className={"d-flex justify-content-end".concat(className || "")}>
      <div className="text-right">
        {totalCount ? (
          <span className="text-secondary mb-2">
            Showing {startRecord}-{endRecord} of {totalCount}
          </span>
        ) : null}
        <BsPagination className="">
          <PaginationItem>
            <PaginationLink
              previous
              onClick={_currentPage === 0 ? undefined : goToPrev}
              disabled={_currentPage === 0}
              className={_currentPage === 0 ? "disabled" : ""}
            />
          </PaginationItem>

          {startPage > 0 && (
            <Fragment>
              <PaginationItem>
                <PaginationLink onClick={goToFirst}>1</PaginationLink>
              </PaginationItem>
              {!isMobile && (
                <PaginationItem>
                  <PaginationLink next>...</PaginationLink>
                </PaginationItem>
              )}
            </Fragment>
          )}

          {pages.map((page) => {
            return (
              <PaginationItem key={page} active={page === _currentPage}>
                <PaginationLink onClick={(_) => handlePageChange(page)}>
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {endPage < pageCount && (
            <Fragment>
              {!isMobile && (
                <PaginationItem>
                  <PaginationLink next>...</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={goToLast}>{pageCount}</PaginationLink>
              </PaginationItem>
            </Fragment>
          )}

          <PaginationItem>
            <PaginationLink
              next
              onClick={_currentPage + 1 === pageCount ? undefined : goToNext}
              disabled={_currentPage + 1 === pageCount}
              className={_currentPage + 1 === pageCount ? "disabled" : ""}
            />
          </PaginationItem>
        </BsPagination>
      </div>
    </div>
  );
};

export default Pagination;
