import React, { useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = React.createContext();
// Funtion to help accessing the context inside the children components
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState();
    // loading will make sure the child components are not rendered before we know the current authentificatoin state of the user
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Call session() : check the current state of the user and update the user object
        const session = supabase.auth.session();

        setUser(session?.user ?? null); // fixe le user s'il y a une session, sinon null
        setLoading(false);

        // Listen for changes on auth state by subscribong to `supabase.auth.onAuthStateChange`
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        )

        // Nettoyage
        return () => {
            listener?.unsubscribe()
        }
    }, []);

    // Will be passed down to components
    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signIn(data),
        signOut: () => supabase.auth.signOut(),
        user,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
