
import React, { useState } from 'react';
import { useAuth } from '../services/authContext.tsx';
import { CookieBanner } from '../components/CookieBanner.tsx';
import { PrivacyModal } from '../components/PrivacyModal.tsx';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Visual only for the demo
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const { login, isLoading } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simulating password validation logic visually
    if (password.length < 1) {
       // In a real app we would validate here, but for this demo we proceed
    }

    const success = await login(email);
    if (!success) {
      setError('Acesso negado. Verifique suas credenciais.');
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@acosvital.com', role: 'Gestão Total' },
    { label: 'Qualidade', email: 'joao@acosvital.com', role: 'Operacional' },
    { label: 'Cliente', email: 'compras@empresax.com', role: 'Visualização' },
  ];

  return (
    <div className="min-h-screen flex bg-white relative">
      
      {/* LANGUAGE SELECTOR - ENHANCED MOBILE/DESKTOP */}
      <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 p-1.5 rounded-full shadow-lg shadow-slate-200/50 flex items-center gap-1">
              <div className="pl-2 pr-1 text-slate-400">
                  <Globe size={16} />
              </div>
              {['pt', 'en', 'es'].map((lang) => (
                  <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`
                          px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-full transition-all duration-300 ease-out
                          ${i18n.language === lang 
                              ? 'bg-slate-900 text-white shadow-md transform scale-105 ring-2 ring-slate-100' 
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

      {/* Lado Esquerdo - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Imagem de Fundo (Indústria/Aço) */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535063404120-40ceb47fe8e9?auto=format&fit=crop&q=80&w=1920")' }} 
        />
        
        {/* Gradiente Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/40" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600/20 p-2 rounded-lg backdrop-blur-sm border border-blue-500/30">
                        <ShieldCheck size={32} className="text-blue-400" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Aços Vital</span>
                </div>
            </div>

            <div className="space-y-6 max-w-lg">
                <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                    {t('login.sloganTitle')}
                </h1>
                <p className="text-base xl:text-lg text-slate-300 font-light leading-relaxed">
                    {t('login.sloganText')}
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                     <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                        <CheckCircle2 size={16} className="text-green-500" /> ISO 9001
                     </div>
                     <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                        <CheckCircle2 size={16} className="text-green-500" /> Data Security
                     </div>
                </div>
            </div>

            <div className="text-sm text-slate-500 flex items-center gap-6">
                <span>&copy; {new Date().getFullYear()} Aços Vital S.A.</span>
                <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-blue-400 transition-colors">{t('common.privacy')}</button>
            </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
            
            {/* Cabeçalho Mobile */}
            <div className="lg:hidden flex flex-col items-center mb-8 mt-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <ShieldCheck size={32} />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">Aços Vital</span>
                </div>
                <p className="text-slate-500 text-sm text-center px-4">{t('login.sloganTitle')}</p>
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t('login.welcomeBack')}</h2>
                <p className="mt-2 text-slate-500">{t('login.enterCredentials')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                
                {/* Input Email */}
                <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 ml-1">{t('login.emailLabel')}</label>
                    <div 
                        className={`relative flex items-center border rounded-xl transition-all duration-200 bg-white
                        ${focusedInput === 'email' ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className="pl-4 text-slate-400">
                            <Mail size={20} />
                        </div>
                        <input 
                            id="email"
                            type="email" 
                            required
                            className="w-full px-4 py-3.5 bg-transparent outline-none text-slate-900 placeholder-slate-400"
                            placeholder="seu.nome@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </div>
                </div>

                {/* Input Password (Visual) */}
                <div className="space-y-1">
                    <div className="flex justify-between ml-1">
                         <label htmlFor="password" className="block text-sm font-medium text-slate-700">{t('login.passwordLabel')}</label>
                         <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">{t('login.forgotPassword')}</a>
                    </div>
                    <div 
                        className={`relative flex items-center border rounded-xl transition-all duration-200 bg-white
                        ${focusedInput === 'password' ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className="pl-4 text-slate-400">
                            <Lock size={20} />
                        </div>
                        <input 
                            id="password"
                            type="password" 
                            className="w-full px-4 py-3.5 bg-transparent outline-none text-slate-900 placeholder-slate-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin text-slate-400" />
                    ) : (
                        <>
                            <span>{t('login.accessPortal')}</span>
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            {/* Demo Credentials Footer */}
            <div className="pt-8 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">{t('login.demoEnv')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {demoAccounts.map((acc) => (
                        <button
                            key={acc.email}
                            onClick={() => { setEmail(acc.email); setPassword('123456'); }}
                            className="flex flex-col items-center p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
                        >
                            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">{acc.label}</span>
                            <span className="text-[10px] text-slate-500 mt-1">{acc.role}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Footer Links */}
            <div className="lg:hidden mt-6 text-center text-xs text-slate-400 flex flex-col gap-2 pb-6">
                <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-blue-600">{t('common.privacy')}</button>
                <span>&copy; {new Date().getFullYear()} Aços Vital S.A.</span>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
