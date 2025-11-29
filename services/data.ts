import { Product } from '../types';

// ==================================================================================
// 📚 BASE DE DONNÉES LIBRAIRIE (SIMULATION)
// ==================================================================================

export const CATALOGUE_DB: Product[] = [
  {
    id: "b1",
    code: "FIN-001",
    description: "Père Riche Père Pauvre - R. Kiyosaki",
    price: 1500,
    category: "Finance & Business",
    imageUrl: "https://m.media-amazon.com/images/I/81bsw6fnUiL._SL1500_.jpg",
    summary: "Le livre de finances personnelles n°1 de tous les temps. Il brise le mythe selon lequel il faut gagner beaucoup d'argent pour devenir riche."
  },
  {
    id: "b2",
    code: "ROM-H01",
    description: "Gouverneurs de la Rosée - Jacques Roumain",
    price: 1000,
    category: "Littérature Haïtienne",
    imageUrl: "https://m.media-amazon.com/images/I/71pX+J4+tEL._SL1360_.jpg",
    summary: "Un chef-d'œuvre de la littérature haïtienne racontant le sacrifice de Manuel pour apporter l'eau et la réconciliation à son village déchiré."
  },
  {
    id: "b3",
    code: "DEV-001",
    description: "L'Alchimiste - Paulo Coelho",
    price: 1250,
    category: "Développement Personnel",
    imageUrl: "https://m.media-amazon.com/images/I/81tq5+2+22L._SL1500_.jpg",
    summary: "Une fable philosophique bouleversante sur l'écoute de son cœur et la poursuite de ses rêves à travers le voyage de Santiago."
  },
  {
    id: "b4",
    code: "BUS-002",
    description: "La Semaine de 4 Heures - Tim Ferriss",
    price: 1800,
    category: "Finance & Business",
    imageUrl: "https://m.media-amazon.com/images/I/71sCs4+z5LL._SL1500_.jpg",
    summary: "Le guide culte pour échapper à la routine métro-boulot-dodo, automatiser ses revenus et vivre mieux en travaillant moins."
  },
  {
    id: "b5",
    code: "PSY-001",
    description: "Les 48 Lois du Pouvoir - Robert Greene",
    price: 2000,
    category: "Psychologie",
    imageUrl: "https://m.media-amazon.com/images/I/611X8Gi7hpL._SL1500_.jpg",
    summary: "Une exploration machiavélique et historique des dynamiques du pouvoir, de la séduction et de la manipulation."
  },
  {
    id: "b6",
    code: "HIS-H02",
    description: "Les Jacobins Noirs - C.L.R. James",
    price: 2200,
    category: "Histoire",
    imageUrl: "https://m.media-amazon.com/images/I/81xY3x+2u+L._SL1500_.jpg",
    summary: "L'analyse historique magistrale de la Révolution haïtienne et du génie stratégique de Toussaint Louverture."
  },
  {
    id: "b7",
    code: "ROM-002",
    description: "1984 - George Orwell",
    price: 950,
    category: "Science-Fiction",
    imageUrl: "https://m.media-amazon.com/images/I/71kxa1-0mfL._SL1360_.jpg",
    summary: "Le roman dystopique de référence sur la surveillance totalitaire, la police de la pensée et la perte de liberté individuelle."
  },
  {
    id: "b8",
    code: "DEV-002",
    description: "Atomic Habits (Rien peut tout changer) - James Clear",
    price: 1650,
    category: "Développement Personnel",
    imageUrl: "https://m.media-amazon.com/images/I/81wgcld4wxL._SL1500_.jpg",
    summary: "Une méthode éprouvée pour construire de bonnes habitudes et briser les mauvaises grâce à de minuscules changements quotidiens."
  },
  {
    id: "b9",
    code: "TEC-001",
    description: "Le Design des objets du quotidien - Donald Norman",
    price: 1400,
    category: "Design & Tech",
    imageUrl: "https://m.media-amazon.com/images/I/61l+6-0y+rL._SL1500_.jpg",
    summary: "Pourquoi certains objets sont-ils faciles à utiliser et d'autres frustrants ? Une exploration fascinante de la psychologie du design."
  },
  {
    id: "b10",
    code: "JEUN-001",
    description: "Harry Potter à l'école des sorciers - J.K. Rowling",
    price: 1100,
    category: "Jeunesse",
    imageUrl: "https://m.media-amazon.com/images/I/81X4R7QhFkL._SL1500_.jpg",
    summary: "L'histoire magique qui a conquis le monde : un jeune orphelin découvre qu'il est un sorcier et rejoint l'école de Poudlard."
  },

  // 👇👇👇 ZONE D'AJOUT FACILE 👇👇👇
  // Copiez le bloc ci-dessous (de '{' à '},') et remplissez-le pour ajouter un livre :
  /*
  {
    id: "b_unique_11",                // Changez l'ID (ex: b11, b12...)
    code: "GENRE-001",                // Code unique du livre
    description: "Titre du Livre - Auteur",
    price: 1000,                      // Prix en HTG
    category: "Genre",                // Roman, Business, etc.
    imageUrl: "",                     // Laissez vide si pas d'image
    summary: "Résumé court du livre..."
  },
  */
];

// ==================================================================================
// SERVICES D'ACCÈS AUX DONNÉES
// ==================================================================================

/**
 * Simule un appel API asynchrone pour récupérer les produits.
 */
export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    // Simulation d'une latence réseau de 800ms
    setTimeout(() => {
      resolve(CATALOGUE_DB);
    }, 800);
  });
};

// Logique de recherche locale
export const searchProductsLocal = (query: string, products: Product[]): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.description.toLowerCase().includes(lowerQuery) || 
    p.category.toLowerCase().includes(lowerQuery) ||
    p.code.toLowerCase().includes(lowerQuery)
  );
};

export const findBestMatch = (query: string, products: Product[]): Product | null => {
  const matches = searchProductsLocal(query, products);
  return matches.length > 0 ? matches[0] : null;
}