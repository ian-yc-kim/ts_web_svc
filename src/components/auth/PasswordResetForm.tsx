import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as EmailValidator from 'email-validator';
import { requestPasswordReset } from '../../services/auth-service';

type FormValues = {
  email: string;
};

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine((val) => EmailValidator.validate(val), { message: 'Invalid email address' }),
});

export const PasswordResetForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' });

  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    try {
      await requestPasswordReset(data.email);
      setSuccess(true);
    } catch (error: unknown) {
      console.error('PasswordResetForm:', error);
      let message = 'Request failed. Please try again.';
      if (error instanceof Error) message = error.message || message;
      setFormError(message);
    }
  };

  if (success) {
    return (
      <div role="status">If an account exists, a reset link has been sent to your email.</div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Password Reset</h2>

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

      <button type="submit" disabled={isSubmitting}>
        Send Reset Link
      </button>
    </form>
  );
};

export default PasswordResetForm;
