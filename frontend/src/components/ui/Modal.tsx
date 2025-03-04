import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message?: string;
    children?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, onConfirm, title, message, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                {message && <p className="text-gray-600 mb-6">{message}</p>}
                {children}
                <div className="flex justify-end gap-3">
                    <button className="bg-transparent hover:bg-gray-200 text-gray-900 font-bold py-2 px-4 rounded" onClick={onClose}>
                        Annuler
                    </button>
                    {onConfirm && (
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={onConfirm}>
                            Supprimer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
