import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import OrderForm from '../../pages/OrderForm';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

// Mock the API module
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockProducts = [
  { id: '1', name: 'Product 1', price: 10.00, stock: 5 },
  { id: '2', name: 'Product 2', price: 20.00, stock: 3 },
];

const mockUser = {
  id: '1',
  name: 'Test User',
  balance: 100.00,
};

describe('OrderForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock successful API responses
    (api.get as jest.Mock).mockResolvedValue({ data: mockProducts });
    (api.post as jest.Mock).mockResolvedValue({ data: { message: 'Order created successfully' } });
  });

  it('should render product list and form', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <OrderForm />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/product 1 - \$10\.00 \(stock: 5\)/i)).toBeInTheDocument();
      expect(screen.getByText(/product 2 - \$20\.00 \(stock: 3\)/i)).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/api/products');
  });

  it('should validate quantity input', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <OrderForm />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(quantityInput, { target: { value: '0' } });
    
    const form = screen.getByTestId('order-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid quantity');
    });
  });

  it('should create order successfully', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { message: 'Order created successfully' } });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <OrderForm />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(quantityInput, { target: { value: '2' } });
    
    const form = screen.getByTestId('order-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/orders', { product_id: '1', quantity: 2 });
      expect(toast.success).toHaveBeenCalledWith('Order created successfully');
    });
  });

  it('should handle API errors', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({ 
      response: { 
        data: { message: 'Insufficient balance' } 
      } 
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <OrderForm />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(quantityInput, { target: { value: '2' } });
    
    const form = screen.getByTestId('order-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Sorry, you don\'t have enough balance to complete this order');
    });
  });
}); 