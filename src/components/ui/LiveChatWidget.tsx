"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { MessageSquare, X, Send, Minimize2, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './LiveChatWidget.module.css';

export default function LiveChatWidget() {
  const { data: session } = useSession();
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for external trigger (e.g., from ContactPreview "Live Chat" button)
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
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
  }, [isOpen, sessionId, session, isConnecting]);

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
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className={styles.floatingBtn}
          aria-label={isAr ? 'محادثة الدعم' : 'Live Chat Support'}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`${styles.chatWindow} ${isMinimized ? styles.minimized : ''}`}>
          {/* Header */}
          <div 
            className={styles.chatHeader}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className={styles.headerLeft}>
              <button 
                className={styles.headerBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                aria-label={isAr ? 'إغلاق أو رجوع' : 'Back or Close'}
                title={isAr ? 'رجوع' : 'Back'}
              >
                {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              </button>
              <span className={styles.headerTitle}>
                {isAr ? 'دعم TroveSeek المباشر' : 'TroveSeek Support'}
              </span>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsMinimized(!isMinimized); 
                }} 
                className={styles.headerBtn}
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsOpen(false); 
                }} 
                className={styles.headerBtn}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className={styles.messagesArea}>
                {isConnecting ? (
                  <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', margin: 'auto', fontSize: '13px' }}>
                    {isAr ? 'جاري الاتصال بفريق الدعم...' : 'Connecting to support...'}
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', margin: 'auto', fontSize: '13px' }}>
                    <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>{isAr ? 'أهلاً بك!' : 'Welcome!'}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                      {isAr ? 'أرسل رسالة لبدء المحادثة مع فريقنا.' : 'Send a message to start chatting with our team.'}
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderRole === 'CLIENT';
                    return (
                      <div 
                        key={msg.id} 
                        className={`${styles.msgRow} ${isMine ? styles.msgRowMine : styles.msgRowOther}`}
                      >
                        <div className={`${styles.msgBubble} ${isMine ? styles.msgBubbleMine : styles.msgBubbleOther}`}>
                          {msg.content}
                          <div className={styles.msgTime}>
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
              <form onSubmit={sendMessage} className={styles.inputArea}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالتك...' : 'Type a message...'}
                  className={styles.inputField}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={styles.sendBtn}
                  aria-label={isAr ? 'إرسال' : 'Send'}
                >
                  <Send size={15} style={{ marginLeft: isAr ? 0 : '2px', marginRight: isAr ? '2px' : 0 }} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
