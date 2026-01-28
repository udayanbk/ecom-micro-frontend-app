import React from 'react';

type Props = {
  isAuthenticated: boolean;
  cartCount: number;
  onLogin?: () => void;
  onLogout?: () => void;
  onCart?: () => void;
};

const Header: React.FC<Props> = ({
  isAuthenticated,
  cartCount,
  onLogin,
  onLogout,
  onCart,
}) => {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* App name */}
        <h1 className="text-xl font-semibold text-blue-600">
          Next-Shop
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button
              onClick={onCart}
              className="relative px-3 py-1.5 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200"
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="px-4 py-1.5 text-sm font-medium rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="px-4 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
