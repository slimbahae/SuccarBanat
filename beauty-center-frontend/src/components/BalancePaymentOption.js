import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { useBalance } from '../contexts/BalanceContext';

const BalancePaymentOption = ({ total, selectedPayment, onPaymentSelect }) => {
    const { balance, formatBalance } = useBalance();
    const hasInsufficientBalance = balance < total;

    return (
        <div className="space-y-4">
            <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPayment === 'BALANCE'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !hasInsufficientBalance && onPaymentSelect('BALANCE')}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                            <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Payer avec le solde</p>
                            <p className="text-sm text-gray-600">
                                Disponible: {formatBalance(balance)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {hasInsufficientBalance && (
                            <div className="flex items-center space-x-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Insuffisant</span>
                            </div>
                        )}

                        <input
                            type="radio"
                            name="paymentMethod"
                            value="BALANCE"
                            checked={selectedPayment === 'BALANCE'}
                            onChange={() => onPaymentSelect('BALANCE')}
                            disabled={hasInsufficientBalance}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                    </div>
                </div>

                {hasInsufficientBalance && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            Il vous manque {formatBalance(total - balance)} pour finaliser cet achat.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalancePaymentOption;