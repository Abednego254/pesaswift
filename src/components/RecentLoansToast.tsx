'use client';

import React, { useState, useEffect } from 'react';

const names = ['Kiprotich', 'Amina', 'Wanjiku', 'Omondi', 'Mwangi', 'Chepngetich', 'Nekesa', 'Juma'];
const prefixes = ['0718', '0722', '0700', '0742', '0799', '0112'];
const loanTypes = ['Emergency Loan', 'Business Loan', 'Salary Advance', 'Medical Loan'];

function generateRandomToast() {
  const name = names[Math.floor(Math.random() * names.length)];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const phone = `${prefix}xxx${Math.floor(1000 + Math.random() * 9000)}`;
  const amount = Math.floor(5 + Math.random() * 45) * 1000;
  const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
  const timeAgo = `${Math.floor(1 + Math.random() * 59)}s Ago`;

  return { name, phone, amount, loanType, timeAgo };
}

export default function RecentLoansToast() {
  const [toastData, setToastData] = useState<ReturnType<typeof generateRandomToast> | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setToastData(generateRandomToast());
      setShow(true);
    }, 4000);

    const intervalId = setInterval(() => {
      setShow(false);
      
      setTimeout(() => {
        setToastData(generateRandomToast());
        setShow(true);
      }, 1000);

    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, []);

  if (!toastData) return null;

  return (
    <div className={`recent-toast glass-panel ${show ? 'show' : ''}`}>
      <div className="toast-glow" />
      <div className="toast-content">
        <div className="toast-header">
          <span className="toast-indicator">●</span>
          <strong className="toast-name">{toastData.name} ({toastData.phone})</strong>
          <span className="toast-time">{toastData.timeAgo}</span>
        </div>
        <div className="toast-desc">
          Received <span>Ksh. {toastData.amount.toLocaleString()}</span> ({toastData.loanType})
        </div>
      </div>
    </div>
  );
}
