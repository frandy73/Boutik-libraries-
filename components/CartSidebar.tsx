import React, { useState } from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ShoppingBag, X, MessageCircle, AlertCircle } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const PHONE_NUMBER = "50936620118";
// Placeholder SVG representing a BOOK
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E";

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove 
}) => {
  const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setShowCheckoutConfirmation(true);
  };

  const executeWhatsAppRedirect = () => {
    let message = `*NOUVELLE COMMANDE - BOUTIK PAW (Librairie)*\n\n`;
    items.forEach(item => {
      const priceDisplay = item.price > 0 ? `${item.price.toLocaleString('fr-HT')} HTG` : "Sur Devis";
      message += `📚 ${item.quantity}x ${item.description}\n   Prix: ${priceDisplay}\n`;
    });
    message += `\n*TOTAL: ${total.toLocaleString('fr-HT')} HTG*\n`;
    message += `_(+ Articles sur devis éventuels)_\n\n`;
    message += `_Merci de m'envoyer les fichiers / le lien de téléchargement._`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
    
    setShowCheckoutConfirmation(false);
    window.open(url, '_blank');
  };

  const confirmRemoval = () => {
    if (itemToRemove) {
      onRemove(itemToRemove);
      setItemToRemove(null);
    }
  };

  return (
    <>
      {/* Main Overlay for Sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" />
              <h2 className="font-bold text-slate-800">Votre Panier de Livres</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                <p>Votre panier est vide.</p>
                <p className="text-sm mt-2">Ajoutez des eBooks pour commencer votre lecture.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="w-12 h-16 rounded-sm bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                    <img 
                      src={item.imageUrl || PLACEHOLDER_IMAGE} 
                      alt={item.description} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight">{item.description}</h4>
                      <p className={`text-xs mt-1 ${item.price === 0 ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                        {item.price === 0 ? "Sur Devis / Recherche" : `${item.price} HTG`}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button 
                        onClick={() => setItemToRemove(item.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        aria-label="Supprimer l'article"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500">Total</span>
              <span className="text-xl font-bold text-slate-900">{total.toLocaleString('fr-HT')} HTG</span>
            </div>
            <button
              onClick={handleCheckoutClick}
              disabled={items.length === 0}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all ${
                items.length === 0 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-whatsapp hover:bg-whatsappHover shadow-lg hover:shadow-xl active:scale-95'
              }`}
            >
              Commander sur WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {showCheckoutConfirmation && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowCheckoutConfirmation(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-whatsapp mb-4">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmer la commande</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Voulez-vous vraiment passer la commande via WhatsApp ?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowCheckoutConfirmation(false)} 
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeWhatsAppRedirect} 
                  className="flex-1 px-4 py-2.5 bg-whatsapp text-white font-medium rounded-xl hover:bg-whatsappHover shadow-md transition-all active:scale-95"
                >
                  Commander
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToRemove && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setItemToRemove(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Êtes-vous sûr ?</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Voulez-vous vraiment retirer cet article de votre panier ?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setItemToRemove(null)} 
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmRemoval} 
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 shadow-md transition-all active:scale-95"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartSidebar;