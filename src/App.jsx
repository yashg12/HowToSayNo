import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Copy, LockKeyhole, Mail, MessageCircle, Menu, Sparkles, X } from 'lucide-react';
import { generateMockResponse, getMockVariant } from './services/api';
import { faqs, mockHistory, pricingPlans, recipientOptions } from './data/mockData';
import './App.css';

const exactResponse = 'Hi [Name], I really appreciate you thinking of me for this. Unfortunately, my plate is currently full with my family commitments this weekend, so I won\'t be able to take this on. Let\'s touch base on Monday to see how else I can support the team.';
const secondResponse = 'I\'d love to help out with this, but I\'m completely booked up this weekend and need to protect that time for family. I can certainly take a look at this first thing on Monday morning if that works?';
const mockReviews = [
  { name: 'Maya R.', role: 'Product designer', text: 'I finally sent the message I had been rewriting for three days. It felt clear, kind, and completely like me.' },
  { name: 'Jordan L.', role: 'Small business owner', text: 'The tone choices make such a difference. It helped me protect my time without making a client feel dismissed.' },
  { name: 'Avery K.', role: 'Graduate student', text: 'A calm little reset when I am overthinking a difficult message. The drafts are simple and thoughtful.' },
  { name: 'Priya S.', role: 'Team lead', text: 'It gives you a respectful way to be firm. I use it whenever a work conversation feels harder than it should.' },
  { name: 'Daniel W.', role: 'Teacher', text: 'The wording is warm without being vague. Saying no feels much less uncomfortable now.' }
];

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

      // Hide only when reached within 150px of the very bottom of the page
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

function Header({ simple = false }) {
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
        <a className="reference-signin" href="#core-tool" onClick={scrollToCoreTool}>Sign In</a>
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
      { name: 'ONE-TIME PURCHASE', icon: '👑', subtitle: 'Want help whenever you need it?', desc: 'Get lifetime access.', price: '$699.99', unit: '', billedNote: 'One-time payment • Lifetime access', features: ['Lifetime access', 'No recurring subscription', 'Full access to the included features'], action: 'Get Lifetime', actionStyle: 'outline' }
    ],
    yearly: [
      { name: 'FREE', icon: '🌱', subtitle: 'Just getting started?', desc: 'Try saying No with confidence.', price: '$0', unit: '', billedNote: 'Free forever', features: ['3 AI assists', 'Basic assistance', 'Essential features'], action: 'Start Free', actionStyle: 'outline' },
      { name: 'QUICK WEEKLY', icon: '⚡', subtitle: 'Need help this week?', desc: 'Get quick assistance when you need it.', price: '$1.99', unit: '/ 7 days', billedNote: 'Billed weekly', features: ['AI assistance', 'Unlimited assistance during the plan period', 'Quick responses'], action: 'Get Weekly', actionStyle: 'outline' },
      { name: 'SMART MONTHLY', icon: '👤', badge: 'MOST POPULAR', subtitle: 'Want to say No without feeling guilty?', desc: "I’ll help you find the right words.", price: '$6.25', unit: '/ month', originalPrice: '$7.99', billedNote: 'Billed $74.99 yearly (Save 22%)', discountPill: 'Save 22%', features: ['Unlimited AI assistance', 'Polite & diplomatic responses', 'Multiple response tones', 'Everyday communication assistance'], action: 'Choose Monthly', actionStyle: 'solid-green', featured: true },
      { name: 'PROFESSIONAL PRO', icon: '💼', subtitle: 'Struggling to say No at work?', desc: "I’ll help you handle professional situations.", price: '$15.00', unit: '/ month', originalPrice: '$19.99', billedNote: 'Billed $179.99 yearly (Save 25%)', discountPill: 'Save 25%', features: ['Advanced AI responses', 'Professional communication', 'Advanced assistance', 'More powerful AI capabilities'], action: 'Go Pro', actionStyle: 'solid-green' },
      { name: 'ONE-TIME PURCHASE', icon: '👑', subtitle: 'Want help whenever you need it?', desc: 'Get lifetime access.', price: '$699.99', unit: '', billedNote: 'One-time payment • Lifetime access', features: ['Lifetime access', 'No recurring subscription', 'Full access to the included features'], action: 'Get Lifetime', actionStyle: 'outline' }
    ]
  }
};

