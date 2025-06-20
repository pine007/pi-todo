'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const { register, error, clearError, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      setValidationError('两次密码输入不一致');
      return;
    }
    
    try {
      await register(username, email, password);
    } catch (error) {
        console.log(error);
    }
  };


  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <h1 className="mb-6 text-center text-2xl font-bold">注册</h1>
        
        {(error || validationError) && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error || validationError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="用户名"
            type="text"
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearError();
              setValidationError('');
            }}
            required
            placeholder="请选择用户名"
          />
          
          <Input
            label="邮箱"
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
              setValidationError('');
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
              setValidationError('');
            }}
            required
            placeholder="请创建密码"
          />
          
          <Input
            label="确认密码"
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              clearError();
              setValidationError('');
            }}
            required
            placeholder="请确认密码"
          />
          
          <Button type="submit" className="w-full" isLoading={loading}>
            注册
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          已有账号？{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            立即登录
          </Link>
        </p>
      </Card>
    </div>
  );
}
