import { Link } from 'react-router-dom';
import { Sparkles, Users, ArrowRight, CheckCircle2, MessageSquare, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';

const WeaveLogo = ({ size = 32 }) => (
  <img 
    src="/logo.png" 
    alt="Weave Logo" 
    style={{ width: size, height: size }} 
    className="object-contain p-1 bg-white rounded-xl shadow-lg border border-white/10"
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'block';
    }}
  />
);

const FallbackLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="hidden" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-200 selection:bg-primary-500/30">
      {/* Nav */}
      <nav className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeaveLogo size={32} />
            <FallbackLogo size={32} />
            <span className="font-extrabold text-xl tracking-tight text-navy dark:text-white">Weave</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-primary-600/20 active:scale-95">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center py-20 lg:py-32">
        <AnimatedGradientBackground
          Breathing={true}
          animationSpeed={0.015}
          breathingRange={6}
          startingGap={100}
          gradientColors={["#0F172A", "#312e81", "#4F46E5", "#14B8A6", "#312e81", "#020617"]}
          gradientStops={[10, 30, 45, 60, 80, 100]}
          containerClassName="opacity-90 dark:opacity-100"
        />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold mb-8 border border-white/20 shadow-xl">
              <Sparkles className="w-4 h-4 text-teal-300" /> AI-Powered Matching Engine
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8 drop-shadow-lg">
              Weave your future with the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-primary-300">internship.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-200 mb-12 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow">
              Connecting ambitious students with top recruiters through intelligent algorithms. Stop searching, start matching.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-primary-700 hover:bg-slate-50 font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base">
                Find Internships <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register?role=RECRUITER" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-primary-800/40 backdrop-blur-md border border-white/20 hover:bg-primary-800/60 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 text-base">
                Hire Talent
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Soft bottom transition */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white dark:from-[#0B1120] to-transparent z-10" />
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-[#0B1120] py-24 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy dark:text-white mb-4 tracking-tight">Why Choose Weave?</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">A powerful end-to-end recruitment platform designed for speed and quality.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'Intelligent Matching', desc: 'Our AI engine compares deep skills, duration, and preferences giving you a 0-100% compatibility score immediately.' },
              { icon: Briefcase, title: 'Quality Opportunities', desc: 'Verified recruiters from top tier startups and enterprises posting high-value hybrid, remote, and onsite roles.' },
              { icon: MessageSquare, title: 'Direct Communication', desc: 'Cut through the noise. Recruiters can instantly open direct chats with shortlisted candidates right on the platform.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-slate-50 dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0B1120] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white mb-3">{title}</h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-[#F8FAFC] dark:bg-[#0F172A] py-24 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-navy dark:text-white mb-6 tracking-tight">How it works</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Complete your profile', desc: 'Add your skills, location, and preferred stipends in INR.' },
                  { step: '02', title: 'Review AI matches', desc: 'Browse highly curated internships sorted by match percentage.' },
                  { step: '03', title: 'Apply & Interview', desc: '1-click apply and chat directly with recruiters when shortlisted.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500 dark:border-primary-500 flex items-center justify-center font-bold text-primary-700 dark:text-primary-400">
                        {item.step}
                      </div>
                      {i !== 2 && <div className="w-0.5 h-full bg-primary-200 dark:bg-primary-800/50 mt-4" />}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-xl font-bold text-navy dark:text-white mb-2">{item.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              {/* Abstract decorative cards */}
              <div className="relative w-full max-w-md mx-auto aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-teal-400 rounded-[40px] rotate-6 opacity-20 dark:opacity-40 blur-lg animate-pulse" />
                <div className="absolute inset-4 bg-white dark:bg-[#111827] rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-2xl p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 rounded bg-slate-100 dark:bg-slate-800" />
                        <div className="w-20 h-3 rounded bg-slate-50 dark:bg-slate-900" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-full h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 flex items-center justify-between px-4">
                        <div className="w-24 h-4 rounded bg-primary-200 dark:bg-primary-800" />
                        <div className="w-12 h-6 rounded-full bg-green-100 dark:bg-green-900/30" />
                      </div>
                      <div className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between px-4">
                        <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-12 rounded-xl bg-primary-600 flex items-center justify-center">
                    <div className="w-24 h-4 rounded bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white dark:bg-[#0B1120]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-navy to-primary-900 rounded-[40px] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary-500/20 blur-3xl rounded-full" />
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to fast-track your career?</h2>
              <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">Join thousands of students and recruiters already using Weave to build the future of work.</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy hover:bg-slate-50 font-extrabold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-lg">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <WeaveLogo size={28} />
                <FallbackLogo size={28} />
                <span className="font-extrabold text-xl tracking-tight text-navy dark:text-white">Weave</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                The premier AI-powered internship matching ecosystem for India and beyond.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 dark:text-slate-500 text-sm">&copy; 2026 Weave Platform. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-navy dark:hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-navy dark:hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
