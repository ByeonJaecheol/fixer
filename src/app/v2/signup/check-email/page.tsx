import { Suspense } from 'react';
import CheckEmailContent from './CheckEmailContent';

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
      <CheckEmailContent />
    </Suspense>
  );
}
