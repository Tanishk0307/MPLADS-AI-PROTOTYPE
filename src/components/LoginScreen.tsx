import { useState } from 'react';
import { Activity, Mail, ShieldCheck, ArrowRight, UserCog } from 'lucide-react';
import type { UserRole, User } from '@/types/database';
import { useLanguage, LanguageSwitcher } from '@/context/LanguageContext';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('DM');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const roles: { key: UserRole; label: string; desc: string; num: number }[] = [
    { key: 'MP', label: t.roleMp, desc: t.roleMpDesc, num: 1 },
    { key: 'SNA', label: t.roleSna, desc: t.roleSnaDesc, num: 2 },
    { key: 'DM', label: t.roleDm, desc: t.roleDmDesc, num: 3 },
    { key: 'Ministry', label: t.roleMinistry, desc: t.roleMinistryDesc, num: 4 },
    { key: 'Agency', label: t.roleAgency, desc: t.roleAgencyDesc, num: 5 },
    { key: 'Guest', label: t.roleGuest, desc: t.roleGuestDesc, num: 6 },
  ];

  const roleDefaultEmails: Record<UserRole, string> = {
    MP: 'mp.ghaziabad@sansad.nic.in',
    SNA: 'sna.mplads@up.gov.in',
    DM: 'dm.ghaziabad@up.gov.in',
    Ministry: 'mospi.mplads@nic.in',
    Agency: 'pwd.ghaziabad@up.gov.in',
    CDO: 'cdo.ghaziabad@up.gov.in',
    Engineer: 'engineer.pwd.gzb@up.gov.in',
    Admin: 'admin.mplads.gzb@up.gov.in',
    Guest: 'citizen.ghaziabad@gmail.com',
  };

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    if (!email || Object.values(roleDefaultEmails).includes(email)) {
      setEmail(roleDefaultEmails[newRole]);
    }
  };

  const sendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const effectiveEmail = email.trim() || roleDefaultEmails[role];
    setEmail(effectiveEmail);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
  };

  const verifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const effectiveOtp = otp.trim() || generatedOtp || '123456';
    if (effectiveOtp === generatedOtp || effectiveOtp === '123456') {
      onLogin({ email: email || roleDefaultEmails[role], role });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex items-center justify-center p-4 relative">
      {/* Top right language switcher on login page */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSwitcher variant="login" />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-lg mb-3">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 text-center">{t.appTitle}</h1>
            <p className="text-xs text-slate-500 mt-1 text-center">{t.appSubtitle}</p>
          </div>

          {!otpSent ? (
            <form onSubmit={sendOtp}>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.officialEmail}</label>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendOtp();
                    }
                  }}
                  placeholder={roleDefaultEmails[role] || t.emailPlaceholder}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <label className="block text-xs font-semibold text-slate-500 mb-2">{t.selectRole}</label>
              <div className="space-y-2 mb-5">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.key}
                    onClick={() => handleRoleSelect(r.key)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      role === r.key
                        ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCog className={`h-4 w-4 ${role === r.key ? 'text-brand-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.label}</p>
                        <p className="text-[11px] text-slate-400">{r.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      role === r.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {r.key}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                {t.sendOtp} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp}>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {t.otpSentTo} {email}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">
                  {t.demoOtpMsg} <span className="font-bold tracking-wider">{generatedOtp}</span> (or use 123456)
                </p>
              </div>

              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.enterOtp}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    verifyOtp();
                  }
                }}
                placeholder={generatedOtp || t.otpPlaceholder}
                maxLength={6}
                className="w-full text-center text-lg tracking-[0.5em] font-bold py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent mb-4"
                autoFocus
              />

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                {t.verifyAndEnter} <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); }}
                className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {t.changeEmailOrRole}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-4">
          {t.govOfUp}
        </p>
      </div>
    </div>
  );
}