function PricingSection() {
  const [currency, setCurrency] = useState('inr'); // 'inr' or 'usd'
  const [billing, setBilling] = useState('monthly'); // 'monthly' or 'yearly'
  const activePlans = planDataNew[currency][billing];

  return (
    <section className="new-pricing-section" id="pricing">
      <div className="new-pricing-header">
        <div className="pricing-top-pill">
          Simple Pricing • Powerful AI Assistance
        </div>
        <h2>Say No With Confidence</h2>
        <p className="pricing-tagline">Choose the plan that fits your needs. Get the right words, save time, and communicate with confidence.</p>

        {/* Watch Guide Video Option */}
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

        {/* Currency Switcher */}
        <div className="currency-selector">
          <button className={currency === 'inr' ? 'curr-btn active' : 'curr-btn'} onClick={() => setCurrency('inr')}>
            INR (₹)
          </button>
          <button className={currency === 'usd' ? 'curr-btn active' : 'curr-btn'} onClick={() => setCurrency('usd')}>
            USD ($)
          </button>
        </div>

        {/* Billing Toggle (Monthly / Yearly) */}
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

      {/* 5 Pricing Cards */}
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

            <button className={`card-action-btn btn-${plan.actionStyle}`}>
              {plan.action}
            </button>
          </div>
        ))}
      </div>

      {/* Footer reassurance bar matching image 3 */}
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

  // Core tool state for Landing Page inline access
  const [situation, setSituation] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Diplomatic');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const generate = async () => {
    if (!situation.trim() || loading || attempts >= 3) return;
    setLoading(true);
    const draft = await generateMockResponse();
    setResponse(draft || exactResponse);
    setAttempts((current) => current + 1);
    setLoading(false);
  };
  const copy = (text) => navigator.clipboard?.writeText(text);
  const startOver = () => { setSituation(''); setRecipient(''); setResponse(''); setTone('Diplomatic'); };

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
      <Header />
      <main>
        {/* 1. Hero Section */}
        <section className="reference-hero">
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

        {/* 1.5. Intro Feature Showcase Section (Between Hero and Core Tool) */}
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

        {/* 2. Core Tool access (Chat Box / Inline Generator) */}
        <section className="reference-section inline-tool-section" id="core-tool">
          <h2 className="section-title-center">Try Core Tool Directly</h2>
          <p className="section-subtitle-center">
            Draft your polite refusal right now without leaving the page. - The AI that drafts Polite &amp; Diplomatic Refusals so you keep Your boundaries &amp; your professional and personal relationships intact.
          </p>

          {/* Web Extension Promo & Free Attempts Counter */}
          <div className="tool-free-limit-banner">
            <span className="free-limit-badge">3/3 Free Chances</span>
            <p className="extension-promo-text">
              Do the free sign in &amp; enjoy 10 free How to Say No assists with Web Extension Feature!
            </p>
          </div>

          {response ? (
            <OutputBox response={response} copy={copy} onStartOver={startOver} />
          ) : (
            <InputBox situation={situation} setSituation={setSituation} recipient={recipient} setRecipient={setRecipient} tone={tone} setTone={setTone} loading={loading} generate={generate} attempts={attempts} />
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

        {/* 4. Testimonials Page 1 (5 peoples) */}
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

        {/* 5. Mid-Page Conversion Re-Hook (Use Now button) */}
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
        <PricingSection />

        {/* 9. Direct Contact + Schedule a Call (Let's Make It Better) */}
        <section className="feedback-section-compact" id="contact">
          <div className="feedback-compact-container">
            {/* Left Box */}
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
                  href="https://wa.me/918767877602"
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

            {/* Right What You'll Get Card */}
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

      {/* Floating 3 Contact Buttons Stack (YouTube, WhatsApp, Gmail) */}
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

      {/* 11. Footer */}
      <ScrollDownIndicator />
      <Footer />
    </div>
  );
}

function Feature({ icon, title, children }) { return <div className="reference-feature"><span>{icon}</span><h3>{title}</h3><p>{children}</p></div>; }
function CheckLine({ text }) { return <span className="check-line"><Check size={13} />{text}</span>; }
function PricingCard({ badge, name, description, price, period, detail, features, action, featured = false }) { return <article className={`pricing-card ${featured ? 'pricing-card-featured' : ''}`}><span className="pricing-badge">{badge}</span><h3>{name}</h3><p className="pricing-description">{description}</p><div className="pricing-price"><strong>{price}</strong><span>{period}</span></div><p className="pricing-detail">{detail}</p><div className="pricing-divider" />{features.map((feature) => <CheckLine key={feature} text={feature} />)}<button className="pricing-action">{action}</button></article>; }
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

