import express from 'express'
import { addCoupan, applyCoupon, getActiveCoupons, getAllCoupons, removeCoupons, toggleCouponStatus, updateCoupons } from '../controllers/couponControllers.js';






const couponRouter=express.Router();


couponRouter.post('/apply',applyCoupon)
couponRouter.post('/add',addCoupan);
couponRouter.get("/get", getAllCoupons); 
couponRouter.put("/:id/toggle", toggleCouponStatus);
couponRouter.post('/remove', removeCoupons);
couponRouter.put('/:id', updateCoupons);
couponRouter.get('/active',getActiveCoupons);   
 


export default couponRouter;