import React, { useState, useEffect, useCallback } from 'react';
import { me as getMe } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import { jwtDecode } from "jwt-decode";

function decodeJwtPayload(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = null;

  try {
    if (typeof Buffer !== 'undefined') {
      jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    }
  } catch (_) {}

  if (!jsonPayload) {
    try {
      const atobFn = typeof atob === 'function' ? atob : (global && global.atob) ? global.atob : null;
      if (atobFn) {
        const binary = atobFn(base64);
        jsonPayload = decodeURIComponent(
          Array.prototype.map
            .call(binary, (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      }
    } catch (_) {
    }
  }

  if (!jsonPayload) return null;
  try {
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export default function useCurrentUser(route) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => sessionStorage.getItem('authToken') || null);

  const decodeToken = useCallback(
    (t = token) => {
      if (!t) return null;
      try {
        if (jwtDecode) {
          return jwtDecode(t);
        }
        return decodeJwtPayload(t);
      } catch (e) {
        console.warn('Invalid token', e);
        return null;
      }
    },
    [token]
  );

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const t = sessionStorage.getItem('authToken');
      setToken(t);

      if (!t) {
        setUser(null);
        return;
      }

      const decoded = decodeToken(t);
      if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
        sessionStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        return;
      }

      let fetchedUser = null;
      try {
        const res = await getMe(t);
        fetchedUser = res?.body?.user || res?.user || null;
      } catch (apiErr) {
        console.warn('me API failed, falling back to token payload', apiErr);
      }

      const finalUser = fetchedUser || decoded?.user || { id: decoded?.sub || decoded?.id, ...decoded };
      setUser(finalUser);
    } catch (err) {
      console.error('Error loading user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [decodeToken]);

  useEffect(() => {
    loadUser();
  }, [loadUser, route?.params?.user]);

  const refreshUser = async () => {
    await loadUser();
  };

  const getUserId = () => {
    if (user?.id) return user.id;
    const decoded = decodeToken();
    return decoded?.sub || decoded?.id || null;
  };

  return { user, loading, token, refreshUser, getUserId, setUser };
}