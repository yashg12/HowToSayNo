import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Copy, LockKeyhole, Mail, MessageCircle, Menu, Sparkles, Sprout, Users, X } from 'lucide-react';
import { checkBackendHealth, generateRefusalApi, getUserUsageApi, incrementUserUsageApi, getUserSessionInfo } from './services/api';
import { initAuthSession, signInUser, signUpUser, signOutUser, onAuthChange } from './services/auth';
import { identifyUser, resetPostHog, trackEvent } from './services/posthog';
import { faqs, recipientOptions } from './data/mockData';
import './App.css';

const exactResponse = 'Hi [Name], I really appreciate you thinking of me for this. Unfortunately, my plate is currently full with my family commitments this weekend, so I won\'t be able to take this on. Let\'s touch base on Monday to see how else I can support the team.';
const secondResponse = 'I\'d love to help out with this, but I\'m completely booked up this weekend and need to protect that time for family. I can certainly take a look at this first thing on Monday morning if that works?';

function navigate(event) {
  const href = event.currentTarget.getAttribute('href');
  if (!href || href.startsWith('#')) return;
  event.preventDefault();
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Logo() {
  return (
    <a className="reference-logo" href="/" onClick={navigate}>
      <span className="logo-brand">HowToSay</span>
      <span className="logo-no-circle">
        <span className="logo-no-text">No</span>
        <span className="logo-badge">
          <Check size={10} strokeWidth={3} />
        </span>
      </span>
      <span className="logo-com">.com</span>
    </a>
  );
}

function ScrollDownIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const currentScroll = window.scrollY;

      if (currentScroll + windowHeight >= fullHeight - 150) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="scroll-down-indicator"
      onClick={() => window.scrollBy({ top: 450, behavior: 'smooth' })}
      role="button"
      tabIndex={0}
      aria-label="Scroll Down"
    >
      <span className="scroll-down-text">Scroll Down</span>
      <div className="scroll-down-circle">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="4" x2="12" y2="18"></line>
          <polyline points="6 12 12 18 18 12"></polyline>
        </svg>
      </div>
    </div>
  );
}

function ContactModal({ isOpen, onClose, planName = 'Upgrade' }) {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="auth-modal-header-banner" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
          <button className="auth-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
          <div className="auth-value-badge" style={{ background: '#22c55e', color: '#ffffff' }}>💬 Quick Connect</div>
          <h3 style={{ color: '#ffffff' }}>Get Started with {planName}</h3>
          <p style={{ color: '#cbd5e1' }}>
            No automated checkout delays! Talk directly with our developer team to get instant access &amp; passes.
          </p>
        </div>

        <div className="auth-modal-body" style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <a
              href="https://forms.gle/7wF8oY5AM4Rb1ct36"
              target="_blank"
              rel="noopener noreferrer"
              className="schedule-call-green-btn"
              style={{ justifyContent: 'center', width: '100%', borderRadius: '14px', fontSize: '15px' }}
              onClick={() => {
                trackEvent('contact_form_clicked', { plan: planName });
              }}
            >
              📅  Schedule a Call / WhatsApp <ArrowRight size={18} />
            </a>

            <a
              href="mailto:basicbrain1924@gmail.com"
              className="contact-gmail-btn"
              style={{ justifyContent: 'center', width: '100%', borderRadius: '14px', fontSize: '15px' }}
              onClick={() => {
                trackEvent('contact_gmail_clicked', { plan: planName });
              }}
            >
              <Mail size={18} /> Gmail Us Directly
            </a>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
            <Check size={16} style={{ color: '#2563eb', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            No sales pitch. Just a conversation. <strong>(Call: 87678 77602)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ isOpen, onClose, onSuccess, initialWarning = '' }) {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      if (tab === 'signup') {
        const res = await signUpUser(email, password);
        trackEvent('user_registered', { email });
        if (res?.session) {
          setInfoMsg('Account registered successfully! Unlocking your extra credits...');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 800);
        } else {
          setInfoMsg('Registration successful! Please check your email to confirm or sign in directly.');
          setTab('signin');
        }
      } else {
        const res = await signInUser(email, password);
        trackEvent('user_signed_in', { email });
        if (res?.session) {
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      trackEvent('auth_error', { tab, error: err.message });
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isRateLimited = errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('limit reached');

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header-banner">
          <button className="auth-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
          <div className="auth-value-badge">✨ Unlock Extra Credits</div>
          <h3>{tab === 'signup' ? 'Register Your Account' : 'Sign In to HowToSayNo'}</h3>
          <p>
            {tab === 'signup'
              ? 'Register now to get extra refusal credits, save history & access web extension!'
              : 'Sign in to access your extra refusal credits and stay logged in seamlessly.'}
          </p>
        </div>

        {initialWarning && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 16px', fontSize: '13px', fontWeight: '700', textAlign: 'center', borderBottom: '1px solid #fde68a' }}>
            {initialWarning}
          </div>
        )}

        <div className="auth-modal-tabs">
          <button className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setErrorMsg(''); setInfoMsg(''); }}>
            Sign In
          </button>
          <button className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setErrorMsg(''); setInfoMsg(''); }}>
            Register
          </button>
        </div>

        <div className="auth-modal-body">
          {errorMsg && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px', fontWeight: '600' }}>
              ⚠️ {errorMsg}
              {isRateLimited && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setTab('signin'); setErrorMsg(''); }}
                    style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Switch to Sign In →
                  </button>
                </div>
              )}
            </div>
          )}
          {infoMsg && (
            <div style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px', fontWeight: '600' }}>
              ✓ {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-input-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? 'Processing...'
                : tab === 'signup'
                ? 'Register'
                : 'Sign In'}
            </button>
          </form>

          <div className="auth-benefits-checklist">
            <div className="auth-benefit-item"><Check size={14} className="feat-check-icon" /> Extra AI Refusal Credits</div>
            <div className="auth-benefit-item"><Check size={14} className="feat-check-icon" /> Save Refusal History &amp; Favorites</div>
            <div className="auth-benefit-item"><Check size={14} className="feat-check-icon" /> Web Extension Integration</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ simple = false, user = null, freeRemaining = 3, maxLimit = 3, onOpenAuthModal, onSignOut }) {
  const [open, setOpen] = useState(false);
  const scrollToCoreTool = (e) => {
    e.preventDefault();
    setOpen(false);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setTimeout(() => {
        document.getElementById('core-tool')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('core-tool')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="reference-header">
      <Logo />
      <div className={open ? 'reference-nav open' : 'reference-nav'}>
        {!simple && (
          <>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); setOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); setOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
          </>
        )}
        
        {user && user.isAuthenticated ? (
          <div className="auth-user-badge-header">
            <span title={user.email}>👤 {user.email?.split('@')[0]}</span>
            <button className="auth-signout-btn" onClick={onSignOut}>Sign Out</button>
          </div>
        ) : (
          <a
            className="reference-signin"
            href="#core-tool"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              trackEvent('sign_in_clicked', { source: 'header_nav' });
              onOpenAuthModal();
            }}
          >
            Sign In / Register
          </a>
        )}

        <a className="reference-use" href="#core-tool" onClick={scrollToCoreTool}>Use Now <ArrowRight size={16} /></a>
      </div>
      <button className="reference-menu" onClick={() => setOpen(!open)} aria-label="Open navigation">{open ? <X /> : <Menu />}</button>
    </header>
  );
}

