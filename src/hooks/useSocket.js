/**
 * Socket.IO hook for real-time chat communication
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_ORIGIN } from '../constants';

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL
    || API_ORIGIN;

export function useSocket(enabled = true) {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    useEffect(() => {
        if (!enabled) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            setConnectionStatus('connected');
        });

        socket.on('disconnect', () => {
            setConnected(false);
            setConnectionStatus('disconnected');
        });

        socket.on('connect_error', () => {
            setConnectionStatus('error');
        });

        socket.on('reconnecting', () => {
            setConnectionStatus('reconnecting');
        });

        socket.on('reconnect', () => {
            setConnected(true);
            setConnectionStatus('connected');
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [enabled]);

    const emit = useCallback((event, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        }
    }, []);

    const on = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    }, []);

    const off = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    }, []);

    return {
        connected,
        connectionStatus,
        emit,
        on,
        off,
    };
}
