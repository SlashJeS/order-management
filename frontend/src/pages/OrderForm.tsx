import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const OrderForm = () => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshUserData } = useAuth();

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/api/products');
      // Ensure price is a number
      return response.data.map((product: any) => ({
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10)
      }));
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { product_id: string; quantity: number }) => {
      const response = await api.post('/api/orders', data);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        refreshUserData()
      ]);
      toast.success('Order created successfully');
      navigate('/orders');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message;
      if (errorMessage === 'Not enough stock available') {
        toast.error('Sorry, there is not enough stock available for this product');
      } else if (errorMessage === 'Insufficient balance') {
        toast.error('Sorry, you don\'t have enough balance to complete this order');
      } else {
        toast.error(errorMessage || 'Failed to create order');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate quantity
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    // Validate stock
    const selectedProduct = products?.find(p => p.id === productId);
    if (selectedProduct && quantity > selectedProduct.stock) {
      toast.error('Sorry, there is not enough stock available for this product');
      return;
    }

    // Validate balance
    if (selectedProduct && user) {
      const totalCost = selectedProduct.price * quantity;
      if (totalCost > user.balance) {
        toast.error('Sorry, you don\'t have enough balance to complete this order');
        return;
      }
    }

    createOrderMutation.mutate({ product_id: productId, quantity });
  };

  useEffect(() => {
    if (products && products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="order-form">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">
            Product
          </label>
          <select
            id="product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ${Number(product.price).toFixed(2)} (Stock: {product.stock})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        {productId && quantity > 0 && (
          <div className="text-sm text-gray-600">
            <p>Total Cost: ${(products?.find(p => p.id === productId)?.price || 0) * quantity}</p>
            <p>Your Balance: ${user?.balance.toFixed(2)}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={createOrderMutation.isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm; 