// import express from "express";
// import { restoreCart } from "../controllers/restoreCartController.js";


// const restoreRouter = express.Router();

// restoreRouter.get("/restore/:token", restoreCart);

// export default restoreRouter;


// routes/restoreCartRoutes.js
import express from "express";
import { 
  restoreCart, 
  checkRestoreToken 
} from "../controllers/restoreCartController.js";

const  restoreRouter = express.Router();

// Restore cart with token
 restoreRouter.get("restore/:token", restoreCart);

// Check if token is valid
 restoreRouter.get("/check/:token", checkRestoreToken);

export default  restoreRouter;