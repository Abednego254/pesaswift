'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function SuccessPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('loanStatusData');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main className="success-layout">
      <ThemeToggle />
      
      {/* Confetti Animation Background */}
      <div className="confetti-container">
        {[...Array(24)].map((_, i) => (
          <div key={i} className={`confetti piece-${i}`}></div>
        ))}
      </div>

      <div className="success-card glass-panel">
        
        {/* Animated Checkmark */}
        <div className="success-checkmark">
          <div className="check-icon">
            <span className="icon-line line-tip"></span>
            <span className="icon-line line-long"></span>
            <div className="icon-circle"></div>
          </div>
        </div>

        <h1 className="success-title">Loan Approved!</h1>
        <p className="success-subtitle">Verification fee processed successfully.</p>

        <div className="success-amount-box">
          <span className="amount-label">Disbursing directly to {data.mpesaNumber}</span>
          <h2 className="amount-value">Ksh. {data.qualifiedAmt?.toLocaleString()}</h2>
        </div>

        <p className="success-message">
          Hi <strong>{data.name.split(' ')[0]}</strong>, your funds are now being processed by Safaricom and will reflect in your M-PESA mobile wallet within <strong>5-7 working days</strong>.
        </p>

        <button className="btn-primary success-btn" onClick={() => router.push('/')}>
          Return to Dashboard
        </button>
      </div>
    </main>
  );
}
