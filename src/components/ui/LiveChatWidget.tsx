"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import Button from './Button';

export default function LiveChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for external trigger (e.g., from ContactPreview "Live Chat" button)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handler);
    return () => window.removeEventListener('open-live-chat', handler);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // When opening for the first time, fetch or create session
  useEffect(() => {
    if (isOpen && !sessionId && session?.user && !isConnecting) {
      const initChat = async () => {
        setIsConnecting(true);
        try {
          const res = await fetch('/api/chat/session');
          const data = await res.json();
          if (data.sessions && data.sessions.length > 0) {
            setSessionId(data.sessions[0].id);
            setMessages(data.sessions[0].messages || []);
          } else {
            // Create a new session
            const createRes = await fetch('/api/chat/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subject: 'Live Chat Support' })
            });
            const createData = await createRes.json();
            setSessionId(createData.session.id);
          }
        } catch (e) {
          console.error('Failed to init chat', e);
        } finally {
          setIsConnecting(false);
        }
      };
      initChat();
    }
  }, [isOpen, sessionId, session]);

  // Subscribe to SSE
  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource(`/api/chat/stream?sessionId=${sessionId}`);
    
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'connected') return;
      
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      
      // Mark as read if receiving a message while open
      if (data.senderRole === 'ADMIN' && isOpen && !isMinimized) {
        fetch('/api/chat/message', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, isOpen, isMinimized]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const content = input;
    setInput('');

    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content }),
      });
    } catch (err) {
      console.error('Failed to send message', err);
      setInput(content); // restore on failure
    }
  };

  if (!session?.user || session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
    return null; // Admins use the dashboard, unauthenticated users can't chat
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-primary)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(124,111,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: isMinimized ? '24px' : '24px',
          right: '24px',
          width: '350px',
          height: isMinimized ? '60px' : '500px',
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: '16px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
            color: '#fff',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }} onClick={() => setIsMinimized(!isMinimized)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} />
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>TroveSeek Support</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--clr-surface-2)' }}>
                {isConnecting ? (
                  <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', marginTop: '20px', fontSize: '14px' }}>Connecting to support...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', marginTop: '20px', fontSize: '14px' }}>
                    Send a message to start chatting with our team.
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderRole === 'CLIENT';
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isMine ? 'var(--clr-primary)' : 'var(--clr-surface)',
                          color: isMine ? '#fff' : 'var(--clr-text)',
                          border: isMine ? 'none' : '1px solid var(--clr-border)',
                          fontSize: '14px',
                          lineHeight: 1.5,
                          borderBottomRightRadius: isMine ? '4px' : '12px',
                          borderBottomLeftRadius: isMine ? '12px' : '4px',
                        }}>
                          {msg.content}
                          <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: isMine ? 'right' : 'left' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid var(--clr-border)', display: 'flex', gap: '8px', background: 'var(--clr-surface)' }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    background: 'var(--clr-surface-2)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '24px',
                    padding: '10px 16px',
                    color: 'var(--clr-text)',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: input.trim() ? 'var(--clr-primary)' : 'var(--clr-surface-3)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                >
                  <Send size={16} style={{ marginLeft: '2px' }} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
