import React from 'react';
import { Wallet, Plus, History } from 'lucide-react';
import { useBalance } from '../contexts/BalanceContext';
import { Link } from 'react-router-dom';

const BalanceDisplay = ({ showAddFunds = true, showHistory = true }) => {
    const { balance, formatBalance, loading } = useBalance();

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                <div className="animate-pulse">
                    <div className="flex items-center space-x-3">
                        <Wallet className="h-8 w-8" />
                        <div className="space-y-2">
                            <div className="h-4 bg-white/30 rounded w-24"></div>
                            <div className="h-6 bg-white/30 rounded w-32"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Wallet className="h-8 w-8" />
                    <div>
                        <p className="text-purple-100 text-sm font-medium">Votre Solde</p>
                        <p className="text-2xl font-bold">{formatBalance(balance)}</p>
                    </div>
                </div>

                <div className="flex space-x-2">
                    {showAddFunds && (
                        <Link
                            to="/customer/balance/add-funds"
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Ajouter des fonds</span>
                        </Link>
                    )}

                    {showHistory && (
                        <Link
                            to="/customer/balance/history"
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors"
                        >
                            <History className="h-4 w-4" />
                            <span>Historique</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceDisplay;