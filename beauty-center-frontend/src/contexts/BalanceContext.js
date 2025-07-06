import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { balanceAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const BalanceContext = createContext();

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalance must be used within a BalanceProvider');
    }
    return context;
};

export const BalanceProvider = ({ children }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Debug user state
    console.log('BalanceProvider - User state:', {
        user: user,
        isAuthenticated: !!user,
        role: user?.role,
        shouldFetchBalance: !!user && user.role === 'CUSTOMER'
    });

    // Fetch balance using React Query
    const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance, error: balanceError } = useQuery(
        ['balance'],
        balanceAPI.getBalance,
        {
            enabled: !!user && user.role === 'CUSTOMER',
            select: (response) => response.data.balance,
            onError: (error) => {
                console.error('Error fetching balance:', error);
                console.error('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    message: error.message
                });
                toast.error('Échec de la récupération du solde');
            }
        }
    );

    // Fetch transactions using React Query
    const { data: transactionsData, refetch: refetchTransactions } = useQuery(
        ['balance-transactions'],
        balanceAPI.getTransactions,
        {
            enabled: !!user && user.role === 'CUSTOMER',
            select: (response) => response.data,
            onError: (error) => {
                console.error('Error fetching transactions:', error);
            }
        }
    );

    const refreshBalance = () => {
        refetchBalance();
        refetchTransactions();
    };

    const formatBalance = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const value = {
        balance: balanceData || 0,
        transactions: transactionsData || [],
        loading: balanceLoading,
        refreshBalance,
        formatBalance
    };

    return (
        <BalanceContext.Provider value={value}>
            {children}
        </BalanceContext.Provider>
    );
};