function SelectField({ value, onChange }) { return <div className="reference-select"><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select relationship...</option>{recipientOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={22} /></div>; }

function GeneratorPage() {
  const [situation, setSituation] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Diplomatic');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const generate = async () => { if (!situation.trim() || loading || attempts >= 3) return; setLoading(true); const draft = await generateMockResponse(); setResponse(draft || exactResponse); setAttempts((current) => current + 1); setLoading(false); };
  const copy = (text) => navigator.clipboard?.writeText(text);
  const startOver = () => { setSituation(''); setRecipient(''); setResponse(''); setTone('Diplomatic'); };
  return <div className="reference-site"><Header simple /><main className="generator-page"><p className="exact-copy"><span>The AI that drafts Polite &amp; Diplomatic Refusals</span><span>so you keep Your boundaries</span><span>&amp; your professional and personal relationships intact.</span></p>{response ? <OutputBox response={response} copy={copy} onStartOver={startOver} /> : <InputBox situation={situation} setSituation={setSituation} recipient={recipient} setRecipient={setRecipient} tone={tone} setTone={setTone} loading={loading} generate={generate} />}{response && <div className="reference-warning">This is the Lite (Free) Version, but if u are consistently using it &amp; are professional then you should try Pro version for high level Output with extra features!</div>}{response && <button className="ask-again" onClick={() => setResponse(secondResponse)}>Ask Again</button>}<p className="attempt-note">*For Free version only give 3 attempts</p><button className="history-pill">Past Asked History</button><p className="feature-note">*Feature Only For Paid active for paid (pro) Version</p><section className="generator-benefits"><Feature icon="↝" title="Keep Your Connections">Designed specifically to protect your relationships with seniors, family, and managers.</Feature><Feature icon="♧" title="Psychologically Sound">We format boundaries that people actually respect without feeling offended or hurt.</Feature><Feature icon="▣" title="Private & Secure">Your situations are never saved or stored. Type freely and with confidence.</Feature></section></main><ScrollDownIndicator /></div>;
}

function InputBox({ situation, setSituation, recipient, setRecipient, tone, setTone, loading, generate, attempts = 0 }) {
  const remaining = Math.max(0, 3 - attempts);
  return (
    <section className="input-box">
      <div className="input-attempts-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={{ margin: 0 }}>1. What do you need to say no to?</label>
        <span className="attempts-pill-tag" style={{ background: '#fef3c7', color: '#b45309', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>
          {remaining}/3 free chances remaining
        </span>
      </div>
      <textarea value={situation} onChange={(event) => setSituation(event.target.value)} placeholder="e.g., My boss wants me to work this weekend, but I have family plans..." />
      <label>2. Who are you telling?</label>
      <SelectField value={recipient} onChange={setRecipient} />
      <label>3. Desired Tone</label>
      <div className="tone-grid">
        {['Diplomatic', 'Clear & Firm', 'Soft / Gentle', 'Professional'].map((item) => (
          <button key={item} className={tone === item ? 'tone-selected' : ''} onClick={() => setTone(item)}>{item}</button>
        ))}
      </div>
      <button className="draft-button" onClick={generate} disabled={loading || remaining === 0}>
        {loading ? 'Finding the right words...' : remaining === 0 ? 'Limit Reached (3/3 Used)' : <><Sparkles size={21} /> Draft My Polite Reply</>}
      </button>
    </section>
  );
}

function OutputBox({ response, copy, onStartOver }) { return <section className="output-box"><h2><span className="ready-dot" /> Your Drafts are Ready</h2><div className="draft-response"><p>{exactResponse}</p><button onClick={() => copy(exactResponse)} aria-label="Copy first draft"><Copy size={17} /></button></div><div className="draft-response"><p>{response === exactResponse ? secondResponse : response}</p><button onClick={() => copy(response)} aria-label="Copy second draft"><Copy size={17} /></button></div><button className="start-over" onClick={onStartOver}>Start Over</button></section>; }

function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  // Force single landing page experience across all URLs
  return <LandingPage />;
}
export default App;
