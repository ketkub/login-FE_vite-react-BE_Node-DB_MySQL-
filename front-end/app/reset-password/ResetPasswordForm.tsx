'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token'); // ดึง token จาก URL

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!token) {
      alert('Invalid or missing reset token.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }), 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setMessage(data.message + '. Redirecting to login...');
      setTimeout(() => {
        router.push('/login'); 
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return <div>Validating token...</div>;
  }

  return (
    <div className="flex justify-center items-start pt-20 min-h-screen">
    <form
      onSubmit={handleSubmit}
      className="p-8 w-full max-w-md space-y-4 dark:bg-slate-800 shadow-md border-0 rounded-lg"
    >
      <h2 className="text-center text-2xl font-bold">Reset Your Password</h2>

      <div>
          <Label style={{ marginBottom: '8px' }}>Email</Label>
          <Input
            type="password"
            placeholder="Enter your email"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

      <div>
          <Label style={{ marginBottom: '8px' }}>confirm Password</Label>
          <Input
            type="password"
            placeholder="confirm your Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

      <Button type="submit" className="w-full mt-2 cursor-pointer">
          Submit
        </Button>
    </form>
    </div>
  );
}