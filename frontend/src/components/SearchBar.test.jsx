import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  it('should render with placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />);

    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    render(<SearchBar value="test query" onChange={() => {}} onClear={() => {}} />);

    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchBar value="" onChange={onChange} onClear={() => {}} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'test');

    expect(onChange).toHaveBeenCalled();
  });

  it('should show clear button when value is not empty', () => {
    render(<SearchBar value="search text" onChange={() => {}} onClear={() => {}} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />);

    const clearButton = screen.queryByRole('button', { name: /clear/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should call onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(<SearchBar value="search text" onChange={() => {}} onClear={onClear} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('should clear the input when clear button is clicked', async () => {
    const user = userEvent.setup();
    let value = 'initial value';
    const onChange = (e) => { value = e.target.value; };
    const onClear = () => { value = ''; };

    const { rerender } = render(
      <SearchBar value={value} onChange={onChange} onClear={onClear} />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    rerender(<SearchBar value={value} onChange={onChange} onClear={onClear} />);

    expect(value).toBe('');
  });

  it('should have search icon', () => {
    render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />);

    // Check for search emoji/icon (🔍)
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('should allow focusing the input', async () => {
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.click(input);

    expect(input).toHaveFocus();
  });
});
