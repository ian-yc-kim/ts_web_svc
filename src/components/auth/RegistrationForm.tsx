import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as EmailValidator from 'email-validator';
import { useNavigate } from 'react-router-dom';
import { register as authRegister } from '../../services/auth-service';
import PasswordValidator from 'password-validator';

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

// Use password-validator per project guidelines
const pwdSchema = new PasswordValidator();
pwdSchema.is().min(8);
pwdSchema.has().letters();
pwdSchema.has().digits();

const schema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .refine((val) => EmailValidator.validate(val), { message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((val) => pwdSchema.validate(val) === true, {
        message: 'Password must contain at least one letter and one number',
      }),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const RegistrationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' });

  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    try {
      await authRegister(data.email, data.password);
      navigate('/login', { replace: true, state: { message: 'Registration successful' } });
    } catch (error: unknown) {
      console.error('RegistrationForm:', error);
      let message = 'Registration failed. Please try again.';
      if (error instanceof Error) message = error.message || message;
      setFormError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Register</h2>

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

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <div style={{ color: 'red' }}>{errors.confirmPassword.message}</div>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        Register
      </button>
    </form>
  );
};

export default RegistrationForm;
