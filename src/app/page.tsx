'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import RecentLoansToast from '@/components/RecentLoansToast';
import Modal from '@/components/Modal';

export default function LandingPage() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(20000);
  const [repaymentMonths, setRepaymentMonths] = useState(3);
  
  const [isTcOpen, setIsTcOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Constants
  const interestRate = 0.10; // 10%
  const processingFeeRate = 0.02; // 2%

  // Calculations
  const totalInterest = loanAmount * interestRate;
  const processingFee = loanAmount * processingFeeRate;
  const totalRepayment = loanAmount + totalInterest;
  const monthlyInstallment = Math.round(totalRepayment / repaymentMonths);

  const handleApply = () => {
    sessionStorage.setItem('preSelectedAmount', loanAmount.toString());
    sessionStorage.setItem('preSelectedMonths', repaymentMonths.toString());
    router.push('/apply');
  };

  return (
    <main className="landing-layout">
      <ThemeToggle />
      <RecentLoansToast />

      {/* Navigation Header */}
      <header className="main-header">
        <div className="container header-container">
          <div className="logo-brand">
            <span className="logo-icon">💸</span>
            <span className="logo-text">Pesa<span className="logo-highlight">Swift</span></span>
          </div>
          <nav className="main-nav">
            <a href="#calculator">Calculator</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Reviews</a>
          </nav>
          <button className="nav-cta btn-primary" onClick={handleApply}>
            Apply Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">⚡ Instant Disbursal to M-PESA</div>
            <h1 className="hero-title">
              Instant Loans. <br />
              <span className="text-gradient">Zero Paperwork.</span>
            </h1>
            <p className="hero-description">
              PesaSwift connects you to quick micro-loans between Ksh. 5,000 and Ksh. 50,000. Get approved in under 2 minutes and have the cash sent straight to your phone.
            </p>
            <div className="hero-actions">
              <button className="btn-primary hero-btn" onClick={handleApply}>
                Check Loan Eligibility
              </button>
              <a href="#calculator" className="btn-secondary hero-btn">
                Repayment Calculator
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="phone-mockup-wrapper">
              <div className="phone-mockup-frame">
                <div className="phone-screen">
                  <div className="app-status-bar">
                    <span>PesaSwift v2.0</span>
                    <span>📶 ⚡ 100%</span>
                  </div>
                  <div className="app-card">
                    <div className="card-header">
                      <span>Available Limit</span>
                      <span className="limit-amount">Ksh. 50,000</span>
                    </div>
                    <div className="card-body">
                      <div className="loan-badge">LOAN DISBURSED</div>
                      <div className="success-check">✓</div>
                      <p>Ksh. 25,000 sent to M-PESA number 0742***965</p>
                    </div>
                  </div>
                  <div className="app-transaction">
                    <div className="tx-row">
                      <span>Transaction ID</span>
                      <strong>TX-74B091X</strong>
                    </div>
                    <div className="tx-row">
                      <span>Verification</span>
                      <span className="status-success">Success</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="calculator-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Calculate Your Repayment</h2>
            <p className="section-subtitle">Set your amount and time to see your exact repayments. Transparent pricing with no hidden charges.</p>
          </div>

          <div className="calculator-wrapper glass-panel">
            <div className="calculator-sliders">
              <div className="slider-group">
                <div className="slider-label-row">
                  <span>How much do you need?</span>
                  <span className="slider-value">Ksh. {loanAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="50000" 
                  step="1000" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="loan-range-slider"
                />
                <div className="slider-bounds">
                  <span>Ksh. 5,000</span>
                  <span>Ksh. 50,000</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Repayment Period</span>
                  <span className="slider-value">{repaymentMonths} {repaymentMonths === 1 ? 'Month' : 'Months'}</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="6" 
                  step="1" 
                  value={repaymentMonths} 
                  onChange={(e) => setRepaymentMonths(Number(e.target.value))}
                  className="loan-range-slider"
                />
                <div className="slider-bounds">
                  <span>2 Months</span>
                  <span>6 Months</span>
                </div>
              </div>
            </div>

            <div className="calculator-summary">
              <div className="summary-list">
                <div className="summary-row">
                  <span>Interest Rate</span>
                  <strong>10%</strong>
                </div>
                <div className="summary-row">
                  <span>Interest Amount</span>
                  <strong>Ksh. {totalInterest.toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Processing Fee (2%)</span>
                  <strong>Ksh. {processingFee.toLocaleString()}</strong>
                </div>
                <div className="summary-row total-row">
                  <span>Total Repayment</span>
                  <strong>Ksh. {totalRepayment.toLocaleString()}</strong>
                </div>
              </div>
              
              <div className="installment-box">
                <span className="installment-label">Monthly Installment</span>
                <span className="installment-value">Ksh. {monthlyInstallment.toLocaleString()}</span>
              </div>

              <button className="btn-primary calc-cta" onClick={handleApply}>
                Get Loan Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How PesaSwift Works</h2>
            <p className="section-subtitle">Get your loan in 3 quick steps right from your browser.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card glass-panel">
              <div className="step-num">01</div>
              <h3>Apply in Seconds</h3>
              <p>Enter your basic details including ID number and M-PESA phone number. We do not require long application forms or paperwork.</p>
            </div>
            
            <div className="step-card glass-panel">
              <div className="step-num">02</div>
              <h3>Verify Details</h3>
              <p>A secure Safaricom M-PESA STK Push prompt is sent directly to your phone. Enter your PIN to authenticate identity and approve transaction terms.</p>
            </div>

            <div className="step-card glass-panel">
              <div className="step-num">03</div>
              <h3>Instant Disbursal</h3>
              <p>As soon as your details are authenticated, the loan is disbursed instantly to your M-PESA account without any processing delays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Loved by Thousands</h2>
            <p className="section-subtitle">Read what our clients say about PesaSwift instant mobile loans.</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card glass-panel">
              <div className="stars">★★★★★</div>
              <p className="testi-text">"PesaSwift is a lifesaver. I got Ksh. 10,000 for emergency utility bills at 2 AM. The loan arrived instantly after I put in my PIN. Best experience ever!"</p>
              <div className="testi-user">
                <strong>Alice Mwende</strong>
                <span>Nairobi, Kenya</span>
              </div>
            </div>

            <div className="testimonial-card glass-panel">
              <div className="stars">★★★★★</div>
              <p className="testi-text">"I love the design and transparency. The calculator is completely honest about the interest and fees. Highly secure callback integration."</p>
              <div className="testi-user">
                <strong>Dennis Rotich</strong>
                <span>Nakuru, Kenya</span>
              </div>
            </div>

            <div className="testimonial-card glass-panel">
              <div className="stars">★★★★★</div>
              <p className="testi-text">"Highly recommended over other mobile loan apps. No intrusive app permissions requested, it just runs smoothly in the browser."</p>
              <div className="testi-user">
                <strong>Mary Achieng</strong>
                <span>Kisumu, Kenya</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="legal-footer">
        <div className="container">
          <div className="footer-links">
            <button className="footer-link-btn" onClick={() => setIsTcOpen(true)}>Terms & Conditions</button>
            <span className="divider">•</span>
            <button className="footer-link-btn" onClick={() => setIsPrivacyOpen(true)}>Privacy Policy</button>
          </div>
          <p className="footer-text">&copy; 2026 PesaSwift. Licensed Microfinance Partner. All rights reserved.</p>
          <p className="footer-note">Loans are subject to approval. Late payments will lead to CRB listing under Kenyan regulations.</p>
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={isTcOpen} onClose={() => setIsTcOpen(false)} title="Terms & Conditions">
        <ol className="modal-list">
          <li>You must be a Kenyan citizen of 18 years or older with a valid National ID.</li>
          <li>All loans are subject to a fixed interest rate of 10% per transaction.</li>
          <li>We require a non-refundable M-PESA registration and verification fee of Ksh. 120, executed via Safaricom STK Push, to validate your phone number and identity.</li>
          <li>Defaulting on repayments may result in negative listing on Credit Reference Bureaus (CRB).</li>
        </ol>
      </Modal>

      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Privacy Policy">
        <ul className="modal-list">
          <li>We only collect details required for registration: Name, National ID, Phone Number, and Loan Preference.</li>
          <li>We encrypt all transactional details in our secure MySQL database.</li>
          <li>We never store or request your M-PESA PIN. All verification is handled directly by Safaricom Daraja API callbacks.</li>
          <li>You can request account deletion by emailing our support desk.</li>
        </ul>
      </Modal>
    </main>
  );
}
