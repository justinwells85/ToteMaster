function Pagination({ pagination, onPageChange }) {
  const { page, totalPages, total, hasNextPage, hasPrevPage } = pagination;

  const handlePrevious = () => {
    if (hasPrevPage) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between flex-1">
        <div>
          <p className="text-sm text-gray-700">
            Page {page} of {totalPages} • {total} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={!hasPrevPage}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!hasNextPage}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
