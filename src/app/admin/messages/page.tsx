"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Search, Mail, Send, Archive, CheckCircle2, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';

export default function MessagesAdminPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat/session');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error('Failed to fetch sessions', e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Subscribe to SSE for real-time updates (admin channel)
  useEffect(() => {
    const eventSource = new EventSource('/api/chat/stream');
    
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'connected') return;

      // Refresh session list on new message
      fetchSessions();

      // If this message belongs to the active session, append it
      if (data.sessionId === activeSessionId) {
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    };

    return () => eventSource.close();
  }, [activeSessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectSession = async (session: any) => {
    setActiveSessionId(session.id);
    // Fetch all messages for this session
    try {
      const res = await fetch(`/api/chat/session?sessionId=${session.id}`);
      const data = await res.json();
      const found = data.sessions?.find((s: any) => s.id === session.id);
      setMessages(found?.messages || session.messages || []);
    } catch (e) {
      setMessages(session.messages || []);
    }

    // Mark messages as read
    fetch('/api/chat/message', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id })
    });
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !activeSessionId) return;
    setIsSending(true);
    const content = replyContent;
    setReplyContent('');

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId, content })
      });
      if (!res.ok) throw new Error('Failed');
    } catch (e) {
      toast.error('Failed to send reply');
      setReplyContent(content); // restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const filteredSessions = sessions.filter(s =>
    !search || s.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const unreadCount = (session: any) => 
    (session.messages || []).filter((m: any) => !m.isRead && m.senderRole === 'CLIENT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Messages</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Live chat inbox — {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<CheckCircle2 size={16} />} onClick={fetchSessions}>
            Refresh
          </Button>
        </div>
      </div>

      <Card style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>
        {/* Left Pane - Session List */}
        <div style={{ width: '350px', borderRight: '1px solid var(--clr-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--clr-border)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--clr-surface-2)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: '8px',
                  padding: '10px 12px 10px 36px',
                  color: 'var(--clr-text)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredSessions.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                <MessageSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No conversations yet</p>
                <p style={{ margin: '8px 0 0', fontSize: '12px' }}>Client messages will appear here when they start a chat</p>
              </div>
            ) : filteredSessions.map(session => {
              const lastMsg = session.messages?.[0];
              const unread = unreadCount(session);
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => selectSession(session)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--clr-border)',
                    cursor: 'pointer',
                    background: isActive ? 'var(--clr-primary-dim)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--clr-primary)' : '3px solid transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: session.user?.image ? `url(${session.user.image}) center/cover` : 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 600, fontSize: '16px', flexShrink: 0
                    }}>
                      {!session.user?.image && (session.user?.name?.charAt(0) || <User size={18} />)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: unread > 0 ? 700 : 500, fontSize: '14px', color: 'var(--clr-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.user?.name || session.user?.email || 'Unknown'}
                        </span>
                        {unread > 0 && (
                          <span style={{ background: 'var(--clr-primary)', color: '#fff', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                            {unread}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                        {session.subject || 'General Inquiry'}
                      </div>
                      {lastMsg && (
                        <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                          {lastMsg.senderRole === 'ADMIN' ? '↩ You: ' : ''}{lastMsg.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane - Conversation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeSession ? (
            <>
              {/* Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--clr-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: activeSession.user?.image ? `url(${activeSession.user.image}) center/cover` : 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '18px'
                  }}>
                    {!activeSession.user?.image && (activeSession.user?.name?.charAt(0) || 'U')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{activeSession.user?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{activeSession.user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '12px', background: 'rgba(0,229,176,0.1)', color: 'var(--clr-accent)', border: '1px solid rgba(0,229,176,0.3)', borderRadius: '999px', padding: '4px 10px', fontWeight: 600 }}>
                    ● {activeSession.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--clr-surface-2)' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', margin: 'auto', fontSize: '14px' }}>
                    <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p>No messages yet in this conversation</p>
                  </div>
                ) : messages.map(msg => {
                  const isAdmin = msg.senderRole === 'ADMIN';
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        background: isAdmin ? 'var(--clr-primary)' : 'var(--clr-surface)',
                        color: isAdmin ? '#fff' : 'var(--clr-text)',
                        border: isAdmin ? 'none' : '1px solid var(--clr-border)',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        borderBottomRightRadius: isAdmin ? '4px' : '16px',
                        borderBottomLeftRadius: isAdmin ? '16px' : '4px',
                      }}>
                        {msg.content}
                        <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.7, textAlign: isAdmin ? 'right' : 'left' }}>
                          {isAdmin ? 'You · ' : `${activeSession.user?.name?.split(' ')[0] || 'Client'} · `}
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--clr-border)', background: 'var(--clr-surface)', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  style={{
                    flex: 1,
                    background: 'var(--clr-surface-2)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: 'var(--clr-text)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: 1.5,
                  }}
                />
                <Button
                  variant="primary"
                  icon={<Send size={16} />}
                  onClick={sendReply}
                  disabled={!replyContent.trim() || isSending}
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--clr-text-muted)', gap: '12px' }}>
              <Mail size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '16px', fontWeight: 500 }}>Select a conversation</p>
              <p style={{ fontSize: '13px' }}>Choose a client conversation from the left to view and reply</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
