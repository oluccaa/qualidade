
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
  AlertOctagon
} from 'lucide-react';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

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
    <div className="min-h-screen flex bg-slate-50 relative selection:bg-blue-100">
      
      {/* TEXTURA DE RUÍDO GLOBAL (Overlay sutil para aspecto premium) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="absolute top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-1 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center gap-1">
              <div className="pl-3 pr-1 text-slate-400">
                  <Globe size={14} />
              </div>
              {['pt', 'en', 'es'].map((lang) => (
                  <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`
                          px-3 py-1.5 text-[10px] font-bold uppercase rounded-full transition-all duration-500
                          ${i18n.language === lang 
                              ? 'bg-slate-900 text-white shadow-lg scale-105' 
                              : 'text-slate-500 hover:bg-slate-100'}
                      `}
                  >
                      {lang}
                  </button>
              ))}
          </div>
      </div>

      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Lado Esquerdo - Branding Industrial Premium */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center scale-105 animate-slow-zoom"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1920")' }} 
        />
        
        {/* Gradiente Dinâmico */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-blue-900/30" />
        
        {/* Textura de Malha Metálica Sutil */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white h-full">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                <img src={LOGO_URL} alt="Logo" className="h-24 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
            </div>

            <div className="space-y-6 max-w-xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <h1 className="text-5xl font-black leading-tight tracking-tight">
                   Aço de confiança,<br/><span className="text-blue-400">Qualidade certificada.</span>
                </h1>
                <p className="text-lg text-slate-300 font-light leading-relaxed">
                    Acesse o repositório central de documentos técnicos e certificados de qualidade da Aços Vital. Precisão industrial em cada dado.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                     <div className="flex items-center gap-3 text-xs font-bold text-white bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-xl">
                        <CheckCircle2 size={18} className="text-blue-400" /> ISO 9001:2015
                     </div>
                     <div className="flex items-center gap-3 text-xs font-bold text-white bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-xl">
                        <Lock size={18} className="text-blue-400" /> AES-256 Encrypted
                     </div>
                </div>
            </div>

            <div className="text-xs text-slate-400 font-medium flex items-center gap-8">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sistemas Operacionais
                </span>
                <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors underline underline-offset-4 decoration-slate-700">Políticas de Segurança</button>
                <span>&copy; {new Date().getFullYear()} Aços Vital S.A.</span>
            </div>
        </div>
      </div>

      {/* Lado Direito - Formulário Minimalista & Premium */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
            
            <div className="lg:hidden flex flex-col items-center mb-4">
                <img src={LOGO_URL} alt="Logo" className="h-20 object-contain mb-4" />
                <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
            </div>

            <div className="text-center lg:text-left space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Portal Vital</h2>
                <p className="text-slate-500 font-medium">Insira suas credenciais corporativas.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">E-mail Corporativo</label>
                    <div 
                        className={`group relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50
                        ${focusedInput === 'email' ? 'border-slate-900 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)]' : 'border-transparent hover:border-slate-200'}`}
                    >
                        <div className={`pl-4 transition-colors ${focusedInput === 'email' ? 'text-slate-900' : 'text-slate-400'}`}>
                            <Mail size={20} />
                        </div>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-4 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-300 font-bold"
                            placeholder="exemplo@acosvital.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end ml-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Senha de Acesso</label>
                        <a href="#" className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">Esqueceu a senha?</a>
                    </div>
                    <div 
                        className={`group relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50
                        ${focusedInput === 'password' ? 'border-slate-900 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)]' : 'border-transparent hover:border-slate-200'}`}
                    >
                        <div className={`pl-4 transition-colors ${focusedInput === 'password' ? 'text-slate-900' : 'text-slate-400'}`}>
                            <Lock size={20} />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full pl-4 pr-12 py-4 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-300 font-bold"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
                        <AlertOctagon size={18} className="shrink-0" />
                        {error}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="group relative w-full bg-slate-950 hover:bg-slate-800 text-white font-black text-sm py-5 rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-[0.97] disabled:opacity-70"
                >
                    {isLoading ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <>
                            <span className="tracking-widest uppercase">Autenticar Acesso</span>
                            <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                        </>
                    )}
                    {/* Brilho interno do botão */}
                    <div className="absolute inset-x-0 top-0 h-px bg-white/20 rounded-t-2xl"></div>
                </button>
            </form>

            <div className="text-center space-y-6">
                <div className="flex items-center gap-4 text-slate-200">
                    <div className="h-px flex-1 bg-slate-100"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ou</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  Novo por aqui? <Link to="/signup" className="text-blue-600 font-black hover:underline underline-offset-4">Solicite uma Conta</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
