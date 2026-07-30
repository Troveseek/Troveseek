"use client";

import React, { useState } from 'react';
import { X, Copy, Check, Mail, MessageCircle } from 'lucide-react';
import Button from './Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <span style={{ fontFamily: 'serif', fontWeight: 'bold', fontSize: '20px' }}>f</span>,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: '#1877F2'
    },
    {
      name: 'X (Twitter)',
      icon: <span style={{ fontWeight: 'bold', fontSize: '18px' }}>𝕏</span>,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: '#000000'
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
      color: '#25D366'
    },
    {
      name: 'Email',
      icon: <Mail size={20} />,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      color: '#EA4335'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--clr-surface)',
          padding: '24px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--clr-text-muted)'
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px' }}>Share this product</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {shareLinks.map(link => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'var(--clr-text)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: `${link.color}15`,
                color: link.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {link.icon}
              </div>
              <span style={{ fontSize: '12px' }}>{link.name}</span>
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--clr-bg)', padding: '8px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
          <input 
            type="text" 
            readOnly 
            value={url} 
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--clr-text-muted)',
              fontSize: '14px',
              outline: 'none',
              padding: '0 8px'
            }}
          />
          <Button 
            variant="secondary" 
            size="sm" 
            icon={copied ? <Check size={16} /> : <Copy size={16} />} 
            onClick={handleCopy}
            style={{ minWidth: '90px' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </div>
  );
}
