import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_CzppdcKisXwbfoAK7AgAqiFoMzDRp3cXyAEKa7Za2ZmB';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      person_profiles: 'identified_only',
      loaded: (ph) => {
        console.log('PostHog initialized successfully for EU Cloud');
      }
    });
  }
}

export function identifyUser(userId, userEmail = null) {
  if (!userId) return;
  posthog.identify(userId, {
    email: userEmail,
    app: 'HowToSayNo'
  });
}

export function resetPostHog() {
  posthog.reset();
}

export function trackEvent(eventName, properties = {}) {
  try {
    posthog.capture(eventName, properties);
  } catch (err) {
    console.warn('PostHog capture error:', err);
  }
}

export default posthog;
