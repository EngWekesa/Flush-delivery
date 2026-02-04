import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'rider'>('customer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          onClose();
          resetForm();
        } else if (result.pendingApproval) {
          setError(result.error || 'Your account is pending approval');
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        if (!fullName || !phone) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const result = await register(email, password, fullName, phone, userType);
        if (result.success) {
          if (result.pendingApproval) {
            // Rider signup - show success message but don't close modal
            setSuccessMessage(
              'Your rider application has been submitted! Please wait for admin approval. You will be notified once your account is approved.'
            );
            resetForm();
          } else {
            // Customer signup - close modal
            onClose();
            resetForm();
          }
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setUserType('customer');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-800">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Application Submitted!</h3>
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSuccessMessage(null);
                  setIsLogin(true);
                }}
                className="mt-4 w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Daniel Wekesa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="0708770746"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('customer')}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        userType === 'customer'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium">Customer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('rider')}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        userType === 'rider'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-medium">Rider</span>
                    </button>
                  </div>
                  {userType === 'rider' && (
                    <p className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Rider accounts require admin approval before you can start accepting orders.
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : userType === 'rider' ? 'Submit Application' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-green-600 font-semibold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
