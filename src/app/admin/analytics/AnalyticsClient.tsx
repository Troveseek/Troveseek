"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sparkles, TrendingUp, Users, DollarSign, DownloadCloud, Activity, Loader, X, Send } from 'lucide-react';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { toast } from 'sonner';

export default function AnalyticsAdminPage({ totalRevenue: initRev, totalUsers: initUsers, avgOrderValue: initAvg, dailyData: initDaily, salesData: initSales, insights: initInsights }: {
  totalRevenue: number;
  totalUsers: number;
  avgOrderValue: number;
  dailyData: { name: string; revenue: number; users: number }[];
  salesData: { name: string; value: number }[];
  insights: { type: string; title: string; description: string }[];
}) {
  const { formatPrice } = useCurrency();
  
  const [range, setRange] = useState(7);
  const [data, setData] = useState({ totalRevenue: initRev, totalUsers: initUsers, avgOrderValue: initAvg, dailyData: initDaily, salesData: initSales });
  const [insights, setInsights] = useState(initInsights);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);

  // Chat Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    if (range !== 7) {
      fetchData(range);
    }
  }, [range]);

  const fetchData = async (days: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${days}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (e) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Revenue,New Users\n"
      + data.dailyData.map(e => `${e.name},${e.revenue},${e.users}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${range}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsights(true);
    try {
      const res = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyticsData: data })
      });
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to refresh');
      }
      
      if (json.data && Array.isArray(json.data)) {
        setInsights(json.data);
        toast.success('AI Insights updated');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate insights. Did you set GEMINI_API_KEY in .env?');
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  const handleAskGemini = async () => {
    if (!chatQuestion.trim()) return;
    setIsChatting(true);
    try {
      const res = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: chatQuestion, analyticsData: data })
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error);
      setChatAnswer(json.answer);
    } catch (e: any) {
      toast.error(e.message || 'Failed to get answer');
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Ask Gemini Modal */}
      {isChatOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--clr-surface)', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Sparkles size={18} color="var(--clr-primary)" />
                 <h3 style={{ margin: 0, fontSize: '18px' }}>Ask Gemini</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}><X size={20} /></button>
            </div>
            
            <textarea 
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              placeholder="E.g. Why are my sales dropping?"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-elevated)', color: 'var(--clr-text)', minHeight: '80px', outline: 'none' }}
            />
            
            <Button variant="primary" icon={isChatting ? <Loader className="spin" size={16} /> : <Send size={16} />} onClick={handleAskGemini} disabled={isChatting}>
              Ask AI
            </Button>
            
            {chatAnswer && (
              <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', marginTop: '8px', fontSize: '14px', lineHeight: 1.5 }}>
                {chatAnswer}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Analytics & AI Insights</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Business performance and automated recommendations</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={range} onChange={(e) => setRange(parseInt(e.target.value))} style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', color: 'var(--clr-text)', outline: 'none' }}>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last 365 Days</option>
          </select>
          <Button variant="secondary" icon={<DownloadCloud size={16} />} onClick={handleExport}>Export Report</Button>
          <Button variant="primary" icon={isRefreshingInsights ? <Loader className="spin" size={16} /> : <Sparkles size={16} />} onClick={handleRefreshInsights} disabled={isRefreshingInsights}>
            {isRefreshingInsights ? 'Analyzing...' : 'Refresh Insights'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Main Analytics Area */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <Card>
              <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>Total Visitors</span>
                  <Users size={16} color="var(--clr-primary)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{isLoading ? '...' : data.totalUsers.toLocaleString()}</span>
                   <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-accent)' }}>for period</span>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>Total Revenue</span>
                  <DollarSign size={16} color="var(--clr-primary)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{isLoading ? '...' : formatPrice(data.totalRevenue)}</span>
                   <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-accent)' }}>for period</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>Avg Order Value</span>
                  <Activity size={16} color="var(--clr-primary)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{isLoading ? '...' : formatPrice(data.avgOrderValue)}</span>
                   <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)' }}>per order</span>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Traffic Chart */}
          <Card>
            <CardHeader style={{ padding: '24px 24px 0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Revenue &amp; Signups</h3>
            </CardHeader>
            <CardBody style={{ padding: '24px' }}>
              <div style={{ width: '100%', height: '300px' }}>
                {isLoading ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader className="spin" color="var(--clr-text-muted)" /></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data.dailyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--clr-primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--clr-primary)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--clr-accent)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--clr-accent)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border)" />
                       <XAxis dataKey="name" stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip 
                         contentStyle={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }}
                         itemStyle={{ color: 'var(--clr-text)' }}
                       />
                       <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="var(--clr-accent)" fillOpacity={1} fill="url(#colorViews)" />
                       <Area type="monotone" dataKey="users" name="New Users" stroke="var(--clr-primary)" fillOpacity={1} fill="url(#colorVisitors)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardBody>
          </Card>
          
          {/* Sales Distribution */}
          <Card>
            <CardHeader style={{ padding: '24px 24px 0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Revenue by Category</h3>
            </CardHeader>
            <CardBody style={{ padding: '24px' }}>
              <div style={{ width: '100%', height: '250px' }}>
                {isLoading ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader className="spin" color="var(--clr-text-muted)" /></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border)" />
                      <XAxis dataKey="name" stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }}
                        cursor={{ fill: 'var(--clr-surface-elevated)' }}
                      />
                      <Bar dataKey="value" fill="var(--clr-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar - AI Insights */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(124, 111, 255, 0.1), rgba(0, 229, 176, 0.1))', borderRadius: '16px', padding: '2px' }}>
            <div style={{ background: 'var(--clr-surface)', borderRadius: '14px', padding: '24px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Gemini Insights</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>AI-driven business analysis</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {insights.map((insight, i) => (
                  <div key={i} style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: 'var(--clr-surface-elevated)',
                    border: '1px solid var(--clr-border)',
                    borderLeft: `3px solid ${
                      insight.type === 'opportunity' ? 'var(--clr-accent)' : 
                      insight.type === 'warning' ? '#ffaa00' : 
                      'var(--clr-primary)'
                    }`
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--clr-text)' }}>
                      {insight.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <Button variant="primary" style={{ width: '100%', marginTop: '24px' }} onClick={() => setIsChatOpen(true)}>Ask Gemini a Question</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
