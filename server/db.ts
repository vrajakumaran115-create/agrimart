import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDbPath = path.join(process.cwd(), "agri_marketplace.db");
const dbPath = process.env.SQLITE_DB_PATH || (process.env.NODE_ENV === "production" ? path.join("/tmp", "agri_marketplace.db") : defaultDbPath);

let db: any;
try {
  db = new Database(dbPath);
  console.log("Database connected at:", dbPath);
} catch (err) {
  console.error("Database connection error:", err);
  throw err;
}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('seller', 'buyer', 'admin')) NOT NULL,
    location TEXT,
    post_count INTEGER DEFAULT 0,
    wallet_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category_id INTEGER,
    breed TEXT,
    age TEXT,
    price REAL NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    image TEXT,
    images TEXT,
    video TEXT,
    payment_status TEXT DEFAULT 'free',
    category_data TEXT,
    seller_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER,
    buyer_id INTEGER,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    listing_id INTEGER,
    amount REAL NOT NULL,
    payment_id TEXT,
    order_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id)
  );
`);

// Migrations
try {
  db.prepare("ALTER TABLE users ADD COLUMN post_count INTEGER DEFAULT 0").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE users ADD COLUMN wallet_balance REAL DEFAULT 0").run();
} catch (e) {}

// Seed categories if empty
const countCats = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (countCats.count === 0) {
  const insert = db.prepare("INSERT INTO categories (name) VALUES (?)");
  ["Home Animals", "Home Birds", "Theevanam", "Tools / Equipment"].forEach((name) => {
    insert.run(name);
  });
}

// Seed default users for testing
const countUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (countUsers.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, phone, email, password, role, location) VALUES (?, ?, ?, ?, ?, ?)")
    .run("System Admin", "1234567890", "admin@agri.com", hashedPassword, "admin", "Delhi");
    
  const sellerPass = bcrypt.hashSync("seller123", 10);
  db.prepare("INSERT INTO users (name, phone, email, password, role, location) VALUES (?, ?, ?, ?, ?, ?)")
    .run("Farmer Ramesh", "9876543210", "seller@agri.com", sellerPass, "seller", "Bhopal");

  const buyerPass = bcrypt.hashSync("buyer123", 10);
  db.prepare("INSERT INTO users (name, phone, email, password, role, location) VALUES (?, ?, ?, ?, ?, ?)")
    .run("Customer Suresh", "8877665544", "buyer@agri.com", buyerPass, "buyer", "Mumbai");
}

export default db;

