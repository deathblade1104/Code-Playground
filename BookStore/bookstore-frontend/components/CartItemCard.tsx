'use client';

import { CartItem } from '@/types';

interface CartItemCardProps {
  item: CartItem;
  onRemove: (itemId: number) => void;
  onUpdateQuantity?: (itemId: number, quantity: number) => void;
}

export default function CartItemCard({ item, onRemove, onUpdateQuantity }: CartItemCardProps) {
  const handleQuantityChange = (delta: number) => {
    if (onUpdateQuantity) {
      const newQuantity = Math.max(1, item.quantity + delta);
      onUpdateQuantity(item.itemId, newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.bookTitle}</h3>
          <p className="text-gray-600">${item.unitPrice.toFixed(2)} each</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {onUpdateQuantity && (
              <>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                >
                  +
                </button>
              </>
            )}
            {!onUpdateQuantity && (
              <span className="text-lg font-medium">Qty: {item.quantity}</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">${item.subtotal.toFixed(2)}</p>
          </div>
          <button
            onClick={() => onRemove(item.itemId)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

