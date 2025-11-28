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
  const initialUser = initToken ? decode(initToken) || {} : {};

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(initToken);

  const loadUser = useCallback(async () => {
    setLoading(true);
    const t = sessionStorage.getItem("authToken");
    setToken(t);

    if (!t) {
      setUser({});
      setLoading(false);
      return;
    }

    const decoded = decode(t);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      sessionStorage.removeItem("authToken");
      setUser({});
      setLoading(false);
      return;
    }

    try {
      const res = await getMe(t);
      const backendUser = res?.body?.user || res?.user || {};
      setUser({ ...decoded, ...backendUser });
    } catch {
      setUser(decoded || {});
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [route?.params?.user]);

  const refreshUser = () => loadUser();

  const getUserId = () => user?.id || decode(token)?.sub || null;

  return { user, loading, token, refreshUser, getUserId, setUser };
}
