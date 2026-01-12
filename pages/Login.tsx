
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext.tsx';
import { CookieBanner } from '../components/CookieBanner.tsx';
import { PrivacyModal } from '../components/PrivacyModal.tsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Globe,
  Eye,
  EyeOff,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const { login, isLoading } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
  };

  useEffect(() => {
      let interval: any;
      if (isLocked && lockTimer > 0) {
          interval = setInterval(() => {
              setLockTimer((prev) => prev - 1);
          }, 1000);
      } else if (lockTimer === 0 && isLocked) {
          setIsLocked(false);
      }
      return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');
    
    try {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Acesso negado.');
        }
    } catch (e: any) {
        setError('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative selection:bg-orange-100 overflow-hidden font-['Inter',_sans-serif]">
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.012] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="absolute top-6 right-6 z-[110] animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="bg-white/60 backdrop-blur-xl border border-slate-200/50 p-1 rounded-xl shadow-sm flex items-center gap-1">
              <div className="pl-2.5 pr-1.5 text-slate-400">
                  <Globe size={14} />
              </div>
              {['pt', 'en', 'es'].map((lang) => (
                  <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`
                          px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all duration-300
                          ${i18n.language === lang 
                              ? 'bg-[#081437] text-white shadow-sm' 
                              : 'text-slate-500 hover:bg-slate-100 hover:text-[#081437]'}
                      `}
                  >
                      {lang}
                  </button>
              ))}
          </div>
      </div>

      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* LADO ESQUERDO: BRANDING INDUSTRIAL MAGNIFICADO */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden shrink-0 border-r border-slate-100">
        <div 
            className="absolute inset-0 bg-cover bg-center scale-105 animate-slow-zoom"
            style={{ backgroundImage: `url("${BACKGROUND_URL}")` }} 
        />
        <div className="absolute inset-0 bg-[#081437]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#081437] via-[#081437]/80 to-transparent" />
        
        <div className="relative z-30 flex flex-col justify-between p-20 w-full h-full text-white">
            <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
                {/* Logo aumentada para impacto premium */}
                <img src={LOGO_URL} alt="Aços Vital" className="h-20 object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]" />
            </div>

            <div className="space-y-10 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-[#B23C0E]"></div>
                        <span className="text-[#B23C0E] text-xs font-black uppercase tracking-[6px]">Liderança Técnica</span>
                    </div>
                    {/* Título aumentado de text-5xl para text-6xl */}
                    <h1 className="text-6xl font-black leading-tight tracking-tighter text-white">
                       Aço de confiança,<br/>
                       <span className="text-[#62A5FA] block mt-2">Qualidade certificada.</span>
                    </h1>
                </div>
                
                <p className="text-lg text-slate-300/90 font-medium leading-relaxed max-w-md">
                    Repositório central de documentos técnicos e certificados. Precisão industrial em cada dado.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
                        <CheckCircle2 size={16} className="text-[#B23C0E]" /> Certificação ISO 9001
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
                        <ShieldCheck size={16} className="text-[#B23C0E]" /> Dados Seguros
                     </div>
                </div>
            </div>

            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-10 uppercase tracking-[4px]">
                <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]"></span>
                    Sistemas Monitorados
                </div>
                <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors">Privacidade</button>
                <span className="opacity-40">&copy; {new Date().getFullYear()} Aços Vital S.A.</span>
            </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO REMASTERIZADO */}
      <div className="w-full lg:flex-1 flex items-center justify-center p-8 md:p-16 bg-white relative z-30">
        <div className="w-full max-w-[400px] space-y-12 animate-in fade-in slide-in-from-right-6 duration-1000">
            
            <div className="lg:hidden flex flex-col items-center mb-10">
                <img src={LOGO_URL} alt="Logo" className="h-14 object-contain mb-6" />
                <div className="h-[2px] w-12 bg-[#B23C0E]"></div>
            </div>

            <div className="space-y-3 text-center lg:text-left">
                {/* Título do formulário aumentado de text-3xl para text-4xl */}
                <h2 className="text-4xl font-black text-[#081437] tracking-tighter">Portal da Qualidade</h2>
                <p className="text-slate-500 text-base font-medium">Acesse com suas credenciais corporativas.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Campo E-mail */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <div 
                        className={`group relative flex items-center border-[1.5px] rounded-2xl overflow-hidden transition-all duration-300
                        ${focusedInput === 'email' ? 'border-[#081437] bg-white ring-[6px] ring-[#081437]/5 shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'}`}
                    >
                        <div className={`w-14 h-14 shrink-0 flex items-center justify-center border-r transition-colors duration-300 ${focusedInput === 'email' ? 'text-[#081437] border-[#081437]/10' : 'text-slate-400 border-slate-200/50'}`}>
                            <Mail size={20} strokeWidth={2.5} />
                        </div>
                        <input 
                            type="email" 
                            required
                            className="flex-1 px-5 py-4 bg-transparent outline-none text-base text-[#081437] placeholder-slate-300 font-bold"
                            placeholder="exemplo@acosvital.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                        <a href="#" className="text-[11px] font-bold text-[#B23C0E] hover:text-[#081437] transition-colors uppercase tracking-wider">Esqueceu?</a>
                    </div>
                    <div 
                        className={`group relative flex items-center border-[1.5px] rounded-2xl overflow-hidden transition-all duration-300
                        ${focusedInput === 'password' ? 'border-[#081437] bg-white ring-[6px] ring-[#081437]/5 shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'}`}
                    >
                        <div className={`w-14 h-14 shrink-0 flex items-center justify-center border-r transition-colors duration-300 ${focusedInput === 'password' ? 'text-[#081437] border-[#081437]/10' : 'text-slate-400 border-slate-200/50'}`}>
                            <Lock size={20} strokeWidth={2.5} />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            className="flex-1 px-5 py-4 bg-transparent outline-none text-base text-[#081437] placeholder-slate-300 font-bold"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-[#081437] transition-colors"
                        >
                            {/* Lógica corrigida: EyeOff para estado oculto, Eye para estado visível */}
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-5 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-4 animate-in fade-in zoom-in-95">
                        <AlertOctagon size={20} className="shrink-0 text-[#B23C0E]" />
                        {error}
                    </div>
                )}
                
                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="group relative w-full bg-[#081437] hover:bg-[#0c1d4d] text-white font-black py-5 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-2xl active:scale-[0.98] disabled:opacity-70 h-14"
                    >
                        {isLoading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <>
                                <span className="tracking-[4px] uppercase text-xs">Autenticar Acesso</span>
                                <ArrowRight size={20} className="ml-4 group-hover:translate-x-2 transition-transform duration-300 text-[#B23C0E]" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center space-y-10 pt-6">
                <div className="flex items-center gap-5">
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                    <span className="text-[10px] font-black uppercase tracking-[5px] text-slate-300 whitespace-nowrap">Novo Usuário</span>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Não possui conta? <Link to="/signup" className="text-[#B23C0E] font-black hover:underline underline-offset-8 decoration-2 transition-all ml-1">Solicitar Registro</Link>
                </p>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes slow-zoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
            animation: slow-zoom 45s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