function ReferenceButton({ children, href = '#core-tool', className = '' }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setTimeout(() => {
        document.getElementById('core-tool')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('core-tool')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return <a className={`reference-button ${className}`} href={href} onClick={handleClick}>{children}<span><ArrowRight size={17} /></span></a>;
}

const planDataNew = {
  inr: {
    monthly: [
      { name: 'FREE', icon: '🌱', subtitle: 'Just getting started?', desc: 'Try saying No with confidence.', price: '₹0', unit: '', billedNote: 'Forever', features: ['3 AI assists', 'Basic assistance', 'Essential features'], action: 'Get Started', actionStyle: 'outline' },
      { name: 'QUICK WEEKLY', icon: '⚡', subtitle: 'Need help this week?', desc: 'Get quick assistance when you need it.', price: '₹49', unit: '/ 7 days', billedNote: 'Billed weekly', features: ['AI assistance', 'Unlimited assistance during the plan period', 'Quick responses'], action: 'Choose Weekly', actionStyle: 'outline' },
      { name: 'SMART MONTHLY', icon: '👤', badge: 'MOST POPULAR', subtitle: 'Want to say No without feeling guilty?', desc: "I’ll help you find the right words.", price: '₹249.99', unit: '/ month', billedNote: 'Billed monthly • Cancel anytime', features: ['Unlimited AI assistance', 'Polite & diplomatic responses', 'Multiple response tones', 'Everyday communication assistance'], action: 'Start Smart', actionStyle: 'solid-green', featured: true },
      { name: 'PROFESSIONAL PRO', icon: '💼', subtitle: 'Struggling to say No at work?', desc: "I’ll help you handle professional situations.", price: '₹599.99', unit: '/ month', billedNote: 'Billed monthly • Cancel anytime', features: ['Advanced AI responses', 'Professional communication', 'Advanced assistance', 'More powerful AI capabilities'], action: 'Go Pro', actionStyle: 'solid-green' },
      { name: 'ONE-TIME PURCHASE', icon: '👑', subtitle: 'Want help whenever you need it?', desc: 'Get lifetime access.', price: '₹18,000', unit: '', billedNote: 'One-time payment • Lifetime access', features: ['Lifetime access', 'No recurring subscription', 'Full access to the included features'], action: 'Buy Lifetime', actionStyle: 'outline' }
    ],
    yearly: [
      { name: 'FREE', icon: '🌱', subtitle: 'Just getting started?', desc: 'Try saying No with confidence.', price: '₹0', unit: '', billedNote: 'Forever', features: ['3 AI assists', 'Basic assistance', 'Essential features'], action: 'Get Started', actionStyle: 'outline' },
      { name: 'QUICK WEEKLY', icon: '⚡', subtitle: 'Need help this week?', desc: 'Get quick assistance when you need it.', price: '₹49', unit: '/ 7 days', billedNote: 'Billed weekly', features: ['AI assistance', 'Unlimited assistance during the plan period', 'Quick responses'], action: 'Choose Weekly', actionStyle: 'outline' },
      { name: 'SMART MONTHLY', icon: '👤', badge: 'MOST POPULAR', subtitle: 'Want to say No without feeling guilty?', desc: "I’ll help you find the right words.", price: '₹199.99', unit: '/ month', originalPrice: '₹249.99', billedNote: 'Billed ₹2,399.99 yearly (Save 20%)', discountPill: 'Save 20%', features: ['Unlimited AI assistance', 'Polite & diplomatic responses', 'Multiple response tones', 'Everyday communication assistance'], action: 'Start Smart', actionStyle: 'solid-green', featured: true },
      { name: 'PROFESSIONAL PRO', icon: '💼', subtitle: 'Struggling to say No at work?', desc: "I’ll help you handle professional situations.", price: '₹499.99', unit: '/ month', originalPrice: '₹599.99', billedNote: 'Billed ₹5,999.99 yearly (Save 17%)', discountPill: 'Save 17%', features: ['Advanced AI responses', 'Professional communication', 'Advanced assistance', 'More powerful AI capabilities'], action: 'Go Pro', actionStyle: 'solid-green' },
      { name: 'ONE-TIME PURCHASE', icon: '👑', subtitle: 'Want help whenever you need it?', desc: 'Get lifetime access.', price: '₹18,000', unit: '', billedNote: 'One-time payment • Lifetime access', features: ['Lifetime access', 'No recurring subscription', 'Full access to the included features'], action: 'Buy Lifetime', actionStyle: 'outline' }
    ]
  },
  usd: {
    monthly: [
      { name: 'FREE', icon: '🌱', subtitle: 'Just getting started?', desc: 'Try saying No with confidence.', price: '$0', unit: '', billedNote: 'Free forever', features: ['3 AI assists', 'Basic assistance', 'Essential features'], action: 'Start Free', actionStyle: 'outline' },
      { name: 'QUICK WEEKLY', icon: '⚡', subtitle: 'Need help this week?', desc: 'Get quick assistance when you need it.', price: '$1.99', unit: '/ 7 days', billedNote: 'Billed weekly', features: ['AI assistance', 'Unlimited assistance during the plan period', 'Quick responses'], action: 'Get Weekly', actionStyle: 'outline' },
      { name: 'SMART MONTHLY', icon: '👤', badge: 'MOST POPULAR', subtitle: 'Want to say No without feeling guilty?', desc: "I’ll help you find the right words.", price: '$7.99', unit: '/ month', billedNote: 'Billed monthly • Cancel anytime', features: ['Unlimited AI assistance', 'Polite & diplomatic responses', 'Multiple response tones', 'Everyday communication assistance'], action: 'Choose Monthly', actionStyle: 'solid-green', featured: true },
      { name: 'PROFESSIONAL PRO', icon: '💼', subtitle: 'Struggling to say No at work?', desc: "I’ll help you handle professional situations.", price: '$19.99', unit: '/ month', billedNote: 'Billed monthly • Cancel anytime', features: ['Advanced AI responses', 'Professional communication', 'Advanced assistance', 'More powerful AI capabilities'], action: 'Go Pro', actionStyle: 'solid-green' },
      { name: 'ONE-TIME PURCHASE', icon: '👑', subtitle: 'Want help whenever you need it?', desc: 'Get lifetime access.', price: '$699.99', unit: '', billedNote: 'One-time payment • Lifetime access', features: ['Lifetime access', 'No recurring subscription', 'Full access to the included features'], action: 'Buy Lifetime', actionStyle: 'outline' }
    ],
    yearly: [
      { name: 'FREE', icon: '🌱', subtitle: 'Just getting started?', desc: 'Try saying No with confidence.', price: '$0', unit: '', billedNote: 'Free forever', features: ['3 AI assists', 'Basic assistance', 'Essential features'], action: 'Start Free', actionStyle: 'outline' },
      { name: 'QUICK WEEKLY', icon: '⚡', subtitle: 'Need help this week?', desc: 'Get quick assistance when you need it.', price: '$1.99', unit: '/ 7 days', billedNote: 'Billed weekly', features: ['AI assistance', 'Unlimited assistance during the plan period', 'Quick responses'], action: 'Get Weekly', actionStyle: 'outline' },
      { name: 'SMART MONTHLY', icon: '👤', badge: 'MOST POPULAR', subtitle: 'Want to say No without feeling guilty?', desc: "I’ll help you find the right words.", price: '$6.25', unit: '/ month', originalPrice: '$7.99', billedNote: 'Billed $74.99 yearly (Save 22%)', discountPill: 'Save 22%', features: ['Unlimited AI assistance', 'Polite & diplomatic responses', 'Multiple response tones', 'Everyday communication assistance'], action: 'Choose Monthly', actionStyle: 'solid-green', featured: true },
      { name: 'PROFESSIONAL PRO', icon: '💼', subtitle: 'Struggling to say No at work?', desc: "I’ll help you handle professional situations.", price: '$15.00', unit: '/ month', originalPrice: '$19.99', billedNote: 'Billed $179.99 yearly (Save 25%)', discountPill: 'Save 25%', features: ['Advanced AI responses', 'Professional communication', 'Advanced assistance', 'More powerful AI capabilities'], action: 'Go Pro', actionStyle: 'solid-green' },
      { name: 'ONE-TIME PURCHASE', icon: '👑', subtitle: 'Want help whenever you need it?', desc: 'Get lifetime access.', price: '$699.99', unit: '', billedNote: 'One-time payment • Lifetime access', features: ['Lifetime access', 'No recurring subscription', 'Full access to the included features'], action: 'Buy Lifetime', actionStyle: 'outline' }
    ]
  }
};

function PricingSection({ user = null, onOpenAuthModal, onOpenContactModal }) {
  const [currency, setCurrency] = useState('inr');
  const [billing, setBilling] = useState('yearly');
  const activePlans = planDataNew[currency][billing];

  return (
    <section className="new-pricing-section" id="pricing">
      <div className="new-pricing-header">
        <div className="pricing-top-pill">
          Simple Pricing • Powerful AI Assistance
        </div>
        <h2>Say No With Confidence</h2>
        <p className="pricing-tagline">Choose the plan that fits your needs. Get the right words, save time, and communicate with confidence.</p>

        <div className="watch-guide-container">
          <a
            href="https://youtube.com/@printsmaartofficialpage?si=fpCgFSoj9R4iB2Os"
            target="_blank"
            rel="noopener noreferrer"
            className="watch-guide-btn"
          >
            <span className="play-icon-blue">▶</span> Watch Guide Video <ArrowRight size={14} />
          </a>
          <div className="watch-guide-subtext">
            <span className="play-dot-blue">▶</span> Watch the guide video about subscription plans for best investment in saying No!
          </div>
        </div>

        <div className="currency-selector">
          <button className={currency === 'inr' ? 'curr-btn active' : 'curr-btn'} onClick={() => setCurrency('inr')}>
            INR (₹)
          </button>
          <button className={currency === 'usd' ? 'curr-btn active' : 'curr-btn'} onClick={() => setCurrency('usd')}>
            USD ($)
          </button>
        </div>

        <div className="billing-toggle-container">
          <span className={billing === 'monthly' ? 'toggle-label active' : 'toggle-label'}>Monthly</span>
          <button
            className={`toggle-switch ${billing === 'yearly' ? 'switched' : ''}`}
            onClick={() => setBilling(billing === 'yearly' ? 'monthly' : 'yearly')}
            aria-label="Toggle Billing"
          >
            <span className="toggle-slider" />
          </button>
          <span className={billing === 'yearly' ? 'toggle-label active' : 'toggle-label'}>Yearly</span>
          {billing === 'yearly' ? (
            <span className="save-badge-green">Save up to 25%</span>
          ) : (
            <span className="no-save-badge">(No annual savings in monthly mode)</span>
          )}
        </div>
      </div>

      <div className="new-pricing-cards-grid">
        {activePlans.map((plan) => (
          <div className={`new-price-card ${plan.featured ? 'featured-card' : ''}`} key={plan.name}>
            {plan.badge && <div className="card-top-badge">{plan.badge}</div>}
            
            <div className="card-icon-header">
              <span className="card-emoji-icon">{plan.icon}</span>
            </div>

            <h3 className="card-plan-title">{plan.name}</h3>
            <p className="card-plan-sub">{plan.subtitle}</p>
            {plan.desc && <p className="card-plan-desc">{plan.desc}</p>}

            {plan.originalPrice && <div className="original-strike">{plan.originalPrice}</div>}
            <div className="card-price-display">
              <strong className="main-price-val">{plan.price}</strong>
              {plan.unit && <span className="price-unit-val">{plan.unit}</span>}
            </div>

            {plan.billedNote && <p className="billed-note-val">{plan.billedNote}</p>}
            {plan.discountPill && <div className="save-pill-tag">{plan.discountPill}</div>}

            <div className="card-features-list">
              {plan.features.map((feat) => (
                <div key={feat} className="feat-check-line">
                  <Check size={14} className="feat-check-icon" /> {feat}
                </div>
              ))}
            </div>

            <button
              className={`card-action-btn btn-${plan.actionStyle}`}
              onClick={(e) => {
                e.preventDefault();
                if (plan.name === 'FREE') {
                  if (user && user.isAuthenticated) {
                    document.getElementById('core-tool')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onOpenAuthModal();
                  }
                } else {
                  trackEvent('pricing_whatsapp_redirect', { plan: plan.name });
                  window.open('https://wa.me/918767877602', '_blank');
                }
              }}
            >
              {plan.action}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-bottom-reassurance-bar">
        <span><Check size={14} className="reassure-check-icon" /> Secure Payment</span>
        <span><Check size={14} className="reassure-check-icon" /> Cancel Anytime</span>
        <span><Check size={14} className="reassure-check-icon" /> No Hidden Fees</span>
        <span><Check size={14} className="reassure-check-icon" /> Your Privacy Matters</span>
      </div>
    </section>
  );
}

function LandingPage() {
  const [faq, setFaq] = useState(0);

  // User & Auth State
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authWarningMessage, setAuthWarningMessage] = useState('');

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalPlan, setContactModalPlan] = useState('Upgrade');

  const openContactModal = (planName = 'Upgrade') => {
    setContactModalPlan(planName);
    setIsContactModalOpen(true);
  };

  // Core tool state for Landing Page inline access
  const [situation, setSituation] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Diplomatic');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [maxLimit, setMaxLimit] = useState(3);
  const [freeRemaining, setFreeRemaining] = useState(3);
  const [errorMsg, setErrorMsg] = useState('');
  const [backendStatus, setBackendStatus] = useState(null);

  const refreshUserUsage = async () => {
    try {
      const sessionInfo = await getUserSessionInfo();
      setUser(sessionInfo);

      if (sessionInfo && sessionInfo.userId) {
        if (sessionInfo.isAuthenticated) {
          identifyUser(sessionInfo.userId, sessionInfo.userEmail);
        }
        const usage = await getUserUsageApi(sessionInfo.userId, sessionInfo.isAuthenticated);
        if (usage && typeof usage.generation_count === 'number') {
          setAttempts(usage.generation_count);
          setMaxLimit(usage.max_limit || (sessionInfo.isAuthenticated ? 10 : 3));
          setFreeRemaining(usage.free_generations_remaining);
        }
      }
    } catch (e) {
      console.warn('Failed to refresh user usage:', e);
    }
  };

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendStatus(res);
    });

    initAuthSession().then(() => {
      refreshUserUsage();
    });

    const sub = onAuthChange((event, session, currentUser) => {
      if (event === 'SIGNED_IN') {
        trackEvent('user_signed_in', { email: session?.user?.email });
      }
      refreshUserUsage();
    });

    return () => {
      if (sub && sub.subscription) sub.subscription.unsubscribe();
    };
  }, []);

  const openAuthModalWithWarning = (msg = '') => {
    trackEvent('auth_modal_opened', { reason: msg });
    setAuthWarningMessage(msg || "⚠️ Free limit reached (3/3). Sign in or register to get extra credits!");
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    trackEvent('user_signed_out');
    resetPostHog();
    await signOutUser();
    // Assign a fresh guest UUID on sign out so guest usage starts clean at 0/3
    const newGuestId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    localStorage.setItem('howtosayno_user_id', newGuestId);
    setResponse('');
    setErrorMsg('');
    await refreshUserUsage();
  };

  const generate = async () => {
    if (!situation.trim() || loading) return;

    const isGuest = !user || !user.isAuthenticated;

    // Guest exhausted check -> automatically open AuthModal with warning
    if (isGuest && freeRemaining <= 0) {
      trackEvent('guest_limit_reached', { attempts });
      setErrorMsg("⚠️ Free guest limit reached (3/3). Please sign in or register to get extra credits!");
      openAuthModalWithWarning("⚠️ You've used all 3 free guest attempts! Sign in or register to unlock 10 credits!");
      return;
    }

    if (!isGuest && freeRemaining <= 0) {
      trackEvent('member_limit_reached', { attempts });
      setErrorMsg("Member credit limit reached (10/10). Please upgrade to Pro for unlimited AI access!");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      trackEvent('refusal_generate_started', { tone, recipient, isAuthenticated: !!user?.isAuthenticated });

      const data = await generateRefusalApi({
        situation,
        recipient: recipient || 'Colleague / Friend',
        tone
      });
      if (data && data.response) {
        setResponse(data.response);
        trackEvent('refusal_generate_success', { tone, recipient });

        // Increment usage endpoint exactly once after successful generation
        const sessionInfo = await getUserSessionInfo();
        const updatedUsage = await incrementUserUsageApi(sessionInfo.userId, sessionInfo.isAuthenticated);

        if (updatedUsage && typeof updatedUsage.generation_count === 'number') {
          setAttempts(updatedUsage.generation_count);
          setMaxLimit(updatedUsage.max_limit || (user?.isAuthenticated ? 10 : 3));
          setFreeRemaining(updatedUsage.free_generations_remaining);
        } else if (typeof data.generation_count === 'number') {
          setAttempts(data.generation_count + 1);
          setMaxLimit(data.max_limit || (user?.isAuthenticated ? 10 : 3));
          setFreeRemaining(Math.max(0, data.free_generations_remaining - 1));
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
      trackEvent('refusal_generate_failed', { error: err.message });
      if (!user?.isAuthenticated && (err.status === 403 || err.message?.includes('limit') || err.message?.includes('sign in'))) {
        openAuthModalWithWarning("⚠️ Free guest limit reached! Sign in or register to get extra credits!");
      } else {
        setErrorMsg(err.message || 'Failed to generate refusal');
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => navigator.clipboard?.writeText(text);
  const startOver = () => { setSituation(''); setRecipient(''); setResponse(''); setTone('Diplomatic'); setErrorMsg(''); };

  const testimonialsList1 = [
    { name: 'Rahul M.', role: 'India', stars: 5, text: "I always struggle to say no to my manager without sounding like I'm making excuses. I explained the situation to HowToSayNo and it gave me a professional response that I could send directly. It saved me from overthinking the message for 20 minutes." },
    { name: 'Priya S.', role: 'India', stars: 5, text: "My friend kept asking me to join plans even when I already had other things going on. I didn't want to hurt her feelings, so I tried HowToSayNo. The response was polite but still clear. That's exactly what I needed." },
    { name: 'Arjun K.', role: 'India', stars: 4, text: 'Saying no to extra work is difficult for me, especially with senior people. I described what happened and the AI helped me frame it professionally instead of just saying "I can\'t do it." Pro plan is very useful for workplace situations.' },
    { name: 'Jane P.', role: 'USA', stars: 5, text: "I had to refuse a family request but didn't know how to explain myself without starting an argument. HowToSayNo gave me a much softer way to communicate it. I actually copied the response and sent it on WhatsApp." },
    { name: 'Xin Ching', role: 'China', stars: 5, text: "The biggest problem isn't knowing that I should say no. It's figuring out HOW to say it. In the platform, I can explain the whole situation in normal words and get something structured and diplomatic back. That makes the tool for me surprisingly useful." }
  ];

  const testimonialsList2 = [
    { name: 'Mat T.', role: 'Canada', stars: 4, text: 'I used it before replying to a client who wanted additional work outside the original project. Instead of sounding rude or defensive, I got a professional message explaining my boundary and offering an alternative. I upgraded because I was using it regularly for work.' },
    { name: 'Karan V.', role: 'India', stars: 4, text: "I usually type a message, delete it, rewrite it and then still don't send it. 😂 HowToSayNo helped me get past that whole process. I explain what I want to refuse and it gives me words that actually sound like something a normal person would say." },
    { name: 'Jasmin Shaikh', role: 'UAE', stars: 5, text: "I used it when my colleague asked me to cover their shift at the last minute. I didn't want to lie or make a big excuse. The Platforms Pro version helped me say no honestly while keeping the conversation friendly. Simple idea, but very practical." },
    { name: 'Rohan P.', role: 'Nepal', stars: 5, text: 'The Pro plan has been useful for me because I use HowToSayNo quite often at work. I like being able to go back to previous situations instead of explaining everything from scratch again. It feels more useful than just asking a general AI for a reply.' },
    { name: 'Ananya G.', role: 'USA', stars: 4, text: "I had to tell someone that I couldn't attend an event after already saying I would come. I was overthinking how they might react. The response helped me be honest without making it sound like I didn't care about them." }
  ];

  const testimonialsList3 = [
    { name: 'Vikram S.', role: 'India', stars: 5, text: 'I manage a small team and sometimes I have to say no to requests from employees, clients and vendors. HowToSayNo helps me change the tone depending on who I\'m talking to. The professional wording is the part I find most useful.' },
    { name: 'Isha M.', role: 'Canada', stars: 4, text: 'I tried the free version first and was surprised how quickly it understood the situation I described. After using it several times, I moved to the paid plan because I wanted more assistance instead of having to wait for another situation before using it.' },
    { name: 'Sameer Dhou', role: 'India', stars: 4, text: 'My parents wanted me to commit to something I genuinely couldn\'t manage at the moment. I didn\'t want to simply say "No." I explained the situation to HowToSayNo and got a response that helped me explain my reasons respectfully. I actually used most of it as a talking script.' },
    { name: 'Aditi Rai', role: 'India', stars: 4, text: 'What I like is that it doesn\'t just tell me "say no." It helps me understand how to say it without sounding angry, guilty or uninterested. I\'ve used it for work messages, friends and even personal situations.' },
    { name: 'Daniel Shah', role: 'UAE', stars: 5, text: 'I originally thought this was just another AI writing tool, but the specific use case makes a difference. When I\'m stuck between accepting something I don\'t want to do and sounding rude by refusing, I can just explain the situation and get a usable response. The paid plan makes sense for me because I use it frequently.' }
  ];

  return (
    <div className="reference-site">
      <Header
        user={user}
        freeRemaining={freeRemaining}
        maxLimit={maxLimit}
        onOpenAuthModal={() => {
          setAuthWarningMessage('');
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />
      <main>
        {/* 1. Hero Section */}
        <section className="reference-hero">
          {/* Tech Support by Vercel Animated Badge */}
          <div className="vercel-tech-badge">
            <span className="vercel-badge-pulse" />
            <svg viewBox="0 0 76 65" className="vercel-triangle-logo">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
            </svg>
            <span className="vercel-badge-text">tech support by <strong>Vercel</strong></span>
          </div>

          <div className="hero-mark"><span>HowToSay</span><b className="bad-no">No</b><ArrowRight size={24} /><b className="good-no">No</b></div>
          <h1>Politely + Diplomatically</h1>
          <p className="hero-tagline">which don't makes peoples feel Bad &amp; You don't Look Bad in People's eye!!</p>
          <div className="hero-showcase">
            <div className="browser-sketch">
              <div className="browser-top"><i /><i /><i /></div>
              <div className="browser-screen" />
              <div className="browser-controls">‹ <span>▷</span> ›</div>
            </div>
            <div className="hero-action">
              <ReferenceButton>Use Now</ReferenceButton>
              <div className="hero-people"><i>J</i><i>M</i><i>A</i><i>K</i></div>
              <div className="hero-stars">★★★★★</div>
              <p>Loved by people worldwide for saying “No” freely using the Platform!</p>
            </div>
          </div>
        </section>

        {/* 1.5. Intro Feature Showcase Section */}
        <section className="reference-section feature-showcase-page" style={{ padding: '60px 5%', background: '#ffffff', textAlign: 'center' }}>
          <div style={{ maxWidth: '840px', margin: '0 auto 40px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 3.8vw, 34px)', fontWeight: '800', lineHeight: '1.35', color: '#111a2d', margin: 0 }}>
              “The AI that properly Articulates Polite &amp; Diplomatic Refusals so you keep Your boundaries &amp; your professional and personal relationships intact”
            </h2>
          </div>

          <div className="tool-benefit-boxes-grid" style={{ marginTop: 0 }}>
            <div className="benefit-mini-box">
              <span className="benefit-icon-symbol">↝</span>
              <h3>Keep Your Connections</h3>
              <p>Designed specifically to protect your relationships with seniors, family, and managers.</p>
            </div>
            <div className="benefit-mini-box">
              <span className="benefit-icon-symbol">♧</span>
              <h3>Psychologically Sound</h3>
              <p>We format boundaries that people actually respect without feeling offended or hurt.</p>
            </div>
            <div className="benefit-mini-box">
              <span className="benefit-icon-symbol">▣</span>
              <h3>Private &amp; Secure</h3>
              <p>Your situations are never saved or stored. Type freely and with confidence.</p>
            </div>
          </div>
        </section>

        {/* 2. Core Tool access */}
        <section className="reference-section inline-tool-section" id="core-tool">
          <h2 className="section-title-center">Craft Your Polite Boundary</h2>
          <p className="section-subtitle-center" style={{ color: '#0f172a', fontWeight: '800', fontSize: '16px' }}>
            Draft your polite refusal right now without leaving the page. The AI that articulates diplomatic refusals while preserving your boundaries &amp; relationships intact.
          </p>

          {/* Lite / Pro Version Announcement Banner */}
          <BannerAnnouncement user={user} />

          {response ? (
            <OutputBox response={response} copy={copy} onStartOver={startOver} />
          ) : (
            <>
              <InputBox
                situation={situation}
                setSituation={setSituation}
                recipient={recipient}
                setRecipient={setRecipient}
                tone={tone}
                setTone={setTone}
                loading={loading}
                generate={generate}
                freeRemaining={freeRemaining}
                maxLimit={maxLimit}
                user={user}
                errorMsg={errorMsg}
                onOpenAuthModal={() => openAuthModalWithWarning('⚠️ Sign in or register to get extra refusal credits!')}
              />
              <DoYouKnowBox />
            </>
          )}
        </section>

        {/* 3. Problem & Solution Table page */}
        <section className="reference-section problem-solution" id="how-it-works">
          <h2>Tired of getting over thinking or Confused?</h2>
          <div className="problem-table">
            <div>
              <b>The Real-Life Problem<br />(The Pain)</b>
              <p>Fear of damaging the bond: Worrying your boss, relative, or friend will feel insulted or hold a grudge.</p>
              <p>Overthinking paralysis: Spending 45 minutes rewriting a simple 2-sentence text or email.</p>
              <p>Over-explaining with fake excuses: Making up elaborate stories just to justify protecting your time.</p>
              <p>Accidentally sounding blunt or cold: Worrying a direct “No” sounds aggressive or uncooperative.</p>
              <p>Post-rejection guilt: Feeling like a “bad person” or “selfish” after turning someone down.</p>
            </div>
            <div>
              <b>HowToSayNo Solution<br />(The Relief)</b>
              <p>Relationship-First Phrasing: Crafts warm diplomatic words that respect the person first before declining the request.</p>
              <p>Instant Clarity in 5 Seconds: Delivers ready-to-send drafts situated to your exact situation immediately.</p>
              <p>Clean, Confident Boundaries: Gives clear refusals that need no fake excuses or apologies.</p>
              <p>Nuanced Tone Tuning: Choose between Gentle, Diplomatic, or Firm depending on who you are speaking with.</p>
              <p>Constructive Reframing: Turns refusal into positive alternatives (e.g., offering next steps or future availability).</p>
            </div>
          </div>
        </section>

        {/* 4. Testimonials Page 1 */}
        <section className="reviews-section" id="reviews">
          <h2>People who found the right words.</h2>
          <div className="reviews-grid">
            {testimonialsList1.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="review-avatar">{review.name.slice(0, 1)}</div>
                <strong>{review.name}</strong>
                <span>({review.role})</span>
                <div className="review-stars">{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</div>
                <p>“{review.text}”</p>
              </article>
            ))}
          </div>
        </section>

        {/* 5. Mid-Page Conversion Re-Hook */}
        <section className="reference-section preview-cta">
          <h2>Ready to Set Your Boundaries?</h2>
          <b>Be the person who get loved by every right one!</b>
          <p>Professionally &amp; Personally</p>
          <a
            className="reference-button"
            href="#core-tool"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('core-tool')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Use Now <span><ArrowRight size={17} /></span>
          </a>
        </section>

        {/* 6. FAQ Page */}
        <section className="reference-section faq-section">
          <p className="designer-note">Questions about saying no</p>
          <h2>Frequently Asked Questions</h2>
          {faqs.slice(0, 4).map((item, index) => (
            <button className="reference-faq" key={item.question} onClick={() => setFaq(faq === index ? -1 : index)}>
              <span><b>?</b><strong>{item.question}</strong>{faq === index && <small>{item.answer}</small>}</span>
              <ChevronDown size={18} />
            </button>
          ))}
        </section>

        {/* 7. Testimonials Page 2 */}
        <section className="reviews-section reviews-section-2">
          <h2>Trusted across workplace &amp; personal life</h2>
          <div className="reviews-grid">
            {testimonialsList2.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="review-avatar">{review.name.slice(0, 1)}</div>
                <strong>{review.name}</strong>
                <span>({review.role})</span>
                <div className="review-stars">{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</div>
                <p>“{review.text}”</p>
              </article>
            ))}
          </div>
        </section>

        {/* 8. Pricing Page */}
        <PricingSection
          user={user}
          onOpenAuthModal={() => openAuthModalWithWarning('✨ Sign in or register to start with free credits!')}
          onOpenContactModal={openContactModal}
        />

        {/* 9. Direct Contact + Schedule a Call */}
        <section className="feedback-section-compact" id="contact">
          <div className="feedback-compact-container">
            <div className="feedback-compact-left">
              <div className="feedback-pill-tag-blue">
                <MessageCircle size={15} /> Get Help from Our Team
              </div>
              <h2 className="feedback-compact-heading">
                Let’s Make<br /><span className="text-blue-highlight">It Better.</span>
              </h2>
              <p className="feedback-compact-sub">
                Share your feedback or discuss your ideas with our developer team.
              </p>

              <div className="feedback-compact-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href="https://forms.gle/7wF8oY5AM4Rb1ct36"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="schedule-call-green-btn"
                >
                  <span className="cal-icon">📅</span> Schedule a Call / WhatsApp <ArrowRight size={18} />
                </a>
                <a
                  href="mailto:basicbrain1924@gmail.com"
                  className="contact-gmail-btn"
                  title="Email us at basicbrain1924@gmail.com"
                >
                  <Mail size={18} /> Gmail Us
                </a>
              </div>

              <div className="feedback-compact-note">
                <Check size={16} className="check-blue-icon" /> No sales pitch. Just a conversation. (Call: 87678 77602)
              </div>
            </div>

            <div className="feedback-compact-right">
              <div className="what-you-get-card-inline">
                <div className="gift-box-left">
                  <div className="gift-badge">What You’ll Get</div>
                  <div className="free-pro-pill">7 DAYS PRO — FREE</div>
                  <p className="gift-subtext">Schedule the feedback call and get a free 7-day Pro Week Pass.</p>
                </div>
                <div className="gift-features-right">
                  <div className="gift-feature-item">
                    <span className="gift-icon-circle">∞</span>
                    <div>
                      <strong>Unlimited assistance</strong>
                      <p>Get help whenever you need it.</p>
                    </div>
                  </div>
                  <div className="gift-feature-item">
                    <span className="gift-icon-circle">✦</span>
                    <div>
                      <strong>Try Pro features</strong>
                      <p>Explore advanced tools &amp; options.</p>
                    </div>
                  </div>
                  <div className="gift-feature-item">
                    <span className="gift-icon-circle">🛡</span>
                    <div>
                      <strong>No payment required</strong>
                      <p>100% free for 7 days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Testimonials Page 3 */}
        <section className="reviews-section reviews-section-3">
          <h2>Loved by people worldwide</h2>
          <div className="reviews-grid">
            {testimonialsList3.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="review-avatar">{review.name.slice(0, 1)}</div>
                <strong>{review.name}</strong>
                <span>({review.role})</span>
                <div className="review-stars">{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</div>
                <p>“{review.text}”</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Floating 3 Contact Buttons Stack */}
      <div className="floating-contact-stack">
        <a
          href="https://youtube.com/@printsmaartofficialpage?si=fpCgFSoj9R4iB2Os"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-float-btn youtube-float"
          title="Watch on YouTube"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
        <a
          href="https://wa.me/918767877602"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-float-btn whatsapp-float"
          title="Message on WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </a>
        <a
          href="mailto:basicbrain1924@gmail.com"
          className="contact-float-btn gmail-float"
          title="Send Gmail"
        >
          <Mail size={20} />
        </a>
      </div>

      <ScrollDownIndicator />
      <Footer />

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => refreshUserUsage()}
        initialWarning={authWarningMessage}
      />

      {/* Direct Contact / Schedule Call Modal Popup */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        planName={contactModalPlan}
      />
    </div>
  );
}

function SelectField({ value, onChange, customRecipient, setCustomRecipient }) {
  const isOther = value === 'Other' || (!recipientOptions.includes(value) && value !== '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="reference-select">
        <select
          value={recipientOptions.includes(value) ? value : (value ? 'Other' : '')}
          onChange={(event) => {
            const val = event.target.value;
            if (val === 'Other') {
              onChange('Other');
              if (setCustomRecipient) setCustomRecipient('');
            } else {
              onChange(val);
            }
          }}
        >
          <option value="">Select relationship...</option>
          {recipientOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <ChevronDown size={22} />
      </div>

      {(value === 'Other' || (isOther && value !== '')) && setCustomRecipient && (
        <input
          type="text"
          value={customRecipient}
          onChange={(e) => {
            setCustomRecipient(e.target.value);
            onChange(e.target.value || 'Other');
          }}
          placeholder="Specify relationship (e.g., Landlord, Neighbor, Team Lead)..."
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1.5px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
        />
      )}
    </div>
  );
}

function InputBox({ situation, setSituation, recipient, setRecipient, tone, setTone, loading, generate, freeRemaining = 3, maxLimit = 3, user = null, errorMsg = '', onOpenAuthModal }) {
  const isGuest = !user || !user.isAuthenticated;
  const [customRecipient, setCustomRecipient] = useState('');

  return (
    <section className="input-box">
      <div className="input-attempts-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={{ margin: 0 }}>1. What do you need to say no to?</label>
        <span className="attempts-pill-tag" style={{ background: freeRemaining > 0 ? '#fef3c7' : '#fee2e2', color: freeRemaining > 0 ? '#b45309' : '#991b1b', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>
          {isGuest ? `${freeRemaining}/3 free chances remaining` : `${freeRemaining}/10 credits remaining`}
        </span>
      </div>
      <textarea value={situation} onChange={(event) => setSituation(event.target.value)} placeholder="e.g., My boss wants me to work this weekend, but I have family plans..." />
      <label>2. Who are you telling?</label>
      <SelectField
        value={recipient}
        onChange={setRecipient}
        customRecipient={customRecipient}
        setCustomRecipient={setCustomRecipient}
      />
      <label>3. Desired Tone</label>
      <div className="tone-grid">
        {['Diplomatic', 'Clear & Firm', 'Soft / Gentle', 'Professional'].map((item) => (
          <button key={item} className={tone === item ? 'tone-selected' : ''} onClick={() => setTone(item)}>{item}</button>
        ))}
      </div>
      {errorMsg && (
        <div style={{ color: '#dc2626', fontSize: '14px', background: '#fef2f2', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fecaca', margin: '12px 0 0 0' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {isGuest && freeRemaining <= 0 ? (
        <button
          className="draft-button"
          onClick={onOpenAuthModal}
          style={{ background: '#2563eb', color: '#ffffff' }}
        >
          <LockKeyhole size={20} /> Limit Reached (3/3 Free Used) — Sign In or Register for Extra Credits
        </button>
      ) : (
        <button className="draft-button" onClick={generate} disabled={loading || (freeRemaining <= 0 && !isGuest)}>
          {loading ? (
            <span className="loading-btn-content">
              <Sparkles size={20} className="spinner-icon" /> Generating your polite reply...
            </span>
          ) : freeRemaining <= 0 ? (
            'Limit Reached (10/10 Used)'
          ) : (
            <><Sparkles size={21} /> Draft My Polite Reply</>
          )}
        </button>
      )}
    </section>
  );
}

const doYouKnowFacts = [
  "Saying 'No' to low-priority requests instantly creates space to say 'Yes' to your most important career & personal goals.",
  "Setting polite, clear boundaries actually increases professional respect and prevents long-term burnout.",
  "Over-explaining with fake excuses often leads to awkward negotiations—a soft, honest refusal is far more effective.",
  "Diplomatic refusals protect your personal relationships while keeping your schedule and mental peace intact.",
  "People who set healthy boundaries are rated as more dependable and authoritative in workplace studies."
];

function DoYouKnowBox() {
  const [factIndex, setFactIndex] = useState(0);
  const [fadeText, setFadeText] = useState(true);

  useEffect(() => {
    // Pick random initial fact
    const initialRandom = Math.floor(Math.random() * doYouKnowFacts.length);
    setFactIndex(initialRandom);

    // Shuffle & change fact every 15 seconds with smooth slow text transition
    const interval = setInterval(() => {
      setFadeText(false);
      setTimeout(() => {
        setFactIndex((prevIndex) => {
          let nextIndex;
          do {
            nextIndex = Math.floor(Math.random() * doYouKnowFacts.length);
          } while (nextIndex === prevIndex && doYouKnowFacts.length > 1);
          return nextIndex;
        });
        setFadeText(true);
      }, 700);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="do-you-know-card"
      style={{
        maxWidth: '680px',
        margin: '20px auto 0',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1.5px solid #bae6fd',
        borderRadius: '24px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 14px rgba(14, 165, 233, 0.08)',
        textAlign: 'left'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#0284c7',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '18px',
          flexShrink: 0
        }}
      >
        ?
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
          💡 Do You Know?
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#0c4a6e',
            lineHeight: '1.45',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: fadeText ? 1 : 0,
            transform: fadeText ? 'translateY(0)' : 'translateY(-3px)'
          }}
        >
          {doYouKnowFacts[factIndex]}
        </p>
      </div>
    </div>
  );
}

const loggedInBannerStatements = [
  'Peoples are saying "No" more & also maintain the good image by just opting for Smart Monthly & Professional Pro Advance Assist Plan',
  'Peoples are saying that they are moving towards Smart Monthly & Professional Pro Advance feature & Assist Plan because they want best Quality Output & Maintain there Goodwill!'
];

function BannerAnnouncement({ user }) {
  const isAuthenticated = user && user.isAuthenticated;
  const [statementIndex, setStatementIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Pick random initial statement immediately on sign-in
    const initialRandom = Math.floor(Math.random() * loggedInBannerStatements.length);
    setStatementIndex(initialRandom);
    setFade(false);
    const quickTimer = setTimeout(() => setFade(true), 50);

    // Rotate statement every 18 seconds with smooth transition
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setStatementIndex((prev) => (prev + 1) % loggedInBannerStatements.length);
        setFade(true);
      }, 800);
    }, 18000);

    return () => {
      clearTimeout(quickTimer);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const currentText = isAuthenticated
    ? loggedInBannerStatements[statementIndex]
    : "Do the free sign in & enjoy 10 free How to Say No assists with Web Extension Feature!";

  return (
    <div
      className="tool-free-limit-banner"
      style={{
        background: '#fef08a',
        border: '2px solid #facc15',
        borderRadius: '100px',
        padding: '12px 24px',
        boxShadow: '0 2px 10px rgba(234, 179, 8, 0.2)',
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: fade ? 1 : 0,
        transform: fade ? 'translateY(0)' : 'translateY(-4px)'
      }}
    >
      <p
        className="extension-promo-text"
        style={{
          color: '#78350f',
          fontSize: '14.5px',
          fontWeight: '800',
          margin: 0,
          lineHeight: '1.4'
        }}
      >
        {currentText}
      </p>
    </div>
  );
}

function OutputBox({ response, copy, onStartOver }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  let rawDrafts = response.split(/###|\n\n(?=")/).map((d) => d.replace(/^\*\*AI:\*\*\s*/i, '').trim()).filter(Boolean);
  
  if (rawDrafts.length === 1) {
    const lines = rawDrafts[0].split('\n\n').filter(Boolean);
    if (lines.length >= 2) {
      rawDrafts = lines;
    }
  }

  const parsedDrafts = rawDrafts.map((rawBlock, idx) => {
    let textContent = rawBlock;
    let badge = '';
    let description = '';

    if (rawBlock.includes('|||')) {
      const parts = rawBlock.split('|||');
      textContent = parts[0].trim();
      const descPart = parts[1] ? parts[1].trim() : '';
      if (descPart.includes(':')) {
        const colonIdx = descPart.indexOf(':');
        badge = descPart.substring(0, colonIdx + 1).trim();
        description = descPart.substring(colonIdx + 1).trim();
      } else {
        description = descPart;
      }
    }

    // Clean any residual markdown bold syntax (**...) from badge and description
    badge = badge.replace(/\*\*/g, '').trim();
    description = description.replace(/\*\*/g, '').trim();

    // Standardize quotation format around text if needed
    let cleanText = textContent.replace(/^["'“](.*)["'”]$/s, '$1').trim();
    cleanText = `"${cleanText}"`;

    if (!description) {
      const lower = cleanText.toLowerCase();
      if (idx === 0) {
        badge = 'Polite & Appreciative:';
        if (lower.includes('invitation') || lower.includes('thank') || lower.includes('appreciate')) {
          description = 'Shows gratitude, gives a clear reason, and keeps the tone friendly.';
        } else if (lower.includes('work') || lower.includes('busy') || lower.includes('schedule') || lower.includes('plate')) {
          description = 'Explains workload constraints clearly while maintaining professional courtesy.';
        } else {
          description = 'Shows gratitude, gives a clear reason, and keeps the tone friendly.';
        }
      } else {
        badge = 'Warm & Considerate:';
        if (lower.includes('hope') || lower.includes('wonderful') || lower.includes('thinking') || lower.includes('enjoy')) {
          description = 'Keeps it respectful, honest, and ends on a positive note.';
        } else if (lower.includes('protect') || lower.includes('family') || lower.includes('commitments')) {
          description = 'Softens the refusal while keeping your personal priorities protected.';
        } else {
          description = 'Keeps it respectful, honest, and ends on a positive note.';
        }
      }
    }

    return { draftText: cleanText, badge, description };
  });

  const handleCopy = (text, index) => {
    copy(text);
    trackEvent('copy_response', { draftIndex: index, charLength: text.length });
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = () => {
    trackEvent('regenerate_clicked');
    onStartOver();
  };

  return (
    <section className="output-box">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
        <span className="ready-dot" style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
        Your Drafts are Ready
      </h2>

      {parsedDrafts.map((item, idx) => (
        <div key={idx} className="draft-card-wrapper" style={{ marginBottom: '20px', textAlign: 'left' }}>
          {/* Main Draft Response Box */}
          <div
            className="draft-response"
            style={{
              position: 'relative',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '20px 24px',
              textAlign: 'left',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
            }}
          >
            <p style={{ margin: 0, paddingRight: '40px', fontSize: '15.5px', fontWeight: '600', lineHeight: '1.65', color: '#0f172a', whiteSpace: 'pre-wrap' }}>
              {item.draftText}
            </p>
            <button
              onClick={() => handleCopy(item.draftText, idx)}
              aria-label={`Copy draft ${idx + 1}`}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: copiedIndex === idx ? '#22c55e' : '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Copy draft"
            >
              <Copy size={18} />
            </button>
          </div>

          {/* 1-Line Description Banner */}
          <div
            className="draft-description-banner"
            style={{
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: idx % 2 === 0 ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${idx % 2 === 0 ? '#bbf7d0' : '#bfdbfe'}`,
              borderRadius: '12px',
              padding: '10px 16px',
              color: idx % 2 === 0 ? '#14532d' : '#1e3a8a'
            }}
          >
            {idx % 2 === 0 ? (
              <Sprout size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
            ) : (
              <Users size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
            )}
            <span style={{ width: '1px', height: '16px', background: idx % 2 === 0 ? '#bbf7d0' : '#bfdbfe', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', lineHeight: '1.45', color: idx % 2 === 0 ? '#166534' : '#1e40af' }}>
              {item.badge && <strong style={{ fontWeight: '800', marginRight: '6px', color: idx % 2 === 0 ? '#14532d' : '#1e3a8a' }}>{item.badge}</strong>}
              <span style={{ fontWeight: '500' }}>{item.description}</span>
            </span>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <button
          className="start-over"
          onClick={handleRegenerate}
          style={{
            background: '#cbd5e1',
            color: '#1e293b',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '100px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Ask Again
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="reference-footer">
      <div>
        <Logo />
        <p>We help you to take smart &amp;<br />polite decision of saying no!</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' }}>
          <a className="footer-more-reviews" href="#reviews" onClick={(event) => { event.preventDefault(); document.querySelector('.reviews-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
            See More Reviews
          </a>
          <a
            className="footer-use-now-btn"
            href="#core-tool"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById('core-tool')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Use Now <ArrowRight size={14} />
          </a>
        </div>
      </div>
      <div>
        <h3>Links</h3>
        <a href="/feedback" onClick={navigate}>Support</a>
        <a href="/">Privacy policy</a>
        <a href="/">Terms of Service</a>
        <a href="/">Facebook</a>
        <a href="/">Youtube</a>
        <a href="/">Reddit</a>
        <a href="/">Basicbrain</a>
        <a href="/">Jobsmart</a>
      </div>
    </footer>
  );
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  return <LandingPage />;
}

export default App;
