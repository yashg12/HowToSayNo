import { supabase } from '../lib/supabaseClient';
import { getAuthUser } from './auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Backend Health Check Response:', data);
    return data;
  } catch (error) {
    console.error('Failed to connect to backend:', error);
    return null;
  }
}

export async function getUserSessionInfo() {
  try {
    const authUser = await getAuthUser();
    if (authUser && !authUser.isAnonymous && authUser.email) {
      return {
        userId: authUser.id,
        userEmail: authUser.email,
        isAuthenticated: true
      };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const isAuth = !!session.user.email && !(session.user.is_anonymous ?? false);
      return {
        userId: session.user.id,
        userEmail: session.user.email || null,
        isAuthenticated: isAuth
      };
    }
  } catch (e) {
    console.warn('Supabase auth session fallback:', e);
  }

  let localId = localStorage.getItem('howtosayno_user_id');
  if (!localId || !/^[0-9a-fA-F-]{36}$/.test(localId)) {
    localId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    localStorage.setItem('howtosayno_user_id', localId);
  }
  return {
    userId: localId,
    userEmail: null,
    isAuthenticated: false
  };
}

export async function getOrCreateUserId() {
  const info = await getUserSessionInfo();
  return info.userId;
}

export async function getUserUsageApi(userId, isAuthenticated = false) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/usage/${userId}?is_authenticated=${isAuthenticated}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user usage:', error);
    return null;
  }
}

export async function incrementUserUsageApi(userId, isAuthenticated = false) {
  try {
    console.log(`[Usage Increment] Sending increment request for user ${userId} (isAuthenticated: ${isAuthenticated})`);
    const response = await fetch(`${BACKEND_URL}/api/usage/${userId}/increment?is_authenticated=${isAuthenticated}`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log(`[Usage Increment] Successfully incremented. Returned generation_count: ${data.generation_count}, free_remaining: ${data.free_generations_remaining}`);
    return data;
  } catch (error) {
    console.error('Failed to increment user usage:', error);
    return null;
  }
}

export async function generateRefusalApi({ situation, recipient, tone, relationship, medium, words, goal, language, mode }) {
  const sessionInfo = await getUserSessionInfo();
  
  const payload = {
    user_id: sessionInfo.userId,
    is_authenticated: sessionInfo.isAuthenticated,
    situation: situation.trim(),
    recipient: recipient.trim() || 'Colleague / Friend',
    tone: tone || 'Diplomatic',
    ...(relationship ? { relationship } : {}),
    ...(medium ? { medium } : {}),
    ...(words ? { words } : {}),
    ...(goal ? { goal } : {}),
    ...(language ? { language } : {}),
    ...(mode ? { mode } : {})
  };

  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.detail || `Server error (${response.status})`;
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  return data;
}
