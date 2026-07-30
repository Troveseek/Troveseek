"use client";

import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import Button from '@/components/ui/Button';
import { useLocale } from 'next-intl';

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    slug?: string;
    image?: string;
  };
};

export default function AddToWishlistButton({ product }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);
  const { items, addItem, removeItem } = useWishlistStore();
  const isAdded = mounted && items.some((i) => i.id === product.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        slug: product.slug,
        image: product.image,
      });
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleToggle}
      title={isAdded ? (isAr ? 'إزالة من المفضلة' : 'Remove from Wishlist') : (isAr ? 'أضف للمفضلة' : 'Add to Wishlist')}
      style={{ color: isAdded ? '#ef4444' : 'inherit' }}
    >
      <Heart size={14} fill={isAdded ? '#ef4444' : 'none'} />
    </Button>
  );
}
