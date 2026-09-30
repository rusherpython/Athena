import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Brain, Sparkles } from 'lucide-react';
import CanvasScrollSequence from '../components/landing/CanvasScrollSequence';
import LogoMarqueeSection from '../components/landing/LogoMarqueeSection';
import BentoGridSection from '../components/landing/BentoGridSection';

export default function LandingPage() {
  const navigate = useNavigate();
  const heroScrollContainerRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#06040a] text-neutral-100 font-sans relative selection:bg-purple-600/30 selection:text-purple-200">
      {/* ============================================================ */}
      {/* TALL SCROLL-LINKED HERO CONTAINER (h-[400vh])                */}
      {/* ============================================================ */}
      <div ref={heroScrollContainerRef} className="relative w-full h-[400vh]">
        {/* Sticky full-screen viewport pinned during scroll */}
        <div className="sticky top-0 min-h-screen h-screen w-full flex flex-col justify-between">
          {/* ============================================================ */}
          {/* 1. CINEMATIC FULL-SCREEN STICKY CANVAS SEQUENCE             */}
          {/* ============================================================ */}
          <CanvasScrollSequence
            containerRef={heroScrollContainerRef}
            totalFrames={50}
            framePrefix="/frames/ezgif-frame-"
            frameSuffix=".png"
          />

          {/* ============================================================ */}
          {/* 2. ATMOSPHERIC CINEMATIC DARK SHADOW BEHIND LEFT/CENTER TEXT */}
          {/* Strongest at 10-25% left, fading out toward 45-50%           */}
          {/* ============================================================ */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: `
                radial-gradient(ellipse 70% 80% at 20% 45%, rgba(6, 4, 10, 0.90) 0%, rgba(6, 4, 10, 0.75) 25%, rgba(6, 4, 10, 0.35) 45%, transparent 60%),
                radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.12) 0%, transparent 60%),
                linear-gradient(to bottom, rgba(6, 4, 10, 0.55) 0%, transparent 22%, transparent 70%, rgba(6, 4, 10, 0.92) 100%)
              `
            }}
          />

          {/* Subtle celestial dust overlay */}
          <div
            className="absolute inset-0 opacity-[0.14] pointer-events-none z-[2]"
            style={{
              backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                                radial-gradient(1px 1px at 70px 90px, rgba(216,180,254,0.7), rgba(0,0,0,0)),
                                radial-gradient(1.5px 1.5px at 140px 60px, #ffffff, rgba(0,0,0,0)),
                                radial-gradient(1px 1px at 190px 140px, rgba(192,132,252,0.6), rgba(0,0,0,0))`,
              backgroundSize: '240px 240px'
            }}
          />

          {/* ============================================================ */}
          {/* 3. HERO UI CONTENT OVERLAY                                   */}
          {/* ============================================================ */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-4 sm:pb-6 flex-1 flex flex-col justify-between">
            {/* TOP NAVIGATION BAR */}
            <header className="w-full flex items-center justify-between py-2">
              {/* Brand Name: ATHENA */}
              <Link
                to="/"
                className="shrink-0 inline-flex items-center pl-1 sm:pl-2 pr-2 py-1 text-white text-base sm:text-lg font-medium tracking-[0.24em] sm:tracking-[0.28em] hover:text-purple-200 transition-colors uppercase select-none"
                style={{ textRendering: 'optimizeLegibility' }}
              >
                ATHENA
              </Link>

              {/* Centered Floating Pill Navigation */}
              <nav className="hidden md:flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#13101c]/80 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] text-[13px] text-neutral-300">
                {['Home', 'How It Works', 'Philosophy', 'Use Cases'].map((tab, idx, arr) => (
                  <div key={tab} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="px-3 py-1 rounded-full transition-all duration-200 text-neutral-400 hover:text-white"
                    >
                      {tab}
                    </button>
                    {idx < arr.length - 1 && (
                      <span className="mx-1.5 text-neutral-600 text-[10px] select-none">•</span>
                    )}
                  </div>
                ))}
              </nav>

              {/* Right Navigation Actions */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Language Selector */}
                <div className="flex items-center gap-1 text-xs text-neutral-300 cursor-pointer hover:text-white transition-colors">
                  <span className="font-medium tracking-wider">EN</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </div>

                {/* Direct App Launch Button */}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-neutral-200 bg-white/[0.08] hover:bg-white/[0.15] border border-white/12 transition-all cursor-pointer shadow-sm"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                </button>
              </div>
            </header>

            {/* HERO CENTER HEADLINE, ACTIONS & ATHENA TITLE */}
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4 py-2 sm:py-4 my-auto">
              {/* Availability-Style Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#181228]/90 border border-purple-500/35 text-purple-200 text-[11px] font-medium tracking-[0.2em] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)] mb-3 sm:mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400 shadow-[0_0_8px_#a855f7]" />
                </span>
                <span>AI DIGITAL TWIN</span>
              </div>

              {/* Bolder Headline with White -> Lavender Gradient & Soft Glow */}
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal tracking-[-0.015em] leading-[1.12] max-w-4xl mx-auto bg-gradient-to-r from-white via-[#f3e8ff] to-[#e9d5ff] bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(216,180,254,0.32)]">
                A New Kind of Intelligence
                <br />
                <span className="italic font-light text-neutral-100">– Human at Heart</span>
              </h1>

              {/* Subtitle with High Readability */}
              <p className="mt-3 sm:mt-5 max-w-2xl mx-auto text-neutral-300 text-sm sm:text-base font-light leading-relaxed tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                ATHENA is your evolving personal digital twin and AI life assistant. Designed to learn your daily routines, enhance your productivity, understand your habits, and grow with you in empathetic synchrony.
              </p>

              {/* Call to Action Button */}
              <div className="mt-5 sm:mt-7 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-neutral-950 font-medium text-sm sm:text-[15px] tracking-tight transition-all duration-300 hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_35px_rgba(255,255,255,0.22)] hover:shadow-[0_0_45px_rgba(255,255,255,0.38)] cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-purple-700" />
                  <span>Launch Your Twin</span>
                </button>
              </div>

              {/* Large Central ATHENA Title - Cleanly spaced below button */}
              <div className="mt-6 sm:mt-8 md:mt-10 w-full flex items-center justify-center pointer-events-none select-none">
                <span
                  className="text-center font-serif font-light uppercase tracking-[0.2em] sm:tracking-[0.24em] text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[96px] leading-none bg-gradient-to-b from-white via-[#f5d0fe] to-[#c084fc] bg-clip-text text-transparent inline-block"
                  style={{
                    filter: 'drop-shadow(0 0 35px rgba(244, 114, 182, 0.35)) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.95))',
                    paddingBottom: '0.08em',
                  }}
                >
                  ATHENA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: INFINITE LOGO CAROUSELS                           */}
      {/* ============================================================ */}
      <LogoMarqueeSection />

      {/* ============================================================ */}
      {/* SECTION 2: BENTO GRID (7 Specialized Agents & Memory Vault)   */}
      {/* ============================================================ */}
      <BentoGridSection />

      {/* ============================================================ */}
      {/* FOOTER SECTION                                               */}
      {/* ============================================================ */}
      <footer className="w-full py-12 bg-[#06040a] border-t border-white/10 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif tracking-widest text-neutral-300 uppercase font-medium">ATHENA</span>
            <span>•</span>
            <span>HumanTwin AI & Multi-Agent Architecture</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-neutral-300 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-neutral-300 transition-colors">Create Account</Link>
            <a href="#privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-neutral-300 transition-colors">Safety Guardrails</a>
          </div>
          <div>© {new Date().getFullYear()} Athena AI Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
