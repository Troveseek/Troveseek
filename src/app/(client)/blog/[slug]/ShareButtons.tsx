"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Link2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButtons({ title }: { title: string }) {
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this article: ${title}`);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button variant="secondary" icon={<Link2 size={16} />} onClick={handleCopyLink}>Copy Link</Button>
      <Button variant="secondary" icon={<MessageCircle size={16} />} onClick={handleShareTwitter}>Share on Twitter</Button>
    </div>
  );
}
