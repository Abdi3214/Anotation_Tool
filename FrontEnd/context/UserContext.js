"use client";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [completedAnnotations, setCompletedAnnotations] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

  // Load user & theme from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.completedAnnotations)
        setCompletedAnnotations(parsed.completedAnnotations);
      if (parsed.pendingReviews) setPendingReviews(parsed.pendingReviews);
    }
  }, []);

 
  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        completedAnnotations,
        setCompletedAnnotations,
        pendingReviews,
        setPendingReviews
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useStore = () => useContext(UserContext);
