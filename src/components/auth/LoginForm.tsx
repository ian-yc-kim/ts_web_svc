import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as EmailValidator from 'email-validator';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../../types/auth';

type FormValues = {
  email: string;
  password: string;
};

const passwordHasLetterAndDigit = (s: string) => {
  let hasLetter = false;
  let hasDigit = false;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') hasDigit = true;
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) hasLetter = true;
    if (hasLetter && hasDigit) return true;
  }
  return false;
};

const schema = z.object({
  email: z
    .string()
    .nonempty('Email is required')
    .refine((val) => EmailValidator.validate(val), { message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => passwordHasLetterAndDigit(val), {
      message: 'Password must contain at least one letter and one number',
    }),
});

export const LoginForm = () => {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  const { errors } = formState;
  const auth = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    try {
      await auth.login({ email: data.email, password: data.password } as LoginCredentials);
      navigate('/board', { replace: true });
    } catch (error: unknown) {
      console.error('LoginForm:', error);
      let message = 'Login failed. Please try again.';
      if (error instanceof Error) message = error.message || message;
      setFormError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Sign In</h2>

      {formError && (
        <div role="alert" style={{ color: 'red', marginBottom: '8px' }}>
          {formError}
        </div>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <div style={{ color: 'red' }}>{errors.email.message}</div>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <div style={{ color: 'red' }}>{errors.password.message}</div>}
      </div>

      <button type="submit">Login</button>
    </form>
  );
};
