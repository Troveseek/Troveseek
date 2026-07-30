"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

export function LiveChatButton() {
  const { data: session } = useSession();

  const handleClick = () => {
    // Dispatch custom event that LiveChatWidget listens to
    window.dispatchEvent(new CustomEvent('open-live-chat'));
  };

  if (!session?.user) {
    // Redirect to login if not authenticated
    return (
      <a href="/login" style={{ textDecoration: 'none' }}>
        <Button variant="secondary" icon={<MessageSquare size={16} />}>Live Chat</Button>
      </a>
    );
  }

  return (
    <Button variant="secondary" icon={<MessageSquare size={16} />} onClick={handleClick}>
      Live Chat
    </Button>
  );
}
