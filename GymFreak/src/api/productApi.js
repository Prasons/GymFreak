// Dummy data for products
let products = [
  {
    id: '1',
    name: 'Protein Powder',
    description: 'Whey protein isolate with 30g protein per serving',
    price: 49.99,
    category: 'Supplements',
    stock: 50,
    image: 'https://via.placeholder.com/300x300?text=Protein+Powder'
  },
  {
    id: '2',
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat for all types of workouts',
    price: 29.99,
    category: 'Equipment',
    stock: 30,
    image: 'https://via.placeholder.com/300x300?text=Yoga+Mat'
  },
  {
    id: '3',
    name: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands with different tension levels',
    price: 24.99,
    category: 'Equipment',
    stock: 45,
    image: 'https://via.placeholder.com/300x300?text=Resistance+Bands'
  }
];

// Simulate API delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 500);
  });
};

export const getProducts = async () => {
  return simulateApiCall([...products]);
};

export const getProduct = async (id) => {
  const product = products.find(p => p.id === id);
  if (!product) throw new Error('Product not found');
  return simulateApiCall({ ...product });
};

export const createProduct = async (productData) => {
  const newProduct = {
    ...productData,
    id: Date.now().toString(),
    price: parseFloat(productData.price) || 0,
    stock: parseInt(productData.stock) || 0,
    image: productData.image || 'https://via.placeholder.com/300x300?text=No+Image'
  };
  products.unshift(newProduct);
  return simulateApiCall({ ...newProduct });
};

export const deleteProduct = async (id) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  const [deletedProduct] = products.splice(index, 1);
  return simulateApiCall({ success: true, deletedProduct });
};

export const updateProduct = async (id, updates) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  
  products[index] = { 
    ...products[index], 
    ...updates,
    price: updates.price ? parseFloat(updates.price) : products[index].price,
    stock: updates.stock !== undefined ? parseInt(updates.stock) : products[index].stock
  };
  
  return simulateApiCall({ ...products[index] });
};
