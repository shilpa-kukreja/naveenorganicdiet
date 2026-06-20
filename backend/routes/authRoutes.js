import express from 'express';

import { upload } from '../middleware/blogMulter.js';
import { authMiddleware } from '../middleware/adminAuthMiddleware.js';
import { addUserAddress, allUsers, checkOtpStatus, deductWalletCoins, deleteUser, deleteUserAddress, edituser, getAllPayouts, getAllReferrals, getallverifiedNumber, getPayoutHistory, getReferralConfig, getReferralDashboard, getReferralStats, getReferredUsers, getTotalEarnings, getUser, getUserAddress, getWalletCoins, loginotp, requestPayout, updatePayoutStatus, updateReferralConfig, updateUserAddress, verifyotp, whatsappLoginOtp } from '../controllers/authControllers.js';



const authRoutes = express.Router();

authRoutes.post('/verify-otp', verifyotp)
authRoutes.post('/loginotp', loginotp)
authRoutes.post('/whatsapp-loginotp', whatsappLoginOtp) // New WhatsApp OTP route
authRoutes.get('/getuser', authMiddleware, getUser)
authRoutes.patch('/updateuser', authMiddleware, upload.single('image'), edituser)
authRoutes.get('/getalluser', allUsers)
authRoutes.post('/deleteuser', deleteUser)
authRoutes.post('/addaddress', authMiddleware, addUserAddress)
authRoutes.get('/getaddress', authMiddleware, getUserAddress)
authRoutes.delete('/deleteaddress/:addressId', authMiddleware, deleteUserAddress);
authRoutes.put('/editaddress/:addressId', authMiddleware, updateUserAddress);
authRoutes.get('/check-otp-status', checkOtpStatus);

authRoutes.get("/referrals", authMiddleware, getReferredUsers);
authRoutes.get("/referral/dashboard", authMiddleware, getReferralDashboard);
authRoutes.post("/request", authMiddleware, requestPayout);
authRoutes.get("/history", authMiddleware, getPayoutHistory);
authRoutes.get("/admin/all",  getAllPayouts);
authRoutes.put("/admin/update/:id", updatePayoutStatus);
authRoutes.get('/referral-config', getReferralConfig);
authRoutes.put('/referral-config', updateReferralConfig);
authRoutes.get('/all-referrals', getAllReferrals);
authRoutes.get('/referral-stats', getReferralStats);
authRoutes.get("/total-earnings", authMiddleware, getTotalEarnings);
authRoutes.get("/all-verified",  getallverifiedNumber);
authRoutes.get('/wallet', authMiddleware, getWalletCoins);
authRoutes.post('/deduct-coins', authMiddleware, deductWalletCoins);


export default authRoutes;