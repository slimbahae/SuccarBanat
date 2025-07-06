import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Gift, CreditCard } from 'lucide-react';
import { useBalance } from '../../contexts/BalanceContext';
import BalanceDisplay from '../../components/BalanceDisplay';
import { Link } from 'react-router-dom';

const BalanceHistory = () => {
    const { transactions, formatBalance } = useBalance();

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'CREDIT':
                return <ArrowUpRight className="h-5 w-5 text-green-500" />;
            case 'DEBIT':
                return <ArrowDownLeft className="h-5 w-5 text-red-500" />;
            case 'REFUND':
                return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
            case 'GIFT_CARD_REDEEM':
                return <Gift className="h-5 w-5 text-purple-500" />;
            default:
                return <CreditCard className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'CREDIT':
            case 'REFUND':
            case 'GIFT_CARD_REDEEM':
                return 'text-green-600';
            case 'DEBIT':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Historique du Solde</h1>
                <Link
                    to="/customer/giftcard-redeem"
                    className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors font-medium shadow"
                >
                    <Gift className="h-5 w-5 mr-2" />
                    Utiliser une carte cadeau
                </Link>
            </div>

            <BalanceDisplay />

            <div className="bg-white shadow-sm rounded-lg">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Historique des Transactions</h2>
                </div>

                <div className="divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Aucune transaction pour le moment
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <div key={transaction.id || transaction._id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {getTransactionIcon(transaction.transactionType)}
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {transaction.description}
                                            </p>
                                            {transaction.transactionType === 'DEBIT' && transaction.orderId && (
                                                <p className="text-xs text-blue-700 mt-1">
                                                    <Link to={`/customer/orders/${transaction.orderId}`} className="underline hover:text-blue-900">
                                                        Commande n°: {transaction.orderId}
                                                    </Link>
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-500">
                                                {formatDate(transaction.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-medium ${getTransactionColor(transaction.transactionType)}`}>
                                            {transaction.transactionType === 'DEBIT' ? '-' : '+'}
                                            {formatBalance(transaction.amount)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Solde: {formatBalance(transaction.balanceAfter)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceHistory;