import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Rank, RANKS } from '../types';

// Storing password here is not secure for a real app, but fine for this simulation.
interface StoredUser extends User {
  passwordHash: string; // In a real app, never store plain text passwords
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (username: string, password: string) => Promise<void>;
  updateUserPoints: (amount: number) => Promise<void>;
  incrementViolationCount: () => Promise<{ rankedUp: boolean; newRank: Rank | null; pointsAwarded: number }>;
}

// Calculate rank based on violation count
const calculateRank = (violationCount: number): Rank => {
  if (violationCount >= 20) return 'gold';
  if (violationCount >= 15) return 'silver';
  if (violationCount >= 10) return 'bronze';
  if (violationCount >= 5) return 'iron';
  return 'dirt';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple hashing function for demonstration.
// In a real-world scenario, use a robust library like bcrypt.
const simpleHash = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const SESSION_STORAGE_KEY = 'trafficai-session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const getUsersFromStorage = (): StoredUser[] => {
    try {
      const users = localStorage.getItem('trafficai-users');
      return users ? JSON.parse(users) : [];
    } catch (e) {
      return [];
    }
  };

  const saveUsersToStorage = (users: StoredUser[]) => {
    localStorage.setItem('trafficai-users', JSON.stringify(users));
  };

  // Restore session on mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionData) {
          const sessionUser = JSON.parse(sessionData);
          const users = getUsersFromStorage();
          const foundUser = users.find(u => u.username.toLowerCase() === sessionUser.username.toLowerCase());
          
          if (foundUser) {
            const userRank = foundUser.rank || calculateRank(foundUser.violationCount || 0);
            const violationCount = foundUser.violationCount || 0;
            setUser({
              username: foundUser.username,
              points: foundUser.points,
              rank: userRank,
              violationCount: violationCount
            });
          } else {
            // Session user not found, clear session
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    };

    restoreSession();
  }, []);

  const signup = async (username: string, password: string): Promise<void> => {
    const users = getUsersFromStorage();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error("Username already exists.");
    }
    const passwordHash = await simpleHash(password);
    const newUser: StoredUser = { 
      username, 
      points: 50, 
      rank: 'dirt',
      violationCount: 0,
      passwordHash 
    };
    saveUsersToStorage([...users, newUser]);
    const newUserData = { username, points: 50, rank: 'dirt' as Rank, violationCount: 0 };
    setUser(newUserData);
    // Save session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUserData));
  };


  const login = async (username: string, password: string): Promise<void> => {
    const users = getUsersFromStorage();
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    const passwordHash = await simpleHash(password);
    
    if (foundUser && foundUser.passwordHash === passwordHash) {
        // Ensure user has rank and violationCount (for backward compatibility)
        const userRank = foundUser.rank || calculateRank(foundUser.violationCount || 0);
        const violationCount = foundUser.violationCount || 0;
        const userData = { 
          username: foundUser.username, 
          points: foundUser.points,
          rank: userRank,
          violationCount: violationCount
        };
        setUser(userData);
        // Save session
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
    } else {
        throw new Error("Invalid username or password.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateUserPoints = async (amount: number): Promise<void> => {
    if (!user) return;

    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());

    if (userIndex > -1) {
        const newPoints = users[userIndex].points + amount;
        users[userIndex].points = newPoints;
        saveUsersToStorage(users);
        const updatedUser = { ...user, points: newPoints };
        setUser(updatedUser);
        // Update session
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
    } else {
        throw new Error("Could not find user to update points.");
    }
  };

  const incrementViolationCount = async (): Promise<{ rankedUp: boolean; newRank: Rank | null; pointsAwarded: number }> => {
    if (!user) {
      return { rankedUp: false, newRank: null, pointsAwarded: 0 };
    }

    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());

    if (userIndex === -1) {
      throw new Error("Could not find user to update violation count.");
    }

    const currentViolationCount = users[userIndex].violationCount || 0;
    const newViolationCount = currentViolationCount + 1;
    const oldRank = users[userIndex].rank || calculateRank(currentViolationCount);
    const newRank = calculateRank(newViolationCount);
    
    const rankedUp = newRank !== oldRank;
    let pointsAwarded = 0;

    // Update violation count
    users[userIndex].violationCount = newViolationCount;
    users[userIndex].rank = newRank;

    // If ranked up, award 10 points
    if (rankedUp) {
      pointsAwarded = 10;
      users[userIndex].points = (users[userIndex].points || 0) + pointsAwarded;
    }

    saveUsersToStorage(users);
    const updatedUser = {
      username: users[userIndex].username,
      points: users[userIndex].points,
      rank: newRank,
      violationCount: newViolationCount
    };
    setUser(updatedUser);
    // Update session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));

    return { rankedUp, newRank: rankedUp ? newRank : null, pointsAwarded };
  };

  return React.createElement(AuthContext.Provider, { value: { user, login, logout, signup, updateUserPoints, incrementViolationCount } }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};