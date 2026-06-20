import express from 'express';
import { addadditionalbanner, deleteadditionalbanner, getalladditionalbanners, toggleBannerStatus, updateadditionalbannerstatus } from '../controllers/additionalbannercontroller.js';
import { upload } from '../middleware/additionalbannerMiddleware.js';


const additionalbannerRouter = express.Router();

additionalbannerRouter.post('/add',upload.single('image'), addadditionalbanner);
additionalbannerRouter.get('/getall', getalladditionalbanners);
additionalbannerRouter.delete('/delete/:id', deleteadditionalbanner);
additionalbannerRouter.put('/toggle-status/:id', toggleBannerStatus);
additionalbannerRouter.put('/update-status/:id',upload.single('image'), updateadditionalbannerstatus);

export default additionalbannerRouter;