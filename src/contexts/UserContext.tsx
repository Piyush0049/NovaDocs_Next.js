"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '@/app/api/models/user';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    filesCount: number;
    memberSince: string;
    lastUpdated: string;
}

interface UserContextType {
    user: IUser | null;
    loading: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    clearProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load profile from localStorage on initial mount
    useEffect(() => {
        const cachedProfile = localStorage.getItem('user-profile');
        if (cachedProfile) {
            try {
                const parsed = JSON.parse(cachedProfile);
                // Check if cache is less than 5 minutes old
                if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                    setUser(parsed.data);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.error('Error parsing cached profile:', e);
            }
        }

        // If no valid cache, fetch from API
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get("/api/user/me", {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            console.log("Response:", response);

            // ✅ Axios puts the parsed data directly in response.data
            const data = response.data;

            if (!response.status || response.status >= 400) {
                throw new Error(data.error || "Failed to fetch profile");
            }

            if (data.success && data.user) {
                setUser(data.user);

                // Cache profile data with timestamp
                localStorage.setItem(
                    "user-profile",
                    JSON.stringify({
                        data: data.user,
                        timestamp: Date.now(),
                    })
                );
            }
        } catch (err: any) {
            console.error("Profile fetch error:", err);
            setError(err.message);
            // Clear invalid cache
            localStorage.removeItem("user-profile");
        } finally {
            setLoading(false);
        }
    };


    const clearProfile = () => {
        setUser(null);
        setError(null);
        localStorage.removeItem('user-profile');
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            error,
            fetchProfile,
            clearProfile
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
