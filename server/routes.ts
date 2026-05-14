import { Express } from "express";
import * as authController from "./controllers/authController.ts";
import * as listingController from "./controllers/listingController.ts";
import * as adminController from "./controllers/adminController.ts";
import * as reviewController from "./controllers/reviewController.ts";
import * as paymentController from "./controllers/paymentController.ts";
import { authenticate, authorize } from "./middleware/auth.ts";
import { upload } from "./middleware/upload.ts";

export const setupRoutes = (app: Express) => {
  // Public routes
  app.post("/api/register", authController.register);
  app.post("/api/login", authController.login);

  app.get("/api/categories", listingController.getCategories);
  app.get("/api/listings", listingController.getListings);
  app.get("/api/listings/:id", listingController.getListingById);

  app.get("/api/reviews", reviewController.getReviews);
  app.post("/api/reviews", reviewController.createReview);

  // Protected routes (Seller/Admin)
  app.post(
    "/api/listings",
    authenticate as any,
    authorize(["seller", "admin"]),
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "video", maxCount: 1 }
    ]),
    listingController.createListing as any
  );

  app.post(
    "/api/payment",
    authenticate as any,
    listingController.simulatePayment as any
  );

  app.post(
    "/api/create-order",
    authenticate as any,
    paymentController.createOrder as any
  );

  app.post(
    "/create-order",
    authenticate as any,
    paymentController.createOrder as any
  );

  app.post(
    "/api/verify-payment",
    authenticate as any,
    paymentController.verifyPayment as any
  );

  app.get(
    "/api/seller/listings",
    authenticate as any,
    listingController.getSellerListings as any
  );

  app.put(
    "/api/listings/:id",
    authenticate as any,
    authorize(["seller", "admin"]),
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "video", maxCount: 1 }
    ]),
    listingController.updateListing as any
  );

  app.delete(
    "/api/listings/:id",
    authenticate as any,
    authorize(["seller", "admin"]),
    listingController.deleteListing as any
  );

  // Admin routes
  app.get(
    "/api/admin/listings",
    authenticate as any,
    authorize(["admin"]),
    adminController.getAllListings
  );

  app.patch(
    "/api/admin/listings/:id/status",
    authenticate as any,
    authorize(["admin"]),
    adminController.setListingStatus
  );
  
  app.get(
    "/api/admin/users",
    authenticate as any,
    authorize(["admin"]),
    adminController.getAllUsers
  );

  app.delete(
    "/api/admin/users/:id",
    authenticate as any,
    authorize(["admin"]),
    adminController.deleteUser
  );

  app.get(
    "/api/admin/stats",
    authenticate as any,
    authorize(["admin"]),
    adminController.getAdminStats
  );
};
