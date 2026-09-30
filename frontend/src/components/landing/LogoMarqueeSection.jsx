import { Calendar, CheckSquare, Music, Activity, MessageSquare, Database, HeartPulse, Clock, Sparkles, Shield, Compass, Brain } from 'lucide-react';

export default function LogoMarqueeSection() {
  const rowOneIntegrations = [
    { name: 'Google Calendar', icon: Calendar, label: 'Routine Sync' },
    { name: 'Notion Workspace', icon: Database, label: 'Memory Vault' },
    { name: 'Apple Health', icon: HeartPulse, label: 'Wellness Metrics' },
    { name: 'Spotify Music', icon: Music, label: 'Lifestyle Vibes' },
    { name: 'Todoist', icon: CheckSquare, label: 'Task Execution' },
    { name: 'Slack Workspace', icon: MessageSquare, label: 'Work Context' },
    { name: 'Smart Reminders', icon: Clock, label: 'Adaptive Alerts' },
  ];

  const rowTwoIntegrations = [
    { name: 'Strava Fitness', icon: Activity, label: 'Habit Tracking' },
    { name: 'Athena Memory Core', icon: Brain, label: 'Adaptive Recall' },
    { name: 'Safety Guardrails', icon: Shield, label: 'Zero Harm Protocol' },
    { name: 'WHOOP Biometrics', icon: HeartPulse, label: 'Recovery & Sleep' },
    { name: 'Contextual Router', icon: Compass, label: 'Multi-Agent Routing' },
    { name: 'Productivity Matrix', icon: Sparkles, label: 'Deep Work Focus' },
    { name: 'Lifestyle Journal', icon: Database, label: 'Daily Reflection' },
  ];

  const renderCardList = (list, prefix) => (
    [...list, ...list].map((item, i) => {
      const Icon = item.icon;
      return (
        <div
          key={`${prefix}-${i}`}
          className="flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-[#0f0c18]/80 border border-white/8 hover:border-purple-500/40 backdrop-blur-md transition-all duration-300 group/card hover:bg-[#161224] shrink-0 cursor-default"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-300 group-hover/card:text-purple-200 group-hover/card:scale-105 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-medium text-neutral-200 group-hover/card:text-white transition-colors tracking-tight whitespace-nowrap">
              {item.name}
            </span>
            <span className="text-[10px] text-neutral-500 tracking-wider uppercase whitespace-nowrap">
              {item.label}
            </span>
          </div>
        </div>
      );
    })
  );

  return (
    <section className="relative w-full py-16 sm:py-20 bg-[#06040a] overflow-hidden border-t border-b border-purple-500/10">
      {/* Self-contained CSS keyframes for continuous infinite marquee with GPU acceleration */}
      <style>{`
        @keyframes marqueeScrollLeft {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        @keyframes marqueeScrollRight {
          0% {
            transform: translate3d(-100%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .athena-marquee-track-left {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          will-change: transform;
          animation: marqueeScrollLeft 35s linear infinite;
        }
        .athena-marquee-track-right {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          will-change: transform;
          animation: marqueeScrollRight 35s linear infinite;
        }
        .athena-marquee-row:hover .athena-marquee-track-left,
        .athena-marquee-row:hover .athena-marquee-track-right {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-purple-900/15 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-10 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-300 text-[11px] font-medium tracking-[0.2em] uppercase backdrop-blur-md mb-3">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Ecosystem & Integrations</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-light text-neutral-200">
          Seamlessly Connected to Your Life, Routines & Productivity Tools
        </h3>
      </div>

      {/* Marquee Wrapper with horizontal mask fade at edges */}
      <div
        className="relative w-full flex flex-col gap-6 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        {/* ROW 1: Moves right → left continuously */}
        <div className="athena-marquee-row group flex overflow-hidden select-none py-1 w-full">
          <div className="athena-marquee-track-left gap-6 pr-6">
            {renderCardList(rowOneIntegrations, 'r1-a')}
          </div>
          <div className="athena-marquee-track-left gap-6 pr-6" aria-hidden="true">
            {renderCardList(rowOneIntegrations, 'r1-b')}
          </div>
        </div>

        {/* ROW 2: Moves left → right continuously */}
        <div className="athena-marquee-row group flex overflow-hidden select-none py-1 w-full">
          <div className="athena-marquee-track-right gap-6 pr-6">
            {renderCardList(rowTwoIntegrations, 'r2-a')}
          </div>
          <div className="athena-marquee-track-right gap-6 pr-6" aria-hidden="true">
            {renderCardList(rowTwoIntegrations, 'r2-b')}
          </div>
        </div>
      </div>
    </section>
  );
}
