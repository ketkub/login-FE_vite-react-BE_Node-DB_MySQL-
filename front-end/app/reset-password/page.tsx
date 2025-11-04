import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm'; 

export default function ResetPasswordPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}