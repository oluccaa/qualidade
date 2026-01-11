import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext.tsx';
import { CookieBanner } from '../components/CookieBanner.tsx';
import { PrivacyModal } from '../components/PrivacyModal.tsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Globe,
  Eye,
  EyeOff,
  AlertOctagon
} from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Security State (Rate Limiting)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const { login, isLoading } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
  };

  // Timer Effect for Lockout
  useEffect(() => {
      let interval: any;
      if (isLocked && lockTimer > 0) {
          interval = setInterval(() => {
              setLockTimer((prev) => prev - 1);
          }, 1000);
      } else if (lockTimer === 0 && isLocked) {
          setIsLocked(false);
          setFailedAttempts(0);
      }
      return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    
    // Basic validation
    if (!email || !password) {
        setError('Preencha todos os campos.');
        return;
    }

    try {
        const result = await login(email, password);
        
        if (!result.success) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          setError(result.error || 'Acesso negado.');

          // Security Lockout Policy: 3 Failed Attempts = 30s Lock
          if (newAttempts >= 5) {
              setIsLocked(true);
              setLockTimer(60); // 60 seconds lockout on 5th attempt
              setError('Muitas tentativas falhas. Por segurança, aguarde para tentar novamente.');
          }
        }
    } catch (e: any) {
        setError('Erro de conexão com o servidor de autenticação.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      
      {/* LANGUAGE SELECTOR */}
      <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 p-1 rounded-full shadow-lg shadow-slate-200/50 flex items-center gap-1">
              <div className="pl-2 pr-1 text-slate-400">
                  <Globe size={14} />
              </div>
              {['pt', 'en', 'es'].map((lang) => (
                  <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`
                          px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all duration-300 ease-out
                          ${i18n.language === lang 
                              ? 'bg-slate-900 text-white shadow-md transform scale-105 ring-1 ring-slate-100' 
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                      `}
                  >
                      {lang}
                  </button>
              ))}
          </div>
      </div>

      {/* Components */}
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535063404120-40ceb47fe8e9?auto=format&fit=crop&q=80&w=1920")' }} 
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/40" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white h-full">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600/20 p-1.5 rounded-lg backdrop-blur-sm border border-blue-500/30">
                        <ShieldCheck size={28} className="text-blue-400" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Aços Vital</span>
                </div>
            </div>

            <div className="space-y-4 max-w-lg mb-10">
                <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                    {t('login.sloganTitle')}
                </h1>
                <p className="text-sm xl:text-base text-slate-300 font-light leading-relaxed">
                    {t('login.sloganText')}
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                     <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                        <CheckCircle2 size={14} className="text-green-500" /> ISO 9001
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                        <CheckCircle2 size={14} className="text-green-500" /> Data Security
                     </div>
                </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-6">
                <span>&copy; {new Date().getFullYear()} Aços Vital S.A.</span>
                <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-blue-400 transition-colors">{t('common.privacy')}</button>
            </div>
        </div>
      </div>

      {/* Lado Direito - Formulário Real */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-8 my-auto p-8 bg-white md:bg-transparent rounded-3xl md:rounded-none shadow-xl md:shadow-none">
            
            <div className="lg:hidden flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <ShieldCheck size={28} />
                    </div>
                    <span className="text-xl font-bold text-slate-900">Aços Vital</span>
                </div>
                <p className="text-slate-500 text-xs text-center px-4 max-w-xs">{t('login.sloganTitle')}</p>
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('login.welcomeBack')}</h2>
                <p className="mt-2 text-sm text-slate-500">{t('login.enterCredentials')}</p>
            </div>

            {isLocked ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                        <AlertOctagon className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-base font-bold text-red-700 mb-1">Acesso Temporariamente Bloqueado</h3>
                    <p className="text-xs text-red-600 mb-4">Muitas tentativas incorretas. Aguarde para tentar novamente.</p>
                    <div className="text-3xl font-mono font-bold text-red-800 bg-white px-4 py-2 rounded-xl shadow-inner border border-red-100">{lockTimer}s</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">{t('login.emailLabel')}</label>
                        <div 
                            className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50
                            ${focusedInput === 'email' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="pl-4 text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input 
                                id="email"
                                type="email" 
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3.5 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400 disabled:opacity-50 font-medium"
                                placeholder="ex: joao@acosvital.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between ml-1">
                            <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('login.passwordLabel')}</label>
                            <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">{t('login.forgotPassword')}</a>
                        </div>
                        <div 
                            className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50
                            ${focusedInput === 'password' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="pl-4 text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                disabled={isLoading}
                                className="w-full pl-4 pr-12 py-3.5 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400 disabled:opacity-50 font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 font-semibold">
                            <AlertOctagon size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin text-slate-400" />
                        ) : (
                            <>
                                <span>{t('login.accessPortal')}</span>
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            )}

            <div className="text-center pt-4 space-y-4">
                <p className="text-sm text-slate-600 font-medium">
                  Não possui conta? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Solicite seu acesso</Link>
                </p>
                <p className="text-xs text-slate-400">
                    Acesso restrito a colaboradores e clientes autorizados.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;