"use client"

import { useUser } from '@clerk/nextjs';
import React, { useEffect } from 'react'


function Provider({
    children,
    }: Readonly<{
        children: React.ReactNode;
    }>) 
    {
        const { user, isLoaded } = useUser();
        useEffect(() => {
            if (!isLoaded || !user) return;

            const syncKey = `user-synced:${user.id}`;
            if (sessionStorage.getItem(syncKey)) return;

            const controller = new AbortController();
            fetch('/api/user', {
                method: 'POST',
                signal: controller.signal,
            })
                .then((response) => {
                    if (!response.ok) throw new Error('Failed to sync user');
                    sessionStorage.setItem(syncKey, 'true');
                })
                .catch((error) => {
                    if (error instanceof DOMException && error.name === 'AbortError') return;
                    console.error(error);
                });

            return () => controller.abort();
        }, [isLoaded, user?.id]);

        return (
            <div>
                {children}
            </div>
        )
    }



export default Provider

