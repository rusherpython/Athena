import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Eye, EyeOff, Brain, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, Server, Settings2, X, Check } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DemoBanner from '../components/ui/DemoBanner';
import ToastContainer from '../components/notifications/ToastContainer';
import { getBaseUrl } from '../api/apiClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(() => localStorage.getItem('athena_api_url') || '');

  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ title: 'Missing fields', message: 'Please enter your email and password.', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      addToast({ title: 'Welcome back!', message: `Good to see you, ${user?.name?.split(' ')[0] || 'there'}.`, type: 'success' });
      if (user?.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/personal');
      }
    } catch (err) {
      addToast({
        title: 'Authentication notice',
        message: err.message || err?.response?.data?.detail || 'Invalid email or password.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      localStorage.setItem('athena_demo_mode', 'true');
      const user = await login('demo@athena.ai', 'demo123');
      addToast({ title: 'Welcome to ATHENA!', message: 'Signed in via Demo Digital Twin.', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      addToast({ title: 'Demo error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServerUrl = () => {
    if (customServerUrl.trim()) {
      localStorage.setItem('athena_api_url', customServerUrl.trim());
      localStorage.removeItem('athena_demo_mode');
      addToast({ title: 'Backend Connected', message: `Server URL set to ${customServerUrl.trim()}`, type: 'success' });
    } else {
      localStorage.removeItem('athena_api_url');
      addToast({ title: 'Default Server', message: 'Reset to default backend configuration.', type: 'info' });
    }
    setShowServerConfig(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#06040a] text-neutral-100 font-sans selection:bg-purple-600/30 selection:text-purple-200">
      <DemoBanner />
      <ToastContainer />

      {/* Cosmic background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 h-[550px] w-[550px] rounded-full bg-purple-900/18 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-950/20 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 80px 100px, rgba(216,180,254,0.7), rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 150px 70px, #ffffff, rgba(0,0,0,0))`,
            backgroundSize: '240px 240px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-8 lg:grid-cols-12 lg:px-8">
        {/* Left Column: Visual Artwork & Editorial Copy */}
        <div className="hidden lg:col-span-6 lg:flex flex-col justify-center">
          <Link
            to="/"
            className="mb-8 inline-block text-base font-medium tracking-[0.28em] text-white uppercase hover:text-purple-200 transition-colors"
          >
            ATHENA
          </Link>

          {/* Reference Image Artwork Card with Soft Vignette */}
          <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] group mb-8">
            <div className="absolute inset-0 bg-gradient-to-t from-[#06040a] via-transparent to-transparent opacity-75 z-10" />
            <img
              src="/hero-art.jpg"
              alt="Athena Cosmic Twin"
              className="w-full h-72 object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-5 left-5 right-5 z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-[11px] font-medium text-purple-300 uppercase tracking-widest mb-2 font-mono">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>HumanTwin AI Protocol</span>
              </div>
              <p className="text-sm text-neutral-200 font-light leading-snug">
                “A New Kind of Intelligence – Human at Heart.”
              </p>
            </div>
          </div>

          <h1 className="font-serif text-3xl font-normal text-white leading-tight">
            Step Into Your Personal Twin
          </h1>
          <p className="mt-2 text-sm text-neutral-400 font-light leading-relaxed max-w-md">
            Seven autonomous agents collaborate continuously to preserve your habits, optimize productivity, and evolve with your everyday life.
          </p>

          <div className="mt-6 flex items-center gap-4 text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Encrypted Memory</span>
            </div>
            <span className="text-neutral-600">•</span>
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>7 Co-Pilots Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Glass Card */}
        <div className="mx-auto w-full max-w-[440px] lg:col-span-6">
          <div className="mb-6 text-center lg:hidden">
            <Link to="/" className="text-xl font-medium tracking-[0.25em] text-white uppercase inline-block mb-2">
              ATHENA
            </Link>
            <p className="text-xs text-purple-300">Your evolving digital twin</p>
          </div>

          <div className="rounded-3xl bg-[#0e0a18]/85 border border-purple-500/25 p-7 sm:p-9 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
            {/* Top violet bloom */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[70px] pointer-events-none" />

            <div className="mb-6 text-center">
              <h2 className="font-serif text-2xl font-normal text-white tracking-tight">Sign In to Athena</h2>
              <p className="mt-1 text-xs text-neutral-400 font-light">Access your twin memory, habits, and dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-purple-200 uppercase mb-2" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-purple-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#151024]/80 border border-purple-500/25 focus:border-purple-400 rounded-xl px-4 py-3 pl-10 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-purple-200 uppercase mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-purple-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full bg-[#151024]/80 border border-purple-500/25 focus:border-purple-400 rounded-xl px-4 py-3 pl-10 pr-11 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 border-0 bg-transparent text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium text-sm transition-all duration-200 shadow-[0_0_25px_rgba(168,85,247,0.35)] cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? <LoadingSpinner size={18} /> : <><span>Launch Twin</span><ArrowRight size={16} /></>}
              </button>
            </form>

            {/* 1-Click Instant Demo Access */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-xs font-medium text-purple-200 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Instant Demo Twin Access (No Wait)</span>
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-neutral-500">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Link
              to="/signup"
              className="w-full inline-flex items-center justify-center py-2.5 px-6 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-neutral-200 transition-all mb-4"
            >
              Create New Twin Account
            </Link>

            {/* Backend Server Configuration Toggle */}
            <div className="pt-2 border-t border-white/8 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span className="truncate max-w-[200px]">Server: {getBaseUrl()}</span>
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 underline underline-offset-2 transition-colors cursor-pointer"
              >
                <Server className="w-3 h-3" />
                <span>Change URL</span>
              </button>
            </div>

            {/* In-line Server Config Drawer */}
            {showServerConfig && (
              <div className="mt-3 p-3.5 rounded-2xl bg-black/70 border border-purple-500/30 animate-fade-in text-left">
                <span className="block text-[11px] font-semibold text-purple-200 mb-1">
                  Render / Backend API Base URL
                </span>
                <p className="text-[10px] text-neutral-400 mb-2 leading-tight">
                  Enter your live Render backend URL (e.g. https://athena-backend.onrender.com).
                </p>
                <input
                  type="text"
                  value={customServerUrl}
                  onChange={(e) => setCustomServerUrl(e.target.value)}
                  placeholder="https://your-backend.onrender.com"
                  className="w-full bg-[#151024] border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none mb-2 font-mono"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowServerConfig(false)}
                    className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveServerUrl}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save Server URL</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-center text-xs text-neutral-500">ATHENA — HumanTwin AI · GATEWAYS 2026</p>
        </div>
      </div>
    </div>
  );
}
