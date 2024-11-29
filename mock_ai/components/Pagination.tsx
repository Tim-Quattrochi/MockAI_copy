"use client";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
  PaginationContent,
} from "./ui/pagination";

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationClient({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationClientProps) {
  const renderPageLinks = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(currentPage + halfVisible, totalPages);

    if (currentPage <= halfVisible) {
      endPage = Math.min(maxVisiblePages, totalPages);
    } else if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => onPageChange(1)}>
            First
          </PaginationLink>
        </PaginationItem>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem
          key={i}
          className={
            i === currentPage
              ? "active cursor-pointer"
              : "cursor-pointer"
          }
        >
          <PaginationLink size="lg" onClick={() => onPageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            className="cursor-pointer"
          >
            Last
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() =>
              onPageChange(Math.min(totalPages, currentPage + 1))
            }
            className={currentPage === 1 ? "disabled" : ""}
          />
        </PaginationItem>

        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {renderPageLinks()}

        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() =>
              onPageChange(Math.min(totalPages, currentPage + 1))
            }
            className={currentPage === totalPages ? "disabled" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
