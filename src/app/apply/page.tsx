'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import RecentLoansToast from '@/components/RecentLoansToast';
import ThemeToggle from '@/components/ThemeToggle';

export default function ApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idNumber: '',
    loanType: 'Emergency Loan',
  });

  const [isTcOpen, setIsTcOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      // Store in session storage for the status page
      sessionStorage.setItem('loanStatusData', JSON.stringify(data.data));
      router.push('/status');
      
    } catch (err) {
      setError('Network error. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <main className="apply-layout">
      <ThemeToggle />
      <RecentLoansToast />

      <div className="container apply-container">
        
        {/* Left Side: Info */}
        <div className="apply-info-side">
          <a href="/" className="back-link">
            ← Back to Home
          </a>
          <h1 className="apply-brand-title">Pesa<span className="logo-highlight">Swift</span> Loans</h1>
          <p className="apply-subtitle">
            Provide your authentic details to verify eligibility. We secure all personal data with AES-256 bank-grade encryption.
          </p>

          <div className="stats-box glass-panel">
            <div className="stat-item">
              <span className="stat-number">2 Min</span>
              <span className="stat-desc">Disbursal Time</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-item">
              <span className="stat-number">99.8%</span>
              <span className="stat-desc">Approval Rate</span>
            </div>
          </div>

          <div className="info-notes">
            <div className="note-item">
              <span className="note-icon">🛡️</span>
              <p>Certified micro-lending compliance under Central Bank of Kenya rules.</p>
            </div>
            <div className="note-item">
              <span className="note-icon">⚡</span>
              <p>M-PESA checkout requires prompt confirmation within 30 seconds.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="apply-form-side glass-panel">
          <h3 className="form-title">Loan Eligibility Check</h3>
          <p className="form-subtitle">Fill in your information to view your qualified limit.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="name" 
                className="form-input" 
                placeholder="As it appears on your ID" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">M-PESA Mobile Number</label>
              <input 
                type="text" 
                name="phone" 
                className="form-input" 
                placeholder="e.g. 0712345678" 
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">National ID Number</label>
              <input 
                type="text" 
                name="idNumber" 
                className="form-input" 
                placeholder="8-digit ID number" 
                value={formData.idNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Loan Classification</label>
              <select 
                name="loanType" 
                className="form-input select-input" 
                value={formData.loanType}
                onChange={handleInputChange}
                required
              >
                <option value="Emergency Loan">Emergency Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Salary Advance">Salary Advance</option>
                <option value="Medical Loan">Medical Loan</option>
              </select>
            </div>

            {error && <span className="error-message apply-error">{error}</span>}

            <button type="submit" className="btn-primary apply-submit" disabled={loading}>
              {loading ? 'Processing...' : 'FIND MY LOAN LIMIT'}
            </button>
          </form>

          <div className="form-privacy-note">
            By clicking checking limit, you consent to our{' '}
            <button className="text-btn" onClick={() => setIsTcOpen(true)}>Terms & Conditions</button>
            {' '}and{' '}
            <button className="text-btn" onClick={() => setIsPrivacyOpen(true)}>Privacy Policy</button>.
          </div>
        </div>

      </div>

      {/* Modals */}
      <Modal isOpen={isTcOpen} onClose={() => setIsTcOpen(false)} title="Terms & Conditions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>1. Borrowers must possess a valid Kenyan National ID and be 18 years or older.</p>
          <p>2. Loan facilities are charged at a flat interest rate of 10% per transaction.</p>
          <p>3. PesaSwift requires a non-refundable M-PESA validation fee of Ksh. 120, sent via STK Push, to authenticate details and prevent identity fraud.</p>
          <p>4. Upon validation, disbursal is executed instantly to the provided M-PESA number.</p>
        </div>
      </Modal>

      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Privacy Policy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>1. We collect full name, phone number, ID number, and preferred loan classification to verify loan limits.</p>
          <p>2. Data is encrypted and securely stored in our MySQL serverless database on Railway.</p>
          <p>3. We do not store or access your credit cards, banking passwords, or M-PESA PIN.</p>
          <p>4. You can request account deletion by contacting support.</p>
        </div>
      </Modal>

    </main>
  );
}
