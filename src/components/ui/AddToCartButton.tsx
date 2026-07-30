"use client";

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import Button from '@/components/ui/Button';
import { useLocale } from 'next-intl';

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl?: string;
    images?: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      basePrice: product.price,
      category: product.category || 'Uncategorized',
      imageUrl: product.imageUrl || (product.images ? JSON.parse(product.images)[0] : undefined)
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Button
      size="sm"
      variant={added ? 'primary' : 'secondary'}
      icon={added ? <Check size={14} /> : <ShoppingCart size={14} />}
      onClick={handleAdd}
    >
      {added ? (isAr ? 'تمت الإضافة' : 'Added!') : (isAr ? 'أضف للسلة' : 'Add')}
    </Button>
  );
}
