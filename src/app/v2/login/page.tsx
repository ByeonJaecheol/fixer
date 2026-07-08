import { Suspense } from 'react';
import LoginForm from './_components/LoginForm';

export default function V2LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
      <LoginForm />
    </Suspense>
  );
}
