import express from "express";
import { addsubscriber, deleteSubscriber, getSubscribers } from "../controllers/subscriberController.js";


const subscriberRouter = express.Router();

subscriberRouter.post('/subscriber', addsubscriber);
subscriberRouter.get('/subscribers', getSubscribers);
subscriberRouter.delete('/subscriber/:id', deleteSubscriber);

export default subscriberRouter;
