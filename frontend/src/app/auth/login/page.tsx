'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const { login, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <h1 className="mb-6 text-center text-2xl font-bold">登录</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="邮箱"
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            required
            placeholder="请输入邮箱"
          />
          
          <Input
            label="密码"
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            required
            placeholder="请输入密码"
          />
          
          <Button type="submit" className="w-full" isLoading={loading}>
            登录
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          还没有账号？{' '}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            立即注册
          </Link>
        </p>
      </Card>
    </div>
  );
}