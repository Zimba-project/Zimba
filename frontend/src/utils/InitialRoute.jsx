// utils/InitialRoute.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import useCurrentUser from "./GetUser";
import { useEffect, useState } from "react";

/**
 * Hook to determine the initial route for the app.
 * Returns null while loading, then either "Welcome" or "Main".
 */
export default function useInitialRoute() {
  const { user, loading: userLoading } = useCurrentUser();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    async function loadRoute() {
      const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");

      if (user) {
        setInitialRoute("Main"); // user logged in
      } else if (hasSeenWelcome === "true") {
        setInitialRoute("Main"); // user bypassed Welcome
      } else {
        setInitialRoute("Welcome"); // first-time user
      }
    }

    if (!userLoading) {
      loadRoute();
    }
  }, [userLoading, user]);

  return initialRoute; // null while loading
}
