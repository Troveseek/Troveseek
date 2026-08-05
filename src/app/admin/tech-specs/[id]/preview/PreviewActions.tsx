"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Download, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PreviewActions({ specId }: { specId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/tech-specs/${specId}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate invoice');

      router.push(`/admin/invoices/${data.invoiceId}`);
    } catch (err: any) {
      alert(err.message || 'Error generating invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      <Link href="/admin/tech-specs">
        <Button variant="ghost" icon={<ArrowLeft size={18} />}>Back to Specs</Button>
      </Link>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button 
          variant="secondary" 
          icon={isGenerating ? <Loader2 size={16} className="spin" /> : <FileText size={16} color="var(--clr-primary)" />} 
          onClick={handleGenerateInvoice}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating Invoice...' : 'Generate Official Invoice'}
        </Button>
        <Button variant="secondary" icon={<Download size={16} />} onClick={handlePrint}>
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}
