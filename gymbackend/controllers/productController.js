import pool from "../config/db.js";

// Add a product
export const addProduct = async (req, res) => {
  console.log('=== REQUEST BODY ===', req.body);
  console.log('=== REQUEST FILES ===', req.file);
  console.log('=== REQUEST HEADERS ===', req.headers);
  console.log('=== REQUEST CONTENT TYPE ===', req.get('Content-Type'));
  console.log('=== MULTIPART FIELDS ===', req.body); // This will show form fields if using multer properly
  
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: false,
        message: 'Please upload an image file' 
      });
    }

    const { name, description, price, category, stock_quantity } = req.body;
    
    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['name', 'description', 'price', 'category', 'image'],
        received: { name, description, price, category, hasImage: !!req.file }
      });
    }

    // Parse price to number
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // Prepare image path
    const imagePath = `/uploads/${req.file.filename}`;
    
    console.log('Attempting to insert product with:', {
      name,
      description,
      price: priceValue,
      category,
      stock_quantity: stock_quantity || 10,
      image_url: imagePath
    });

    // Get the admin ID from the authenticated admin
    const adminId = req.user?.id;
    
    if (!adminId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action. Please log in as an admin.'
      });
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO products 
       (name, description, price, category, stock_quantity, image_url, created_by, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       RETURNING *`,
      [
        name,
        description,
        priceValue,
        category,
        parseInt(stock_quantity) || 10,
        imagePath,
        adminId
      ]
    );

    if (!result.rows[0]) {
      throw new Error('Failed to create product');
    }

    console.log('Product created successfully:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: result.rows[0]
    });
    
  } catch (error) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        detail: error.detail,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
// Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
