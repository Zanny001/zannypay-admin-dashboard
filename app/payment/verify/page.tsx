'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/v1/wallet/verify/${reference}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}` 
          }
        });
        
        const data = await res.json();
        
        if (data.success || data.status === 'completed') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        
        {status === 'loading' && (
          <div>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            <h2 className="text-xl font-semibold text-gray-800">Verifying your payment...</h2>
            <p className="mt-2 text-sm text-gray-500">Please do not close this page.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Payment Successful!</h2>
            <p className="mb-6 text-sm text-gray-600">
              Your wallet has been credited. Reference: <br/>
              <span className="font-mono text-xs font-semibold">{reference}</span>
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Go back to Dashboard
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Payment Unsuccessful</h2>
            <p className="mb-6 text-sm text-gray-600">We could not verify this transaction.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-300"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPaymentContent />
    </Suspense>
  );
}
