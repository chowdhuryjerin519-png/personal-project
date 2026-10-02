const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const port = process.env.PORT || 9000;
const app = express();
// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const username = encodeURIComponent(process.env.BD_USER);
const password = encodeURIComponent(process.env.BD_PASS);

const uri = `mongodb+srv://${username}:${password}@cluster0.rkkltre.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

console.log("USER:", JSON.stringify(process.env.BD_USER));
console.log("PASS:", JSON.stringify(process.env.BD_PASS));
async function run() {
  try {
    const db = client.db("product-session");
    const userCollections = db.collection("users");

    const productCollection = db.collection("products");
    const ordersCollection = db.collection("orders");
    const categoriesCollection = db.collection("categories");
    const bannersCollection = db.collection("banners");

    const verifyAdmin = async (req, res, next) => {
      const email = req.user?.email;

      const user = await userCollections.findOne({
        email,
      });

      if (user?.role !== "admin") {
        return res.status(403).send({
          message: "forbidden access",
        });
      }

      next();
    };

    // get all orders for admin
    app.get("/orders", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const result = await ordersCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to get orders",
        });
      }
    });

    // save or update a user in db
    app.post("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = req.body;
      // check if user exists in db
      const isExist = await userCollections.findOne(query);
      if (isExist) {
        return res.send(isExist);
      }

      const result = await userCollections.insertOne({
        ...user,
        role: "customer",
        timestamp: Date.now(),
      });
      res.send(result);
    });

    // Get current user's profile
    app.get("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;

        const user = await userCollections.findOne({ email });

        if (!user) {
          return res.status(404).send({
            message: "User not found",
          });
        }

        res.send(user);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to get user",
        });
      }
    });

    // Generate jwt token
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // save a product data in db
    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    app.post("/products", verifyToken, async (req, res) => {
      try {
        const product = req.body;

        if (!product.mainCategory) {
          return res.status(400).send({
            message: "Main category is required",
          });
        }

        // Find last position of this main category
        const lastProduct = await productCollection
          .find({
            mainCategory: product.mainCategory,
          })
          .sort({ position: -1 })
          .limit(1)
          .toArray();

        const nextPosition =
          lastProduct.length > 0 ? Number(lastProduct[0].position || 0) + 1 : 1;

        const productData = {
          ...product,
          position: nextPosition,
          createdAt: product.createdAt || new Date(),
          updatedAt: new Date(),
        };

        const result = await productCollection.insertOne(productData);

        res.send({
          success: true,
          insertedId: result.insertedId,
          position: nextPosition,
        });
      } catch (error) {
        console.log("Create product error:", error);

        res.status(500).send({
          message: "Failed to create product",
        });
      }
    });

    // GET ALL PRODUCTS

    app.get("/products", async (req, res) => {
      try {
        const result = await productCollection
          .find()
          .sort({
            mainCategory: 1,
            position: 1,
            createdAt: 1,
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log("Get products error:", error);

        res.status(500).send({
          message: "Failed to get products",
        });
      }
    });

    // Get products by main category
    app.get("/products/category/:mainCategory", async (req, res) => {
      try {
        const mainCategory = req.params.mainCategory;

        const products = await productCollection
          .find({
            mainCategory: mainCategory,
          })
          .toArray();

        res.send(products);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to get category products",
        });
      }
    });

    // Get products by main category + subcategory
    app.get("/products/category/:mainCategory/:category", async (req, res) => {
      try {
        const { mainCategory, category } = req.params;

        const products = await productCollection
          .find({
            mainCategory: mainCategory,
            category: category,
          })
          .toArray();

        res.send(products);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to get subcategory products",
        });
      }
    });

    // get a product by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // ==========================================
    // REORDER PRODUCTS
    // ==========================================

    app.patch(
      "/products/reorder",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const { products } = req.body;

          // console.log("========== REORDER ==========");
          // console.log("BODY:", req.body);
          // console.log("PRODUCTS:", products);

          if (!Array.isArray(products)) {
            return res.status(400).send({
              message: "Products must be an array",
            });
          }

          if (products.length === 0) {
            return res.status(400).send({
              message: "Products array is empty",
            });
          }

          // Check every product ID
          for (const product of products) {
            console.log("PRODUCT:", product);
            console.log("_ID:", product._id);
            console.log("_ID TYPE:", typeof product._id);

            if (!product._id || !ObjectId.isValid(product._id)) {
              console.log("INVALID PRODUCT ID:", product._id);

              return res.status(400).send({
                message: "Invalid product ID",
                id: product._id,
              });
            }
          }

          // Convert string IDs -> MongoDB ObjectId
          const bulkOperations = products.map((product, index) => {
            return {
              updateOne: {
                filter: {
                  _id: new ObjectId(product._id),
                },
                update: {
                  $set: {
                    position: index + 1,
                    updatedAt: new Date(),
                  },
                },
              },
            };
          });

          console.log("BULK OPERATIONS:", bulkOperations);

          const result = await productCollection.bulkWrite(bulkOperations);

          console.log("REORDER RESULT:", result);

          res.send({
            success: true,
            message: "Product order updated successfully",
            modifiedCount: result.modifiedCount,
          });
        } catch (error) {
          console.log("REORDER ERROR:", error);

          res.status(500).send({
            message: "Failed to reorder products",
            error: error.message,
          });
        }
      },
    );

    // ==========================================
    // UPDATE PRODUCT
    // ==========================================

    app.patch("/products/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid product ID",
          });
        }

        const {
          name,
          mainCategory,
          category,
          description,
          price,
          originalPrice,
          quantity,
          image,
          keywords,
          specifications,
          authorName,
          authorBio,
          publisher,
          previewPdfUrl,
        } = req.body;

        if (!name || !mainCategory) {
          return res.status(400).send({
            message: "Product name and main category are required",
          });
        }

        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!product) {
          return res.status(404).send({
            message: "Product not found",
          });
        }

        const updateData = {
          name,
          mainCategory,
          category,
          description,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : null,
          quantity: Number(quantity),
          image,
          keywords: keywords || "",
          specifications: specifications || [],
          authorName: authorName || "",
          authorBio: authorBio || "",
          publisher: publisher || "",
          previewPdfUrl: previewPdfUrl || "",
          updatedAt: new Date(),
        };

        // ==========================================
        // CATEGORY CHANGED
        // ==========================================

        if (product.mainCategory !== mainCategory) {
          const lastProduct = await productCollection
            .find({
              mainCategory,
            })
            .sort({ position: -1 })
            .limit(1)
            .toArray();

          const newPosition =
            lastProduct.length > 0
              ? Number(lastProduct[0].position || 0) + 1
              : 1;

          updateData.position = newPosition;
        }

        const result = await productCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: updateData,
          },
        );

        res.send({
          success: true,
          message: "Product updated successfully",
          result,
        });
      } catch (error) {
        console.log("Update product error:", error);

        res.status(500).send({
          message: "Failed to update product",
        });
      }
    });

    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    app.delete("/products/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid product ID",
          });
        }

        const result = await productCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            message: "Product not found",
          });
        }

        res.send({
          success: true,
          message: "Product deleted successfully",
          result,
        });
      } catch (error) {
        console.log("Delete Product Error:", error);

        res.status(500).send({
          message: "Failed to delete product",
        });
      }
    });

    // save order
    app.post("/orders", async (req, res) => {
      try {
        const order = req.body;

        // ================= CART CHECKOUT (multiple products) =================
        if (Array.isArray(order.products) && order.products.length > 0) {
          // Stock check — sob product er jonno
          for (const item of order.products) {
            const product = await productCollection.findOne({
              _id: new ObjectId(item.productId),
            });

            if (!product) {
              return res.status(404).send({
                message: `Product not found: ${item.name || item.productId}`,
              });
            }

            if (product.quantity < item.quantity) {
              return res.status(400).send({
                message: `${product.name} does not have enough stock`,
              });
            }
          }

          const orderResult = await ordersCollection.insertOne({
            ...order,
            status: "pending",
            createdAt: new Date(),
          });

          // Sob product-er quantity komano
          for (const item of order.products) {
            await productCollection.updateOne(
              { _id: new ObjectId(item.productId) },
              { $inc: { quantity: -item.quantity } },
            );
          }

          return res.send(orderResult);
        }

        // ================= SINGLE PRODUCT (Buy Now) — age jemon chilo ==========
        const productId = new ObjectId(order.productId);

        const product = await productCollection.findOne({ _id: productId });

        if (!product) {
          return res.status(404).send({ message: "Product not found" });
        }

        if (product.quantity <= 0) {
          return res.status(400).send({ message: "Product is out of stock" });
        }

        const orderResult = await ordersCollection.insertOne({
          ...order,
          status: "pending",
          quantity: order.quantity || 1,
          createdAt: new Date(),
        });

        await productCollection.updateOne(
          { _id: productId },
          { $inc: { quantity: -order.quantity || 1 } },
        );

        res.send(orderResult);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to create order",
        });
      }
    });

    // Update order status
    app.patch("/orders/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;

      const allowedStatus = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatus.includes(status)) {
        return res.status(400).send({
          message: "Invalid order status",
        });
      }

      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
      );

      res.send(result);
    });

    // order status api
    app.get("/my-orders/:email", verifyToken, async (req, res) => {
      const email = req.params.email;

      const result = await ordersCollection
        .find({
          "customer.email": email,
        })
        .sort({
          createdAt: -1,
        })
        .toArray();

      res.send(result);
    });

    // Cancel order by customer
    app.patch("/orders/:id/cancel", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const email = req.user?.email;

        const order = await ordersCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!order) {
          return res.status(404).send({
            message: "Order not found",
          });
        }

        // Check if this order belongs to logged-in customer
        if (order.customer?.email !== email) {
          return res.status(403).send({
            message: "You cannot cancel this order",
          });
        }

        // Customer can cancel only pending or processing orders
        if (!["pending", "processing"].includes(order.status)) {
          return res.status(400).send({
            message: "This order cannot be cancelled now",
          });
        }

        // Restore product quantity
        await productCollection.updateOne(
          {
            _id: new ObjectId(order.productId),
          },
          {
            $inc: {
              quantity: 1,
            },
          },
        );

        // Update order status
        const result = await ordersCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: {
              status: "cancelled",
              cancelledAt: new Date(),
            },
          },
        );

        res.send({
          success: true,
          message: "Order cancelled successfully",
          result,
        });
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to cancel order",
        });
      }
    });

    // Delete an order (admin only) — database theke sompurno delete hobe
    app.delete("/orders/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid order ID",
          });
        }

        const result = await ordersCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            message: "Order not found",
          });
        }

        res.send({
          success: true,
          message: "Order deleted successfully",
          result,
        });
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to delete order",
        });
      }
    });

    // Create Main Category OR Subcategory
    app.post("/categories", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { name, parent } = req.body;

        if (!name?.trim()) {
          return res.status(400).send({
            message: "Category name is required",
          });
        }

        const categoryName = name.trim();

        const slug = categoryName.toLowerCase().replace(/\s+/g, "-");

        // =====================================
        // If parent exists → Create Subcategory
        // =====================================

        if (parent) {
          const parentCategory = await categoriesCollection.findOne({
            name: parent,
          });

          if (!parentCategory) {
            return res.status(404).send({
              message: "Parent category not found",
            });
          }

          // Check duplicate subcategory
          const alreadyExists = parentCategory.subcategories?.some(
            (sub) => sub.name.toLowerCase() === categoryName.toLowerCase(),
          );

          if (alreadyExists) {
            return res.status(400).send({
              message: "Subcategory already exists",
            });
          }

          const subcategory = {
            _id: new ObjectId(),
            name: categoryName,
            slug,
            createdAt: new Date(),
          };

          const result = await categoriesCollection.updateOne(
            {
              _id: parentCategory._id,
            },
            {
              $push: {
                subcategories: subcategory,
              },
            },
          );

          return res.send({
            success: true,
            type: "subcategory",
            result,
          });
        }

        // =====================================
        // No parent → Create Main Category
        // =====================================

        const exists = await categoriesCollection.findOne({
          slug,
        });

        if (exists) {
          return res.status(400).send({
            message: "Category already exists",
          });
        }

        const lastCategory = await categoriesCollection
          .find()
          .sort({ order: -1 })
          .limit(1)
          .toArray();

        const nextOrder =
          lastCategory.length > 0 ? (lastCategory[0].order || 0) + 1 : 1;

        const category = {
          name: categoryName,
          slug,
          order: nextOrder,
          subcategories: [],
          createdAt: new Date(),
        };
        const result = await categoriesCollection.insertOne(category);

        res.send({
          success: true,
          type: "main-category",
          result,
        });
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to create category",
        });
      }
    });

    // categoris callection manu get navbar categories
    app.get("/categories", async (req, res) => {
      try {
        const result = await categoriesCollection
          .find()
          .sort({ order: 1, name: 1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to get categories",
        });
      }
    });

    // Subcategory create
    app.patch(
      "/categories/:id/subcategories",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const categoryId = req.params.id;
          const { name } = req.body;

          if (!name) {
            return res.status(400).send({
              message: "Subcategory name is required",
            });
          }

          const subcategory = {
            _id: new ObjectId(),
            name,
            slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
          };

          const result = await categoriesCollection.updateOne(
            {
              _id: new ObjectId(categoryId),
            },
            {
              $push: {
                subcategories: subcategory,
              },
            },
          );

          res.send(result);
        } catch (error) {
          console.log(error);

          res.status(500).send({
            message: "Failed to create subcategory",
          });
        }
      },
    );

    // ===============================
    // DELETE MAIN CATEGORY
    // ===============================

    app.delete(
      "/categories/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;

          if (!ObjectId.isValid(id)) {
            return res.status(400).send({
              message: "Invalid category ID",
            });
          }

          const result = await categoriesCollection.deleteOne({
            _id: new ObjectId(id),
          });

          if (result.deletedCount === 0) {
            return res.status(404).send({
              message: "Category not found",
            });
          }

          res.send({
            success: true,
            message: "Main category deleted successfully",
            deletedCount: result.deletedCount,
          });
        } catch (error) {
          console.log("Delete main category error:", error);

          res.status(500).send({
            message: "Failed to delete category",
          });
        }
      },
    );

    // DELETE SUBCATEGORY
    // ===============================

    app.delete(
      "/categories/:categoryId/subcategories/:subcategoryId",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const { categoryId, subcategoryId } = req.params;

          if (
            !ObjectId.isValid(categoryId) ||
            !ObjectId.isValid(subcategoryId)
          ) {
            return res.status(400).send({
              message: "Invalid category ID",
            });
          }

          const result = await categoriesCollection.updateOne(
            {
              _id: new ObjectId(categoryId),
            },
            {
              $pull: {
                subcategories: {
                  _id: new ObjectId(subcategoryId),
                },
              },
            },
          );

          if (result.modifiedCount === 0) {
            return res.status(404).send({
              message: "Subcategory not found",
            });
          }

          res.send({
            success: true,
            message: "Subcategory deleted successfully",
            modifiedCount: result.modifiedCount,
          });
        } catch (error) {
          console.log("Delete subcategory error:", error);

          res.status(500).send({
            message: "Failed to delete subcategory",
          });
        }
      },
    );

    // ==========================================
    // RENAME MAIN CATEGORY
    // ==========================================

    app.patch("/categories/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name?.trim()) {
          return res.status(400).send({
            message: "Category name is required",
          });
        }

        const newName = name.trim();

        const category = await categoriesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!category) {
          return res.status(404).send({
            message: "Category not found",
          });
        }

        // Check duplicate category
        const duplicate = await categoriesCollection.findOne({
          _id: { $ne: new ObjectId(id) },
          name: {
            $regex: `^${newName}$`,
            $options: "i",
          },
        });

        if (duplicate) {
          return res.status(400).send({
            message: "Category already exists",
          });
        }

        const newSlug = newName.toLowerCase().trim().replace(/\s+/g, "-");

        // Update category
        const result = await categoriesCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: {
              name: newName,
              slug: newSlug,
            },
          },
        );

        // IMPORTANT:
        // Update all products using old main category
        await productCollection.updateMany(
          {
            mainCategory: category.name,
          },
          {
            $set: {
              mainCategory: newName,
            },
          },
        );

        res.send({
          success: true,
          message: "Main category renamed successfully",
          result,
        });
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to rename main category",
        });
      }
    });

    // ==========================================
    // RENAME SUBCATEGORY
    // ==========================================

    app.patch(
      "/categories/:categoryId/subcategories/:subcategoryId",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const { categoryId, subcategoryId } = req.params;
          const { name } = req.body;

          if (!name?.trim()) {
            return res.status(400).send({
              message: "Subcategory name is required",
            });
          }

          const newName = name.trim();

          const parentCategory = await categoriesCollection.findOne({
            _id: new ObjectId(categoryId),
          });

          if (!parentCategory) {
            return res.status(404).send({
              message: "Main category not found",
            });
          }

          const subcategory = parentCategory.subcategories?.find(
            (sub) => sub._id.toString() === subcategoryId,
          );

          if (!subcategory) {
            return res.status(404).send({
              message: "Subcategory not found",
            });
          }

          // Duplicate check
          const duplicate = parentCategory.subcategories?.some(
            (sub) =>
              sub._id.toString() !== subcategoryId &&
              sub.name.toLowerCase() === newName.toLowerCase(),
          );

          if (duplicate) {
            return res.status(400).send({
              message: "Subcategory already exists",
            });
          }

          const newSlug = newName.toLowerCase().trim().replace(/\s+/g, "-");

          // Update subcategory inside parent category
          const result = await categoriesCollection.updateOne(
            {
              _id: new ObjectId(categoryId),
              "subcategories._id": new ObjectId(subcategoryId),
            },
            {
              $set: {
                "subcategories.$.name": newName,
                "subcategories.$.slug": newSlug,
              },
            },
          );

          // Update products
          await productCollection.updateMany(
            {
              mainCategory: parentCategory.name,
              category: subcategory.name,
            },
            {
              $set: {
                category: newName,
              },
            },
          );

          res.send({
            success: true,
            message: "Subcategory renamed successfully",
            result,
          });
        } catch (error) {
          console.log(error);

          res.status(500).send({
            message: "Failed to rename subcategory",
          });
        }
      },
    );

    // ==========================================
    // UPDATE MAIN CATEGORY ORDER
    // ==========================================

    app.patch(
      "/categories/:id/order",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const { id } = req.params;
          const { order } = req.body;

          const result = await categoriesCollection.updateOne(
            {
              _id: new ObjectId(id),
            },
            {
              $set: {
                order: Number(order),
              },
            },
          );

          res.send({
            success: true,
            result,
          });
        } catch (error) {
          console.log(error);

          res.status(500).send({
            message: "Failed to update category order",
          });
        }
      },
    );

    // ==========================================
    // GET ALL BANNERS
    // ==========================================

    app.get("/banners", async (req, res) => {
      try {
        const banners = await bannersCollection
          .find()
          .sort({ position: 1, createdAt: 1 })
          .toArray();

        res.send(banners);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to get banners",
        });
      }
    });

    // ==========================================
    // CREATE BANNER
    // ==========================================

    app.post("/banners", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { type, image, title, link, position } = req.body;

        if (!type || !image) {
          return res.status(400).send({
            message: "Banner type and image are required",
          });
        }

        if (!["left", "right"].includes(type)) {
          return res.status(400).send({
            message: "Invalid banner type",
          });
        }

        // Right side এ একটিই banner থাকবে
        if (type === "right") {
          const existingRightBanner = await bannersCollection.findOne({
            type: "right",
          });

          if (existingRightBanner) {
            return res.status(400).send({
              message:
                "Right banner already exists. Please update the existing banner.",
            });
          }
        }

        const banner = {
          type,
          image,
          title: title || "",
          link: link || "",
          position: type === "left" ? Number(position) || 1 : 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await bannersCollection.insertOne(banner);

        res.send({
          success: true,
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to create banner",
        });
      }
    });

    // ==========================================
    // UPDATE BANNER
    // ==========================================

    app.patch("/banners/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;

        const { image, title, link, position } = req.body;

        const updateData = {
          updatedAt: new Date(),
        };

        if (image !== undefined) {
          updateData.image = image;
        }

        if (title !== undefined) {
          updateData.title = title;
        }

        if (link !== undefined) {
          updateData.link = link;
        }

        if (position !== undefined) {
          updateData.position = Number(position);
        }

        const result = await bannersCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: updateData,
          },
        );

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to update banner",
        });
      }
    });

    // ==========================================
    // DELETE BANNER
    // ==========================================

    app.delete("/banners/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;

        const result = await bannersCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to delete banner",
        });
      }
    });

    /////////////////////////////////////////////////

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Web Developer BD Server..");
});

app.listen(port, () => {
  console.log(`Web Developer BD is running on port ${port}`);
});
