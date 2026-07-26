import { useState } from 'react';
import { X, ShieldCheck, Lock, Heart, Calendar, Mail, User, KeyRound, Eye, EyeOff, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginModal({ role: initialRole, onClose, onSubmit }) {
  const [role, setRole] = useState(initialRole || 'donor'); // CHANGED: role ab andar se bhi select ho sakta hai
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  // OTP states
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const isDonor = role === 'donor';
  const isAdmin = role === 'admin';
  const today = new Date().toISOString().split('T')[0];

  const validators = {
    fullName: v => {
      if (!v.trim()) return 'Full name is required';
      if (v.trim().length < 3) return 'At least 3 characters';
      if (!/^[a-zA-Z\s]+$/.test(v)) return 'Letters only, no numbers or symbols';
      return '';
    },
    email: v => {
      if (!v) return 'Email is required';
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))
        return 'Enter a valid email (e.g. name@gmail.com)';
      if (/\.\./.test(v)) return 'Email cannot have consecutive dots';
      if (v.startsWith('.') || v.includes('@.')) return 'Invalid email format';
      return '';
    },
    phone: v => {
      const d = v.replace(/\D/g, '');
      if (!d) return 'Phone number is required';
      if (d.length !== 11) return `${d.length}/11 digits — must be exactly 11`;
      if (!/^03\d{9}$/.test(d)) return 'Must start with 03 (e.g. 0312-3456789)';
      return '';
    },
    password: v => {
      if (!v) return 'Password is required';
      if (v.length < 8) return 'Minimum 8 characters';
      if (!/[A-Z]/.test(v)) return 'Add at least one uppercase letter (A-Z)';
      if (!/[a-z]/.test(v)) return 'Add at least one lowercase letter (a-z)';
      if (!/[0-9]/.test(v)) return 'Add at least one number (0-9)';
      if (!/[!@#$%^&*()\-_=+\[\]{}|;:'",.<>?/`~\\]/.test(v))
        return 'Add at least one symbol (!@#$%...)';
      return '';
    },
    dateOfBirth: v => {
      if (!v) return 'Date of birth is required';
      const dob = new Date(v);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      if (age < 18) return `You are ${age} yrs old — donors must be 18+`;
      if (age > 65) return 'Donors must be 65 or younger';
      return '';
    },
    lastDonationDate: v => {
      if (!v) return '';
      const last = new Date(v);
      const now = new Date();
      if (last > now) return 'Cannot be a future date';
      const days = Math.floor((now - last) / 86400000);
      if (days < 56) return `${56 - days} more days needed (56-day gap required)`;
      return '';
    },
  };

  const validate = (field, value) => validators[field]?.(value) ?? '';

  const handleBlur = (field, value) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validate(field, value) }));
  };

  const handleChange = (field, value, setter) => {
    setter(value);
    if (touched[field]) setErrors(e => ({ ...e, [field]: validate(field, value) }));
  };

  const handlePhoneChange = raw => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    let fmt = digits;
    if (digits.length > 4) fmt = digits.slice(0, 4) + '-' + digits.slice(4);
    handleChange('phone', fmt, setPhone);
  };

  const pwStrength = (() => {
    if (!password) return { score: 0, label: '', color: '#e5e7eb' };
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[!@#$%^&*()\-_=+]/.test(password)) s++;
    return [
      { label: '', color: '#e5e7eb' },
      { label: 'Very Weak', color: '#ef4444' },
      { label: 'Weak', color: '#f97316' },
      { label: 'Fair', color: '#eab308' },
      { label: 'Strong', color: '#22c55e' },
      { label: 'Very Strong', color: '#16a34a' },
    ][s];
  })();

  const handleSubmit = async e => {
    e.preventDefault();
    const fields = isSignUp
      ? isDonor
        ? ['fullName', 'email', 'phone', 'password', 'dateOfBirth', 'lastDonationDate']
        : isAdmin
          ? ['fullName', 'email', 'password']
          : ['fullName', 'email', 'phone', 'password']  // seeker
      : ['email', 'password'];

    const values = { fullName, email, phone, password, dateOfBirth, lastDonationDate };
    const newErrors = {}, newTouched = {};
    let hasError = false;
    fields.forEach(f => {
      newTouched[f] = true;
      const err = validate(f, values[f]);
      newErrors[f] = err;
      if (err) hasError = true;
    });
    setTouched(newTouched);
    setErrors(newErrors);
    if (hasError) return;

    // Donor/Seeker signup: pehle OTP bhejo
    if (isSignUp && !isAdmin) {
      setOtpLoading(true);
      setOtpError('');
      try {
        const res = await fetch("http://localhost:5000/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName }),
        });
        const data = await res.json();
        if (data.success) {
          setOtpStep(true);
        } else {
          setOtpError(data.message || "OTP bhejne mein masla hua");
        }
      } catch {
        setOtpError("Server se connection nahi hua");
      } finally {
        setOtpLoading(false);
      }
      return;
    }

    // Login ya Admin: seedha submit
    if (isSignUp) {
      onSubmit({ email, password, fullName, role, adminSecret, isSignUp: true });
    } else {
      onSubmit({ email, password, role, isSignUp: false });
    }
  };

  // OTP verify — final register call
  const handleOTPVerify = async e => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setOtpError("6 digit OTP enter karein"); return; }
    setOtpLoading(true);
    setOtpError('');
    onSubmit({
      email, password, fullName, role, isSignUp: true, otp,
      phone: phone.replace(/\D/g, ''),
      ...(isDonor && { dateOfBirth, lastDonationDate }),
    });
    setOtpLoading(false);
  };

  const inputBorder = id =>
    touched[id] && errors[id] ? '#fca5a5' :
      touched[id] && !errors[id] ? '#86efac' : '#efefef';

  const inputBg = id =>
    touched[id] && errors[id] ? '#fff5f5' : '#f8f8f8';

  const iStyle = (id, extra = {}) => ({
    width: '100%', background: inputBg(id),
    border: `1.5px solid ${inputBorder(id)}`,
    borderRadius: 12, padding: '11px 14px 11px 40px',
    fontSize: 13, fontFamily: "'Sora',sans-serif",
    color: '#111', outline: 'none', transition: 'all 0.2s',
    boxSizing: 'border-box', ...extra,
  });

  // NEW: role select karne ke liye options — modal ke andar dikhne wale
  const roleOptions = [
    { key: 'donor', label: 'Donor', color: '#dc2626' },
    { key: 'seeker', label: 'Seeker', color: '#1e293b' },
    { key: 'admin', label: 'Admin', color: '#2563eb' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .lm * { font-family:'Sora',sans-serif; box-sizing:border-box; }
        .lm-ov { position:fixed;inset:0;background:rgba(0,0,0,0.52);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50;animation:lf .2s ease; }
        @keyframes lf{from{opacity:0}to{opacity:1}}
        .lm-box { background:#fff;border-radius:24px;width:100%;max-width:430px;box-shadow:0 32px 80px rgba(0,0,0,0.18);animation:lu .25s ease;max-height:92vh;overflow-y:auto;scrollbar-width:none;position:relative; }
        .lm-box::-webkit-scrollbar{display:none}
        @keyframes lu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#ccc;pointer-events:none;display:flex;}
        .eye-btn{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#ccc;padding:0;display:flex;}
        .eye-btn:hover{color:#888;}
        .lm-btn{width:100%;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:13px;padding:13px;font-size:14px;font-weight:700;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 20px rgba(239,68,68,0.26);transition:opacity .15s,transform .12s;}
        .lm-btn:hover{opacity:.92;transform:translateY(-1px);}
        .lm-btn:active{transform:translateY(0);}
        .lm-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
        .lm-close{position:absolute;top:16px;right:16px;background:#f5f5f5;border:none;border-radius:8px;padding:7px;cursor:pointer;display:flex;z-index:10;transition:background .15s;}
        .lm-close:hover{background:#fee2e2;}
        .pw-seg{height:4px;border-radius:4px;flex:1;transition:background .3s;}
        input[type="date"]::-webkit-calendar-picker-indicator{opacity:.35;cursor:pointer;}
        .lm-input:focus{border-color:#ef4444 !important;background:#fff !important;box-shadow:0 0 0 3px rgba(239,68,68,0.09);}
        select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;padding-right:34px;}
        .otp-input{width:100%;border:2px solid #efefef;border-radius:14px;padding:14px;font-size:28px;font-weight:800;text-align:center;letter-spacing:12px;outline:none;font-family:'JetBrains Mono',monospace;color:#ef4444;background:#fafafa;box-sizing:border-box;transition:all 0.2s;}
        .otp-input:focus{border-color:#ef4444;background:#fff;box-shadow:0 0 0 3px rgba(239,68,68,0.09);}
        .otp-input.err{border-color:#fca5a5;background:#fff5f5;}
        .role-btn{flex:1;padding:9px 0;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.15s;}
      `}</style>

      <div className="lm">
        <div className="lm-ov" onClick={e => e.target === e.currentTarget && onClose()}>
          <div className="lm-box">
            <button className="lm-close" onClick={onClose}><X size={15} color="#888" /></button>

            {/* ── OTP SCREEN ── */}
            {otpStep ? (
              <div style={{ padding: '32px 26px' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Mail size={26} color="#fff" />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 6, fontFamily: "'Sora',sans-serif" }}>Check Your Email</h2>
                  <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500, lineHeight: 1.7, fontFamily: "'Sora',sans-serif" }}>
                    6-digit OTP bhej diya gaya:<br />
                    <strong style={{ color: '#333' }}>{email}</strong>
                  </p>
                </div>
                <form onSubmit={handleOTPVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 8, fontFamily: "'Sora',sans-serif" }}>Enter OTP</label>
                    <input
                      className={`otp-input${otpError ? ' err' : ''}`}
                      type="text" maxLength={6} placeholder="······"
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                    />
                    {otpError && <ErrMsg msg={otpError} />}
                  </div>
                  <button type="submit" className="lm-btn" disabled={otpLoading}>
                    <ShieldCheck size={16} /> {otpLoading ? 'Verifying…' : 'Verify & Create Account'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', margin: 0, fontFamily: "'Sora',sans-serif" }}>
                    OTP nahi mila?{' '}
                    <button type="button"
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: "'Sora',sans-serif", textDecoration: 'underline', textUnderlineOffset: 3 }}
                      onClick={() => { setOtpStep(false); setOtp(''); setOtpError(''); }}>
                      Wapas jao
                    </button>
                  </p>
                </form>
              </div>
            ) : (
              <>
                {/* ── Header ── */}
                <div style={{ padding: '26px 26px 0' }}>

                  {/* NEW: Role Selector — user yahan se apna role chunta hai */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {roleOptions.map(r => (
                      <button
                        key={r.key}
                        type="button"
                        className="role-btn"
                        onClick={() => {
                          setRole(r.key);
                          // role badalne par purane role-specific fields aur errors clear kar do
                          setErrors({});
                          setTouched({});
                        }}
                        style={{
                          border: role === r.key ? `2px solid ${r.color}` : '1.5px solid #eee',
                          background: role === r.key ? r.color : '#fafafa',
                          color: role === r.key ? '#fff' : '#999',
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isAdmin ? '#fff5f5' : '#f0fdf4', border: `1px solid ${isAdmin ? '#fca5a5' : '#86efac'}`, borderRadius: 8, padding: '4px 10px', marginBottom: 14 }}>
                    <Heart size={11} color={isAdmin ? '#ef4444' : '#16a34a'} fill={isAdmin ? '#ef4444' : '#16a34a'} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: isAdmin ? '#ef4444' : '#16a34a', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      {role} Portal
                    </span>
                  </div>
                  <h2 style={{ fontSize: 21, fontWeight: 800, color: '#111', marginBottom: 4 }}>
                    {isSignUp
                      ? isDonor ? 'Create Donor Account'
                        : isAdmin ? 'Admin Registration'
                          : 'Create Seeker Account'
                      : 'Welcome Back'}
                  </h2>
                  <p style={{ fontSize: 12, color: '#bbb', fontWeight: 500, marginBottom: 20 }}>
                    {isAdmin ? 'Authorized personnel only.' : isSignUp ? 'Fill in your details carefully.' : 'Sign in to continue.'}
                  </p>
                  <div style={{ height: 1, background: '#f3f3f3' }} />
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} autoComplete="off" noValidate>
                  <div style={{ padding: '18px 26px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Full Name */}
                    {isSignUp && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                          <span className="ic"><User size={14} /></span>
                          <input className="lm-input" style={iStyle('fullName')} type="text" placeholder="e.g. Ahmed Raza"
                            value={fullName} onChange={e => handleChange('fullName', e.target.value, setFullName)} onBlur={e => handleBlur('fullName', e.target.value)} />
                        </div>
                        {touched.fullName && errors.fullName && <ErrMsg msg={errors.fullName} />}
                        {touched.fullName && !errors.fullName && fullName && <OkMsg msg="Looks good!" />}
                      </div>
                    )}

                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <span className="ic"><Mail size={14} /></span>
                        <input className="lm-input" style={iStyle('email')} type="email" placeholder="you@example.com"
                          value={email} onChange={e => handleChange('email', e.target.value, setEmail)} onBlur={e => handleBlur('email', e.target.value)} />
                      </div>
                      {touched.email && errors.email && <ErrMsg msg={errors.email} />}
                      {touched.email && !errors.email && email && <OkMsg msg="Valid email ✓" />}
                    </div>

                    {/* Phone — donor aur seeker dono ke liye, admin ke liye nahi */}
                    {isSignUp && !isAdmin && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                          <span className="ic"><Phone size={14} /></span>
                          <input className="lm-input" style={iStyle('phone')} type="tel" placeholder="03XX-XXXXXXX"
                            value={phone} maxLength={12}
                            onChange={e => handlePhoneChange(e.target.value)} onBlur={() => handleBlur('phone', phone)} />
                        </div>
                        {touched.phone && errors.phone && <ErrMsg msg={errors.phone} />}
                        {touched.phone && !errors.phone && phone && <OkMsg msg="Valid number ✓" />}
                        {!touched.phone && <span style={{ fontSize: 10, color: '#c8c8c8', fontWeight: 500 }}>Pakistani number — 11 digits, starts with 03</span>}
                      </div>
                    )}

                    {/* Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <span className="ic"><KeyRound size={14} /></span>
                        <input className="lm-input" style={iStyle('password', { paddingRight: 38 })} type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••" value={password} name="lm_pw" autoComplete="new-password"
                          onChange={e => handleChange('password', e.target.value, setPassword)} onBlur={e => handleBlur('password', e.target.value)} />
                        <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}>
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {isSignUp && password && (
                        <div>
                          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="pw-seg" style={{ background: i <= pwStrength.score ? pwStrength.color : '#f0f0f0' }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: pwStrength.color }}>{pwStrength.label}</span>
                        </div>
                      )}
                      {touched.password && errors.password && <ErrMsg msg={errors.password} />}
                      {touched.password && !errors.password && password && <OkMsg msg="Strong password ✓" />}
                      {isSignUp && (
                        <span style={{ fontSize: 10, color: '#c8c8c8', fontWeight: 500, lineHeight: 1.5 }}>
                          Uppercase + lowercase + number + symbol required
                        </span>
                      )}
                    </div>

                    {/* DOB + Last Donation */}
                    {isSignUp && isDonor && (
                      <>
                        <div style={{ height: 1, background: '#f3f3f3', margin: '2px 0' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Date of Birth</label>
                            <div style={{ position: 'relative' }}>
                              <span className="ic"><Calendar size={14} /></span>
                              <input className="lm-input" style={iStyle('dateOfBirth', { paddingLeft: 40 })} type="date" max={today}
                                value={dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value, setDateOfBirth)} onBlur={e => handleBlur('dateOfBirth', e.target.value)} />
                            </div>
                            {touched.dateOfBirth && errors.dateOfBirth && <ErrMsg msg={errors.dateOfBirth} />}
                            {touched.dateOfBirth && !errors.dateOfBirth && dateOfBirth && <OkMsg msg="Age verified ✓" />}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Last Donation</label>
                            <div style={{ position: 'relative' }}>
                              <span className="ic"><Calendar size={14} /></span>
                              <input className="lm-input" style={iStyle('lastDonationDate', { paddingLeft: 40 })} type="date" max={today}
                                value={lastDonationDate} onChange={e => handleChange('lastDonationDate', e.target.value, setLastDonationDate)} onBlur={e => handleBlur('lastDonationDate', e.target.value)} />
                            </div>
                            {touched.lastDonationDate && errors.lastDonationDate && <ErrMsg msg={errors.lastDonationDate} />}
                            {touched.lastDonationDate && !errors.lastDonationDate && lastDonationDate && <OkMsg msg="Eligible ✓" />}
                            <span style={{ fontSize: 10, color: '#c8c8c8', fontWeight: 500 }}>Optional</span>
                          </div>
                        </div>
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 13px', fontSize: 11, color: '#92400e', fontWeight: 600, lineHeight: 1.7 }}>
                          ℹ️ Donors must be <strong>18–65 years old</strong>.<br />
                          Last donation must be <strong>56+ days ago</strong>.
                        </div>
                      </>
                    )}

                    {/* Admin Secret */}
                    {isSignUp && isAdmin && (
                      <div style={{ background: '#fff5f5', border: '1.5px dashed #fca5a5', borderRadius: 13, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                          <ShieldCheck size={13} /> System Master Key
                        </div>
                        <div style={{ position: 'relative' }}>
                          <span className="ic"><KeyRound size={14} /></span>
                          <input style={{ ...iStyle(''), fontFamily: 'monospace', color: '#ef4444' }} type="password"
                            placeholder="Enter secret key" required value={adminSecret} onChange={e => setAdminSecret(e.target.value)} />
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit" className="lm-btn" style={{ marginTop: 4 }} disabled={otpLoading}>
                      {otpLoading ? 'Sending OTP…' : isSignUp ? <><ShieldCheck size={16} /> Create Account</> : <><Lock size={16} /> Sign In</>}
                    </button>

                    {otpError && <ErrMsg msg={otpError} />}

                    {/* Toggle */}
                    {!isAdmin && (
                      <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', margin: 0 }}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <button type="button" style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: "'Sora',sans-serif", textDecoration: 'underline', textUnderlineOffset: 3 }}
                          onClick={() => { setIsSignUp(v => !v); setErrors({}); setTouched({}); setOtpError(''); }}>
                          {isSignUp ? 'Sign In' : 'Register'}
                        </button>
                      </p>
                    )}
                    {isAdmin && !isSignUp && (
                      <p style={{ textAlign: 'center', fontSize: 10, color: '#ccc', fontWeight: 500 }}>
                        Admin access is restricted to authorized personnel only.
                      </p>
                    )}

                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const ErrMsg = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ef4444', fontSize: 11, fontWeight: 600 }}>
    <AlertCircle size={11} /> {msg}
  </div>
);
const OkMsg = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#22c55e', fontSize: 11, fontWeight: 600 }}>
    <CheckCircle2 size={11} /> {msg}
  </div>
);
