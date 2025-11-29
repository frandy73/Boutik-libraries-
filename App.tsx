import React, { useState, useEffect } from 'react';
import { Product, CartItem, Message, AppView } from './types';
import { fetchProducts, searchProductsLocal } from './services/data';
import { parseUserMessage } from './services/geminiService';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import ChatInterface from './components/ChatInterface';
import { LayoutGrid, MessageSquare, ShoppingCart, Search, Loader2, BookOpen, Filter } from 'lucide-react';

const App: React.FC = () => {
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  // App State
  // Initialiser le panier depuis le localStorage si disponible
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('boutik_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout');
  
  // Chat State
  // Initialiser les messages depuis le localStorage si disponible
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('boutik_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Erreur de chargement du catalogue:", error);
      } finally {
        setIsCatalogLoading(false);
      }
    };
    loadData();
  }, []);

  // Persistance : Sauvegarder le panier à chaque changement
  useEffect(() => {
    localStorage.setItem('boutik_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persistance : Sauvegarder les messages à chaque changement
  useEffect(() => {
    localStorage.setItem('boutik_messages', JSON.stringify(messages));
  }, [messages]);

  // Cart Logic
  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    // Open cart feedback
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Chat Logic with Fallback
  const handleSendMessage = async (text: string) => {
    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      // 1. Try Gemini AI
      const aiResponse = await parseUserMessage(text, products);
      
      let replyContent = aiResponse.message || "J'ai traité votre demande.";
      const relatedProducts: Product[] = [];
      
      if (aiResponse.intent === 'UNKNOWN') {
         // Fallback logic handled below in catch/finally-like flow
         throw new Error("Intent unknown, triggering fallback");
      }

      // Process Items from AI
      if (aiResponse.items && aiResponse.items.length > 0) {
        aiResponse.items.forEach(item => {
          
          if (aiResponse.intent === 'SPECIAL_REQUEST') {
            // Create a dynamic "Special Request" product
            const specialProduct: Product = {
              id: `special-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              code: 'SPEC-CMD',
              description: `Commande Spéciale : ${item.productCode}`,
              price: 0, // 0 indicates "On Quote" / "Sur Devis"
              category: 'Sur Commande',
              imageUrl: '', // Will use placeholder
              summary: 'Ce livre n\'est pas en stock, nous allons le chercher pour vous.'
            };
            addToCart(specialProduct, item.quantity);
            relatedProducts.push(specialProduct);
          } else {
            // Normal ADD_TO_CART logic
            const product = products.find(p => p.code === item.productCode);
            if (product) {
              addToCart(product, item.quantity);
              relatedProducts.push(product);
            }
          }
        });
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
        relatedProducts: relatedProducts.length > 0 ? relatedProducts : undefined
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.log("AI Failed or Unknown Intent, using Local Fallback");
      
      // 2. Fallback: Simple Local Search
      const matches = searchProductsLocal(text, products);
      
      let fallbackMessage = "";
      let foundProducts: Product[] = [];

      if (matches.length > 0) {
        if (matches.length === 1) {
           const product = matches[0];
           // Don't show summary in text if we are showing the card
           fallbackMessage = `J'ai trouvé "${product.description}". Je l'ajoute au panier pour vous ?`;
           foundProducts = [product];
        } else {
           fallbackMessage = `J'ai trouvé ${matches.length} livres correspondant à votre recherche.`;
           foundProducts = matches.slice(0, 3);
        }
      } else {
        fallbackMessage = "Je n'ai pas trouvé ce livre dans le catalogue immédiat, mais essayez de reformuler votre demande ou contactez-nous directement sur WhatsApp.";
      }

      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date(),
        relatedProducts: foundProducts.length > 0 ? foundProducts : undefined
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered products for Catalog View
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tout' || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter pills
  const categories = ['Tout', ...Array.from(new Set(products.map(p => p.category)))];

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Loading Screen
  if (isCatalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-indigo-900">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-bounce">
          <BookOpen size={32} />
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" />
          <span>Ouverture de la librairie...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Mobile/Tablet Nav Sidebar */}
      <div className="hidden md:flex flex-col w-20 bg-white border-r border-slate-200 items-center py-6 gap-6 z-20">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
          BP
        </div>
        <div className="flex flex-col w-full gap-2 px-2">
          <button 
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`p-3 rounded-xl transition-all ${currentView === AppView.CHAT ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
            title="Assistant Chat"
          >
            <MessageSquare size={24} />
          </button>
          <button 
            onClick={() => setCurrentView(AppView.CATALOG)}
            className={`p-3 rounded-xl transition-all ${currentView === AppView.CATALOG ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
            title="Catalogue Produit"
          >
            <LayoutGrid size={24} />
          </button>
        </div>
        <div className="mt-auto">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
            title="Voir le panier"
          >
            <ShoppingCart size={24} />
            {cartTotalItems > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-10 shrink-0">
          <div className="font-bold text-indigo-900 text-lg">BOUTIK PAW</div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentView(v => v === AppView.CHAT ? AppView.CATALOG : AppView.CHAT)}
              className="p-2 bg-slate-50 rounded-lg text-slate-600"
            >
              {currentView === AppView.CHAT ? <LayoutGrid size={20} /> : <MessageSquare size={20} />}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 bg-slate-50 rounded-lg text-slate-600 relative"
            >
              <ShoppingCart size={20} />
              {cartTotalItems > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* CATALOG VIEW */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${currentView === AppView.CATALOG ? 'translate-x-0' : '-translate-x-full hidden'}`}>
             <div className="p-4 md:p-6 lg:p-8 overflow-y-auto h-full pb-20 scrollbar-hide">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bibliothèque</h1>
                    <p className="text-slate-500">Explorez nos {products.length} eBooks disponibles</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un livre..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
                    />
                  </div>
                </div>

                {/* CATEGORY FILTERS */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={addToCart} />
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p>Aucun livre trouvé pour "{searchQuery}"</p>
                      {selectedCategory !== 'Tout' && (
                        <button 
                          onClick={() => setSelectedCategory('Tout')}
                          className="mt-2 text-indigo-600 font-medium hover:underline"
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* CHAT VIEW */}
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${currentView === AppView.CHAT ? 'translate-x-0' : 'translate-x-full hidden'}`}>
            <ChatInterface 
              messages={messages} 
              isLoading={isAiLoading} 
              onSendMessage={handleSendMessage} 
            />
          </div>

        </div>
      </div>

      {/* Cart Drawer */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />

    </div>
  );
};

export default App;