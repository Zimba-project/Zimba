import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { me as getMe } from "../api/auth";
import { sessionStorage } from "../utils/Storage";

export default function useCurrentUser(route) {
  const initToken = sessionStorage.getItem("authToken");
  const decode = (t) => {
    try {
      return jwtDecode(t);
    } catch {
      return null;
    }
  };

  const initialUser = initToken ? decode(initToken) : null;

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(initToken);

const loadUser = useCallback(async () => {
  setLoading(true);

  const t = await sessionStorage.getItem('authToken'); // <- await here
  setToken(t);

  if (!t) {
    setUser(null);
    setLoading(false);
    return;
  }

  const decoded = decode(t);
  if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
    await sessionStorage.removeItem('authToken');
    setUser(null);
    setLoading(false);
    return;
  }

  try {
    const res = await getMe(t);
    const backendUser = res?.body?.user || res?.user || {};
    setUser({ ...decoded, ...backendUser });
  } catch {
    setUser(decoded || null);
  }

  setLoading(false);
}, []);

useEffect(() => {
  loadUser();
  // for token debug (async () => {const tokenValue = await sessionStorage.getItem('authToken'); console.log('Current user token:', tokenValue);})();
}, [route?.params?.user]);

  const refreshUser = () => loadUser();

  const getUserId = () => user?.id || decode(token)?.sub || null;

  return { user, loading, token, refreshUser, getUserId, setUser };
}
