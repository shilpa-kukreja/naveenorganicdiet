// import express from "express";
// import { pushOrderToShipmozo, trackShipmozoOrder } from "../controllers/shipmozoController.js";


// const shipmozoRouter = express.Router();

// shipmozoRouter.post("/push-order/:orderId", pushOrderToShipmozo);
// shipmozoRouter.get("/track/:orderId", trackShipmozoOrder);

// export default shipmozoRouter;

import express from "express";
import { 
  pushOrderToShipmozo, 
  trackShipmozoOrder,
  trackMultipleOrders 
} from "../controllers/shipmozoController.js";


const shipmozoRouter = express.Router();

// Validation middleware
const validateTracking = (req, res, next) => {
  const { orderId } = req.params;
  if (!orderId || orderId.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: "Valid Order ID is required"
    });
  }
  next();
};

shipmozoRouter.post("/push-order/:orderId", validateTracking, pushOrderToShipmozo);
shipmozoRouter.get("/track/:orderId", validateTracking, trackShipmozoOrder);
shipmozoRouter.post("/track/batch", trackMultipleOrders);

export default shipmozoRouter;

