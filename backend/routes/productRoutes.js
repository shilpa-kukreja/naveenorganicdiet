// import expree from "express";
// import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productControllers.js";
// import { upload } from "../middleware/productMiddleware.js";


// const productRouter = expree.Router();

// productRouter.post("/product", upload.single("productImg"), addProduct);
// productRouter.get("/products", getProducts);
// productRouter.put("/product/:id", upload.single("productImg"), updateProduct);
// productRouter.delete("/product/:id", deleteProduct);

// export default productRouter;





import express from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  getProductById,
} from "../controllers/productController.js";
import { upload } from "../middleware/productMiddleware.js";

const productRouter = express.Router();

productRouter.post("/product", upload, createProduct);
productRouter.get("/products", getProducts);
productRouter.get("/product/:id", getProductById);
productRouter.put("/product/:id", upload, updateProduct);
productRouter.delete("/product/:id", deleteProduct);

export default productRouter;
