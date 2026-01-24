"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setError("Demo mode - API integration preserved");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-violet-600 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>

      {/* Diagonal accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent" style={{clipPath: 'polygon(0 0, 50% 0, 30% 100%, 0 100%)'}}></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          
          {/* Left Side - Welcome Section */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-center px-8 py-16 animate-slide-in-right">
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-white">SecureBank</span>
              </div>

              {/* Main Message */}
              <div className="space-y-4">
                <h1 className="text-6xl font-bold text-white leading-tight">
                  WELCOME<br />
                  <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    BACK!
                  </span>
                </h1>
                <p className="text-purple-200 text-lg leading-relaxed max-w-lg">
                  Secure, Fast, and Intelligent Banking at your fingertips. Experience the future of financial management.
                </p>
              </div>

              {/* Feature Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 max-w-xl">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                  <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-purple-300 text-sm">Uptime</div>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-violet-500/30 hover:border-violet-500/50 transition-all">
                  <div className="text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-violet-300 text-sm">Support</div>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-indigo-500/30 hover:border-indigo-500/50 transition-all">
                  <div className="text-3xl font-bold text-white mb-1">256</div>
                  <div className="text-indigo-300 text-sm">Bit SSL</div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">AI Fraud Protection</div>
                    <div className="text-slate-400 text-xs">Real-time monitoring</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Bank-Grade Security</div>
                    <div className="text-slate-400 text-xs">Encrypted transactions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="lg:col-span-2 flex items-center justify-center px-4 py-8 animate-fade-in-up">
            <div className="w-full max-w-md">
              {/* Glass Card */}
              <div className="relative">
                <div className="relative bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-500/20 p-8 overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-tr-full"></div>
                  
                  {/* Mobile Logo */}
                  <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold text-white">SecureBank</span>
                  </div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
                      <p className="text-purple-300 text-sm">Access your secure account</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red-300 text-sm font-medium">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Form */}
                    <div className="space-y-6">
                      {/* Email Input */}
                      <div>
                        <label className="block text-purple-200 text-sm font-semibold mb-3">
                          Email Address
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-purple-400 group-focus-within:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:bg-slate-800/80 transition-all duration-200 disabled:opacity-50"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-purple-200 text-sm font-semibold mb-3">
                          Password
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-purple-400 hover:text-purple-300 transition-colors focus:outline-none"
                            >
                              {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:bg-slate-800/80 transition-all duration-200 disabled:opacity-50"
                            required
                          />
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-purple-500 bg-slate-800 border-purple-500 rounded focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-slate-900" />
                          <span className="ml-2 text-sm text-purple-200 group-hover:text-white transition-colors">Remember me</span>
                        </label>
                        <button type="button" className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
                          Forgot password?
                        </button>
                      </div>

                      {/* Login Button */}
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-6"
                      >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Logging in...</span>
                            </>
                          ) : (
                            <>
                              <span>Login</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm px-5 py-3 rounded-full border border-purple-500/20">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-purple-200 text-xs font-medium">Protected by 256-bit SSL Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
