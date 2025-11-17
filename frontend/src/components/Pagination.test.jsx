import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  it('should render pagination information correctly', () => {
    const pagination = {
      page: 2,
      limit: 10,
      total: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    };

    render(<Pagination pagination={pagination} onPageChange={() => {}} />);

    expect(screen.getByText(/Page 2 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/50 total/i)).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    const pagination = {
      page: 1,
      limit: 10,
      total: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: false
    };

    render(<Pagination pagination={pagination} onPageChange={() => {}} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable Next button on last page', () => {
    const pagination = {
      page: 5,
      limit: 10,
      total: 50,
      totalPages: 5,
      hasNextPage: false,
      hasPrevPage: true
    };

    render(<Pagination pagination={pagination} onPageChange={() => {}} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange with previous page when Previous clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const pagination = {
      page: 3,
      limit: 10,
      total: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    };

    render(<Pagination pagination={pagination} onPageChange={onPageChange} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page when Next clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const pagination = {
      page: 2,
      limit: 10,
      total: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    };

    render(<Pagination pagination={pagination} onPageChange={onPageChange} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should enable both buttons when on middle page', () => {
    const pagination = {
      page: 3,
      limit: 10,
      total: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    };

    render(<Pagination pagination={pagination} onPageChange={() => {}} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('should display correct page information for single page', () => {
    const pagination = {
      page: 1,
      limit: 10,
      total: 5,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    };

    render(<Pagination pagination={pagination} onPageChange={() => {}} />);

    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText(/5 total/i)).toBeInTheDocument();
  });
});
