import { Request, Response } from "express";
import db from "../db.ts";
import { AuthRequest } from "../middleware/auth.ts";
import path from "path";
import fs from "fs";

import { LISTING_PRICE } from "../../constants.ts";

export const getListings = (req: Request, res: Response) => {
  const { category, search } = req.query;
  let query = `
    SELECT l.*, c.name as category_name, u.name as seller_name, u.phone as seller_phone
    FROM listings l
    JOIN categories c ON l.category_id = c.id
    JOIN users u ON l.seller_id = u.id
    WHERE (l.payment_status = 'free' OR l.payment_status = 'paid')
  `;
  const params: any[] = [];

  if (category) {
    if (!isNaN(Number(category))) {
      query += " AND l.category_id = ?";
      params.push(category);
    } else {
      const catMap: { [key: string]: string } = {
        "animals": "Home Animals",
        "birds": "Home Birds",
        "feed": "Theevanam",
        "tools": "Tools / Equipment"
      };
      const searchName = catMap[category.toString().toLowerCase()] || category;
      query += " AND (c.name = ? OR c.name LIKE ?)";
      params.push(searchName, `%${searchName}%`);
    }
  }

  if (search) {
    query += " AND (l.title LIKE ? OR l.description LIKE ? OR l.location LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += " ORDER BY l.created_at DESC";

  try {
    const listings = db.prepare(query).all(...params);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings" });
  }
};

export const getListingById = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const listing = db.prepare(`
      SELECT l.*, c.name as category_name, u.name as seller_name, u.phone as seller_phone, u.location as seller_location
      FROM listings l
      JOIN categories c ON l.category_id = c.id
      JOIN users u ON l.seller_id = u.id
      WHERE l.id = ?
    `).get(id) as any;

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    // Parse JSON fields
    if (listing.images) {
      try {
        listing.images = JSON.parse(listing.images);
      } catch (e) {
        listing.images = [];
      }
    }
    if (listing.category_data) {
      try {
        listing.category_data = JSON.parse(listing.category_data);
      } catch (e) {
        listing.category_data = {};
      }
    }
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listing" });
  }
};

export const createListing = (req: AuthRequest, res: Response) => {
  const { title, category_id, breed, age, price, location, description, category_data } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  const images = files?.images ? JSON.stringify(files.images.map(f => `/uploads/${f.filename}`)) : "[]";
  const video = files?.video ? `/uploads/${files.video[0].filename}` : null;
  const seller_id = req.user?.id;

  try {
    const user = db.prepare("SELECT post_count FROM users WHERE id = ?").get(seller_id) as any;
    const payment_status = user.post_count >= 3 ? "pending" : "free";

    const result = db.prepare(`
      INSERT INTO listings (title, category_id, breed, age, price, location, description, images, video, payment_status, category_data, seller_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, category_id, breed, age, price, location, description, images, video, payment_status, category_data, seller_id);

    if (payment_status === "free") {
      db.prepare("UPDATE users SET post_count = post_count + 1 WHERE id = ?").run(seller_id);
    }

    res.status(201).json({ 
      message: payment_status === "pending" ? "Listing submitted, payment required" : "Listing created successfully", 
      id: result.lastInsertRowid,
      payment_required: payment_status === "pending"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating listing" });
  }
};

export const simulatePayment = (req: AuthRequest, res: Response) => {
  const { listing_id } = req.body;
  const seller_id = req.user?.id;

  try {
    const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(listing_id) as any;
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller_id !== seller_id) return res.status(403).json({ message: "Unauthorized" });

    db.prepare("UPDATE listings SET payment_status = 'paid' WHERE id = ?").run(listing_id);
    db.prepare("UPDATE users SET post_count = post_count + 1 WHERE id = ?").run(seller_id);
    db.prepare("INSERT INTO payments (user_id, listing_id, amount) VALUES (?, ?, ?)").run(seller_id, listing_id, LISTING_PRICE / 100);

    res.json({ message: "Payment successful and listing published" });
  } catch (error) {
    res.status(500).json({ message: "Error processing payment" });
  }
};

export const updateListing = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, category_id, breed, age, price, location, description, category_data } = req.body;
  const seller_id = req.user?.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  try {
    const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(id) as any;
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller_id !== seller_id && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    let query = `
      UPDATE listings SET title = ?, category_id = ?, breed = ?, age = ?, price = ?, location = ?, description = ?, category_data = ?
    `;
    const params = [title, category_id, breed, age, price, location, description, category_data];

    if (files?.images && files.images.length > 0) {
      query += ", images = ?";
      const newImages = files.images.map(f => `/uploads/${f.filename}`);
      params.push(JSON.stringify(newImages));
      
      // Delete old images
      if (listing.images) {
        try {
          const oldImages = JSON.parse(listing.images);
          oldImages.forEach((img: string) => {
            const oldPath = path.join(process.cwd(), img);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          });
        } catch (e) {}
      }
    }

    if (files?.video && files.video.length > 0) {
      query += ", video = ?";
      params.push(`/uploads/${files.video[0].filename}`);
      
      if (listing.video) {
        const oldVideoPath = path.join(process.cwd(), listing.video);
        if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
      }
    }

    query += " WHERE id = ?";
    params.push(id);

    db.prepare(query).run(...params);
    res.json({ message: "Listing updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating listing" });
  }
};

export const deleteListing = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const seller_id = req.user?.id;

  try {
    const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(id) as any;
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller_id !== seller_id && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete files
    if (listing.images) {
      try {
        const oldImages = JSON.parse(listing.images);
        oldImages.forEach((img: string) => {
          const oldPath = path.join(process.cwd(), img);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        });
      } catch (e) {}
    }
    if (listing.video) {
      const videoPath = path.join(process.cwd(), listing.video);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }

    db.prepare("DELETE FROM listings WHERE id = ?").run(id);
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting listing" });
  }
};

export const getSellerListings = (req: AuthRequest, res: Response) => {
  const seller_id = req.user?.id;
  try {
    const listings = db.prepare(`
      SELECT l.*, c.name as category_name
      FROM listings l
      JOIN categories c ON l.category_id = c.id
      WHERE l.seller_id = ?
      ORDER BY l.created_at DESC
    `).all(seller_id);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller listings" });
  }
};

export const getCategories = (req: Request, res: Response) => {
  try {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};
