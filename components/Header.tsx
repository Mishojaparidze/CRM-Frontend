import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { GlobalSearch } from './GlobalSearch';

const Header: React.FC = () => {
  const { logout, user, isAdmin } = useAuth();

  return (
    <header className="bg-dark-card shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <svg className="h-8 w-auto text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-3.313 0-4.97 1.002-6.002C14.004 4 15.657 4 18.963 4h.074c3.306 0 4.96 0 5.961 1.002C26 6.004 26 7.657 26 10.963v2.074c0 3.306 0 4.96-1.002 5.961C23.96 20 22.306 20 18.963 20h-.074c-3.306 0-4.96 0-5.961-1.002C12 17.996 12 16.343 12 13.037V11z M12 11h-1.037c-3.306 0-4.96 0-5.961 1.002C4 13.004 4 14.657 4 17.963v.074c0 3.306 0 4.96 1.002 5.961C6.004 25 7.657 25 10.963 25h2.074c3.306 0 4.96 0 5.961-1.002C20 22.996 20 21.343 20 18.037V17" transform="translate(-3 -3)" />
            </svg>
            <span className="font-bold text-xl text-white">CRM</span>
          </div>

          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            {isAdmin && <GlobalSearch />}
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0">
              <span className="text-dark-text-secondary hidden sm:block">
                Hello, <span className="font-semibold text-dark-text">{user?.username}</span>
                {isAdmin && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary text-white">Admin</span>}
              </span>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;