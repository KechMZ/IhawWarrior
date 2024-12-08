const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

// Create an instance of the Express app
const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Parse incoming requests with JSON payload
app.use(express.json());

// MySQL connection pool - Connect to XAMPP MySQL
const db = mysql.createPool({
  host: 'localhost',    
  user: 'root',         
  password: '',         
  database: 'ihawwarriors', 
  port: 3306            
});

// Serve the main HTML page at the root URL
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Ihaw Warriors!</h1><p>API is running at /api/products and /api/cart</p>');
});

// Get all products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get all cart items
app.get('/api/cart', (req, res) => {
  db.query(`
    SELECT cart.id, products.name, products.price, cart.quantity 
    FROM cart 
    JOIN products ON cart.product_id = products.id
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add an item to the cart
app.post('/api/cart', (req, res) => {
  const { product_id, quantity } = req.body;

  db.query('INSERT INTO cart (product_id, quantity) VALUES (?, ?)', [product_id, quantity], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Item added to cart' });
  });
});

// Process the order (Place Order)
app.post('/placeOrder', (req, res) => {
  const { cart, totalPrice, userId } = req.body;

  // Ensure the cart is not empty
  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty!' });
  }

  // Get a connection from the pool
  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to get database connection' });
    }

    // Start a transaction using the connection
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ success: false, message: 'Transaction failed' });
      }

      // Insert the order into the orders table (assuming you have a field 'order_number' for custom order numbers)
      const orderQuery = 'INSERT INTO orders (user_id, total_price, order_number) VALUES (?, ?, ?)';
      const orderNumber = 'ORD-' + Date.now();  // A simple example of a custom order number based on timestamp

      connection.query(orderQuery, [userId, totalPrice, orderNumber], (err, result) => {
        if (err) {
          connection.rollback(() => {
            connection.release();
            return res.status(500).json({ success: false, message: 'Failed to place order' });
          });
        }

        const orderId = result.insertId; // Get the inserted order's ID

        // Insert the order items into the order_items table
        const itemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        const orderItems = cart.map(item => [orderId, item.id, item.quantity, item.price]);

        connection.query(itemsQuery, [orderItems], (err, result) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              return res.status(500).json({ success: false, message: 'Failed to place order items' });
            });
          }

          // Commit the transaction
          connection.commit((err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                return res.status(500).json({ success: false, message: 'Failed to commit transaction' });
              });
            }

            // Release the connection and send success response
            connection.release();
            res.json({ success: true, message: 'Order placed successfully', orderId: orderId });
          });
        });
      });
    });
  });
});



// Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the email already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
    [username, email, hashedPassword], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password with hashed password
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', userId: user.id });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// Assuming you have a database model for orders
app.get('/getOrders', (req, res) => {
  // This is an example; replace with actual database query logic
  const orders = [
      { orderId: 1, items: [{ name: 'Skewers', quantity: 2 }, { name: 'Rice', quantity: 1 }], totalPrice: 300 },
      { orderId: 2, items: [{ name: 'BBQ', quantity: 1 }, { name: 'Soup', quantity: 2 }], totalPrice: 250 }
  ];
  
  res.json(orders);
});
