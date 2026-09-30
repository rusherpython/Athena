import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Eye, EyeOff, Brain, Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DemoBanner from '../components/ui/DemoBanner';
import ToastContainer from '../components/notifications/ToastContainer';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      addToast({ title: 'Missing fields', message: 'Please fill in all fields.', type: 'warning' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      addToast({ title: 'Password mismatch', message: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (form.password.length < 6) {
      addToast({ title: 'Weak password', message: 'Password must be at least 6 characters.', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      addToast({ title: 'Welcome to ATHENA!', message: "Let's calibrate your digital twin.", type: 'success' });
      navigate('/onboarding/personal');
    } catch (err) {
      addToast({
        title: 'Registration notice',
        message: err.message || err?.response?.data?.detail || 'Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignup = async () => {
    setLoading(true);
    try {
      localStorage.setItem('athena_demo_mode', 'true');
      await login('demo@athena.ai', 'demo123');
      addToast({ title: 'Welcome to ATHENA!', message: 'Entering calibration in Demo Mode.', type: 'success' });
      navigate('/onboarding/personal');
    } catch (err) {
      addToast({ title: 'Demo error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
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

          {/* Reference Image Artwork Card */}
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
                <span>Evolving Digital Twin</span>
              </div>
              <p className="text-sm text-neutral-200 font-light leading-snug">
                “A companion that learns your mind, routines, and lifestyle.”
              </p>
            </div>
          </div>

          <h1 className="font-serif text-3xl font-normal text-white leading-tight">
            Create Your Digital Twin
          </h1>
          <p className="mt-2 text-sm text-neutral-400 font-light leading-relaxed max-w-md">
            Begin the 8-step calibration wizard. Configure personal routines, wellness rhythms, pet reminders, and privacy safeguards.
          </p>
        </div>

        {/* Right Column: Sign Up Glass Card */}
        <div className="mx-auto w-full max-w-[440px] lg:col-span-6">
          <div className="mb-6 text-center lg:hidden">
            <Link to="/" className="text-xl font-medium tracking-[0.25em] text-white uppercase inline-block mb-2">
              ATHENA
            </Link>
            <p className="text-xs text-purple-300">Create your digital twin account</p>
          </div>

          <div className="rounded-3xl bg-[#0e0a18]/85 border border-purple-500/25 p-7 sm:p-9 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
            {/* Top violet bloom */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[70px] pointer-events-none" />

            <div className="mb-6 text-center">
              <h2 className="font-serif text-2xl font-normal text-white tracking-tight">Create Account</h2>
              <p className="mt-1 text-xs text-neutral-400 font-light">Set up your evolving AI life assistant</p>
            </div>

            <form onSubmit={handleSignup} className="flex flex-col gap-3">
              {[
                { id: 'name', label: 'Full name', type: 'text', field: 'name', icon: User, placeholder: 'Your name', auto: 'name' },
                { id: 'email', label: 'Email address', type: 'email', field: 'email', icon: Mail, placeholder: 'you@example.com', auto: 'email' },
                { id: 'password', label: 'Password', type: showPass ? 'text' : 'password', field: 'password', icon: Lock, placeholder: 'Min. 6 characters', auto: 'new-password' },
                { id: 'confirm', label: 'Confirm password', type: showPass ? 'text' : 'password', field: 'confirmPassword', icon: Lock, placeholder: 'Repeat password', auto: 'new-password' },
              ].map(({ id, label, type, field, icon: Icon, placeholder, auto }) => (
                <div key={id}>
                  <label className="block text-[11px] font-semibold tracking-wider text-purple-200 uppercase mb-1" htmlFor={id}>
                    {label}
                  </label>
                  <div className="relative">
                    <Icon size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-purple-400" />
                    <input
                      id={id}
                      type={type}
                      value={form[field]}
                      onChange={set(field)}
                      placeholder={placeholder}
                      className="w-full bg-[#151024]/80 border border-purple-500/25 focus:border-purple-400 rounded-xl px-4 py-2 pl-10 pr-10 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      autoComplete={auto}
                    />
                    {field === 'confirmPassword' && (
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 border-0 bg-transparent text-neutral-400 hover:text-white transition-colors"
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium text-sm transition-all duration-200 shadow-[0_0_25px_rgba(168,85,247,0.35)] cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size={18} /> : <><span>Start Onboarding</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleDemoSignup}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-xs font-medium text-purple-200 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Instant Demo Onboarding (No Setup)</span>
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-neutral-400">
              Already have a twin?{' '}
              <Link to="/login" className="font-semibold text-purple-300 hover:text-purple-200 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
