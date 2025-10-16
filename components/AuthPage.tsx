import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordModal from './ForgotPasswordModal';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <>
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
      <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <svg className="mx-auto h-12 w-auto text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-3.313 0-4.97 1.002-6.002C14.004 4 15.657 4 18.963 4h.074c3.306 0 4.96 0 5.961 1.002C26 6.004 26 7.657 26 10.963v2.074c0 3.306 0 4.96-1.002 5.961C23.96 20 22.306 20 18.963 20h-.074c-3.306 0-4.96 0-5.961-1.002C12 17.996 12 16.343 12 13.037V11z M12 11h-1.037c-3.306 0-4.96 0-5.961 1.002C4 13.004 4 14.657 4 17.963v.074c0 3.306 0 4.96 1.002 5.961C6.004 25 7.657 25 10.963 25h2.074c3.306 0 4.96 0 5.961-1.002C20 22.996 20 21.343 20 18.037V17" transform="translate(-3 -3)" />
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-text">
            {isLoginView ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-dark-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isLoginView ? <LoginForm onForgotPassword={() => setShowForgotPassword(true)} /> : <RegisterForm />}
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-card text-dark-text-secondary">
                    {isLoginView ? 'Or' : ''}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="w-full inline-flex justify-center py-2 px-4 border border-dark-border rounded-md shadow-sm bg-dark-card text-sm font-medium text-dark-text-secondary hover:bg-gray-800"
                >
                  {isLoginView ? 'Create a new account' : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;