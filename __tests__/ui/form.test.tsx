import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Form from '../../app/ui/form';

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock the generate function
const mockGenerate = jest.fn();

// Mock the setResults function
const mockSetResults = jest.fn();

// Render the Form component
const renderForm = () => {
  render(<Form generate={mockGenerate} setResults={mockSetResults} />);
};

describe('Form Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form inputs', () => {
    renderForm();
    expect(screen.getByLabelText(/arrival times/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/burst times/i)).toBeInTheDocument();
  });

  test('calls generate function on form submission', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/arrival times/i), { target: { value: '0 1 2' } });
    fireEvent.change(screen.getByLabelText(/burst times/i), { target: { value: '5 3 1' } });
    fireEvent.click(screen.getByText(/generate/i));
    expect(mockGenerate).toHaveBeenCalled();
  });

  test('displays error message for invalid input', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/arrival times/i), { target: { value: 'invalid input' } });
    fireEvent.click(screen.getByText(/generate/i));
    expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
  });
});
