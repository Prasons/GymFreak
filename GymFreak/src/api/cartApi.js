// Dummy product data for cart
const products = [
  {
    id: '1',
    name: 'Protein Powder',
    price: 49.99,
    image: 'https://via.placeholder.com/100?text=Protein+Powder',
    stock: 50
  },
  {
    id: '2',
    name: 'Yoga Mat',
    price: 29.99,
    image: 'https://via.placeholder.com/100?text=Yoga+Mat',
    stock: 30
  },
  {
    id: '3',
    name: 'Resistance Bands Set',
    price: 24.99,
    image: 'https://via.placeholder.com/100?text=Resistance+Bands',
    stock: 45
  }
];

// User's cart data
let userCart = [
  {
    id: 'cart1',
    product_id: '1',
    quantity: 2,
    added_at: new Date().toISOString()
  },
  {
    id: 'cart2',
    product_id: '2',
    quantity: 1,
    added_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// Simulate API delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 300);
  });
};

// Get cart items with full product details
export const getCartItems = async () => {
  const cartWithProducts = userCart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.product_id);
    return {
      ...cartItem,
      product: product ? { ...product } : null
    };
  });
  
  return simulateApiCall({
    items: cartWithProducts,
    total_items: userCart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cartWithProducts.reduce(
      (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
      0
    )
  });
};

// Add item to cart or update quantity if already exists
export const addToCart = async (product_id, quantity = 1) => {
  const existingItem = userCart.find(item => item.product_id === product_id);
  
  if (existingItem) {
    // Update quantity if item exists
    existingItem.quantity += parseInt(quantity, 10);
  } else {
    // Add new item to cart
    userCart.push({
      id: `cart${Date.now()}`,
      product_id,
      quantity: parseInt(quantity, 10),
      added_at: new Date().toISOString()
    });
  }
  
  return getCartItems();
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  const initialLength = userCart.length;
  userCart = userCart.filter(item => item.id !== cartItemId);
  
  if (userCart.length === initialLength) {
    throw new Error('Item not found in cart');
  }
  
  return getCartItems();
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
  const item = userCart.find(item => item.id === cartItemId);
  if (!item) throw new Error('Item not found in cart');
  
  const newQuantity = parseInt(quantity, 10);
  if (isNaN(newQuantity) || newQuantity < 1) {
    throw new Error('Invalid quantity');
  }
  
  item.quantity = newQuantity;
  return getCartItems();
};

// Clear the entire cart
export const clearCart = async () => {
  userCart = [];
  return simulateApiCall({ success: true, message: 'Cart cleared' });
};
