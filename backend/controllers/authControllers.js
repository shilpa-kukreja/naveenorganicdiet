// import jwt from 'jsonwebtoken';
// import otpModel from '../models/otpModel.js';
// import userModel from '../models/authModel.js';
// import axios from 'axios';
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });


// // Generate random 6-digit OTP
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // 📌 Send OTP
// export const loginotp = async (req, res) => {
//   try {
//     const { number } = req.body;
//     const otp = generateOTP();

//     // Save or update OTP in DB
//     await otpModel.findOneAndUpdate(
//       { number },
//       { number, otp, createdAt: Date.now() },
//       { upsert: true, new: true }
//     );

//     // 👉 Fast2SMS API
//     await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       {
//         route: "dlt",
//         sender_id: "HELSTR",
//         message: "195392", // Your DLT template ID
//         variables_values: otp,
//         numbers: number,
//       },
//       {
//         headers: {
//           authorization: process.env.FAST2SMS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     res.json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



// export const verifyotp = async (req, res) => {
//   try {
//     const { number, username = '', email = '', otp } = req.body;

//     // Check OTP from otpModel
//     const otpRecord = await otpModel.findOne({ number, otp });
//     if (!otpRecord) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }

//     // Check if user already exists
//     let user = await userModel.findOne({ number });
//     let isNewUser = false;

//     if (!user) {
//       // Create new user if doesn't exist
//       user = await userModel.create({
//         username,
//         email,
//         number,
//         verifiedAt: new Date(),
//       });
//       isNewUser = true;
//     }

//     // Delete OTP after verification
//     await otpModel.deleteMany({ number });

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, number: user.number },
//       process.env.JWT_SECRET,
//       { expiresIn: "30d" }
//     );

//     // Send welcome email only for new users
//     if (isNewUser && email) {
//       await sendWelcomeEmail(username, email);
//     }

//     res.json({
//       success: true,
//       message: "Number verified successfully",
//       token,
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Function to send welcome email
// const sendWelcomeEmail = async (username, email) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to: email,
//       subject: `Welcome to ${process.env.COMPANY_NAME || 'Our Store'}!`,
//       html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Welcome to Our Store</title>
//     <style>
//         body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.6;
//             color: #333333;
//             margin: 0;
//             padding: 0;
//             background-color: #f7f7f7;
//         }
//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #ffffff;
//         }
//         .header {
//             background-color: #4f46e5;
//             padding: 20px;
//             text-align: center;
//         }
//         .header h1 {
//             color: white;
//             margin: 0;
//         }
//         .content {
//             padding: 30px;
//         }
//         .welcome-section {
//             background-color: #f0f9ff;
//             border-radius: 5px;
//             padding: 20px;
//             margin-bottom: 20px;
//             border-left: 4px solid #4f46e5;
//         }
//         .benefits {
//             margin: 20px 0;
//         }
//         .benefit-item {
//             display: flex;
//             align-items: center;
//             margin-bottom: 15px;
//         }
//         .benefit-icon {
//             width: 24px;
//             height: 24px;
//             margin-right: 10px;
//             background-color: #4f46e5;
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             color: white;
//         }
//         .footer {
//             background-color: #f3f4f6;
//             padding: 20px;
//             text-align: center;
//             font-size: 14px;
//             color: #6b7280;
//         }
//         .button {
//             display: inline-block;
//             padding: 12px 24px;
//             background-color: #4f46e5;
//             color: white;
//             text-decoration: none;
//             border-radius: 5px;
//             margin-top: 15px;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h1>Welcome Aboard!</h1>
//         </div>

//         <div class="content">
//             <h2>Hello ${username},</h2>

//             <div class="welcome-section">
//                 <h3>Thank you for joining ${process.env.COMPANY_NAME || 'our store'}!</h3>
//                 <p>We're excited to have you as part of our community. Your account has been successfully created and verified.</p>
//             </div>

//             <div class="benefits">
//                 <h3>Here's what you can do with your account:</h3>

//                 <div class="benefit-item">
//                     <div class="benefit-icon">✓</div>
//                     <p>Track your orders in real-time</p>
//                 </div>

//                 <div class="benefit-item">
//                     <div class="benefit-icon">✓</div>
//                     <p>Save multiple shipping addresses</p>
//                 </div>

//                 <div class="benefit-item">
//                     <div class="benefit-icon">✓</div>
//                     <p>Get exclusive deals and promotions</p>
//                 </div>

//                 <div class="benefit-item">
//                     <div class="benefit-icon">✓</div>
//                     <p>Write reviews for products you've purchased</p>
//                 </div>

//                 <div class="benefit-item">
//                     <div class="benefit-icon">✓</div>
//                     <p>Quick checkout with saved payment methods</p>
//                 </div>
//             </div>

//             <p>Start shopping now and discover our amazing products!</p>

//             <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping</a>

//             <p>If you have any questions, feel free to contact our customer support team at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@yourcompany.com'}">${process.env.SUPPORT_EMAIL || 'support@yourcompany.com'}</a>.</p>
//         </div>

//         <div class="footer">
//             <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Your Company Name'}. All rights reserved.</p>
//             <p>${process.env.COMPANY_ADDRESS || '123 Business Street, City, Country'}</p>
//         </div>
//     </div>
// </body>
// </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Welcome email sent to:", email);
//   } catch (error) {
//     console.error("Error sending welcome email:", error);
//   }
// };



// export const getUser = async (req, res) => {
//   try {

//     const user = await userModel.findById(req.user.id);
//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// export const allUsers = async (req, res) => {
//   try {
//     const users = await userModel.find({}).select("-password");
//     res.json({ success: true, users });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// export const deleteUser = async (req, res) => {
//   try {
//     const user = await userModel.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     res.json({ success: true, message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };





// export const addUserAddress = async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       phone,
//       address1,
//       address2,
//       addresstype,
//       city,
//       state,
//       postalCode,
//       landmark,
//       isDefault,
//     } = req.body;

//     const user = await userModel.findById(req.user.id); // 👈 authMiddleware must set this
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const newAddress = {
//       fullName,
//       email,
//       phone,
//       address1,
//       address2,
//       addresstype,
//       city,
//       state,
//       postalCode,
//       landmark,
//       isDefault: isDefault || false,
//     };

//     // push into user's address array
//     user.address.push(newAddress);  // 👈 if user.address is undefined → error
//     await userModel.findByIdAndUpdate(user._id, { address: user.address }); // 👈 safer save

//     res.json({ success: true, message: "Address added successfully", user });
//   } catch (error) {
//     console.error("❌ Add Address Error:", error.message); // 👈 add this
//     res.status(500).json({ success: false, error: error.message });
//   }
// };





// export const getUserAddress = async (req, res) => {
//   try {
//     const user = await userModel.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.json({ success: true, address: user.address });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };





// export const deleteUserAddress = async (req, res) => {
//   try {
//     const { addressId } = req.params;
//     const user = await userModel.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     user.address = user.address.filter(
//       (address) => address._id.toString() !== addressId
//     );

//     await user.save({ validateBeforeSave: false }); // ✅ skip validation

//     res.json({
//       success: true,
//       message: "Address deleted successfully",
//       address: user.address,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };





// export const updateUserAddress = async (req, res) => {
//   try {
//     const { addressId } = req.params;
//     const { fullName, email, phone, address1, address2, addresstype, city, state, postalCode, landmark } = req.body;

//     const user = await userModel.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const address = user.address.id(addressId); // find subdocument by _id
//     if (!address) {
//       return res.status(404).json({ success: false, message: "Address not found" });
//     }

//     // update only the provided fields
//     if (fullName) address.fullName = fullName;
//     if (email) address.email = email;
//     if (phone) address.phone = phone;
//     if (address1) address.address1 = address1;
//     if (address2) address.address2 = address2;
//     if (addresstype) address.addresstype = addresstype;
//     if (city) address.city = city;
//     if (state) address.state = state;
//     if (postalCode) address.postalCode = postalCode;
//     if (landmark) address.landmark = landmark;

//     await user.save();

//     res.json({
//       success: true,
//       message: "Address updated successfully",
//       address: user.address,  // ✅ return updated addresses
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// export const edituser = async (req, res) => {
//   try {
//     const { username, email } = req.body;

//     // Find logged in user
//     const user = await userModel.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Update fields if provided
//     if (username) user.username = username;
//     if (email) user.email = email;

//     // Handle image upload (if file provided)
//     if (req.file) {
//       user.img = `/uploads/blogs/${req.file.filename}`;
//     }

//     await user.save();

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };





import jwt from 'jsonwebtoken';
import otpModel from '../models/otpModel.js';
import userModel from '../models/authModel.js';
import axios from 'axios';
import qs from "qs";
import nodemailer from 'nodemailer';
import orderModel from '../models/orderModel.js';
import referrralModel from '../models/referralModel.js';
import PayoutRequest from '../models/payoutRequestModel.js';
import mongoose from 'mongoose';
import { orderQueue } from '../config/queue.js';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Static OTP for WhatsApp (for testing)
const WHATSAPP_STATIC_OTP = "123456"; // You can change this as needed

// 📌 Send OTP (SMS)
// In your authController.js - update the loginotp function
// In authController.js - update verifyotp function


// export const verifyotp = async (req, res) => {
//   try {
//     const { number, username = '', email = '', otp, channel = 'sms', referralCode = '' } = req.body;

//     console.log(`🔍 Verifying OTP:`, { number, channel });

//     // For WhatsApp, allow static OTP for testing
//     if (channel === 'whatsapp' && otp === WHATSAPP_STATIC_OTP) {
//       console.log(`✅ WhatsApp static OTP verified for ${number}`);
//     } else {
//       // Regular OTP verification from database
//       const otpRecord = await otpModel.findOne({ number, otp });

//       if (!otpRecord) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid OTP. Please check the code and try again.",
//         });
//       }

//       // Manual expiration check (5 minutes)
//       const now = new Date();
//       const otpAge = now - new Date(otpRecord.createdAt);
//       const isExpired = otpAge > 5 * 60 * 1000;

//       if (isExpired) {
//         await otpModel.deleteOne({ _id: otpRecord._id });
//         return res.status(400).json({
//           success: false,
//           message: "OTP has expired. Please request a new one.",
//         });
//       }
//     }

//     // Check if user already exists
//     let user = await userModel.findOne({ number });
//     let isNewUser = false;

//     if (!user) {
//       // Create new user
//       user = await userModel.create({
//         username: username || `User${number.slice(-4)}`,
//         email: email || `${number}@temp.com`,
//         number,
//         verifiedAt: new Date(),
//       });
//       isNewUser = true;
//       console.log(`✅ New user created: ${user._id}`);
//       // Send welcome email for new users
//       if (email) {
//         try {
//           await sendWelcomeEmail(username || user.username, email);
//           console.log(`✅ Welcome email sent to: ${email}`);
//         } catch (emailError) {
//           console.error(`❌ Welcome email failed for ${email}:`, emailError.message);
//         }
//       }

//       // Send welcome SMS for new users
//       try {
//         await orderQueue.add('sendWelcomeSMS', {
//           phone: number,
//           username: username || user.username
//         });
//         console.log(`✅ Welcome SMS queued for: ${number}`);
//       } catch (smsError) {
//         console.error(`❌ Welcome SMS queue failed:`, smsError.message);
//       }
//     } else {
//       console.log(`✅ Existing user found: ${user._id}`);
//     }

//     // ✅ Apply Referral Code (only for new users who haven't been referred yet)
//     if (referralCode && isNewUser && !user.referredBy) {
//       const referrer = await userModel.findOne({ referralCode });

//       if (referrer) {
//         // Prevent self-referral
//         if (referrer._id.toString() === user._id.toString()) {
//           console.log("⚠️ Self-referral attempt blocked");
//         } else {
//           user.referredBy = referrer._id;
//           await user.save();

//           // Update referrer's total referral count
//           await userModel.findByIdAndUpdate(
//             referrer._id,
//             { $inc: { totalReferral: 1 } }
//           );

//           console.log(`✅ Referral applied: ${user.number} referred by ${referrer.number}`);
//         }
//       } else {
//         console.log(`⚠️ Invalid referral code: ${referralCode}`);
//       }
//     }

//     // Delete the used OTP
//     await otpModel.deleteMany({ number });

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, number: user.number },
//       process.env.JWT_SECRET,
//       { expiresIn: "30d" }
//     );

//     // Send welcome email for new users
//     if (isNewUser && email) {
//       await sendWelcomeEmail(username || user.username, email);
//     }

//     console.log(`✅ Login successful for ${number}`);

//     res.json({
//       success: true,
//       message: "Number verified successfully",
//       token,
//       user,
//       isNewUser,
//       hasReferral: !!user.referredBy,
//       emailSent: isNewUser && email ? true : false,
//       smsSent: isNewUser ? true : false
//     });
//   } catch (error) {
//     console.error('❌ OTP Verification Error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };





// Fix the verifyotp function (remove duplicate email sending)
export const verifyotp = async (req, res) => {
  try {
    const { number, username = '', email = '', otp, channel = 'sms', referralCode = '' } = req.body;

    console.log(`🔍 Verifying OTP:`, { number, channel });

    // For WhatsApp, allow static OTP for testing
    if (channel === 'whatsapp' && otp === WHATSAPP_STATIC_OTP) {
      console.log(`✅ WhatsApp static OTP verified for ${number}`);
    } else {
      // Regular OTP verification from database
      const otpRecord = await otpModel.findOne({ number, otp });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP. Please check the code and try again.",
        });
      }

      // Manual expiration check (5 minutes)
      const now = new Date();
      const otpAge = now - new Date(otpRecord.createdAt);
      const isExpired = otpAge > 5 * 60 * 1000;

      if (isExpired) {
        await otpModel.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
      }
    }

    // Check if user already exists
    let user = await userModel.findOne({ number });
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await userModel.create({
        username: username || `User${number.slice(-4)}`,
        email: email || `${number}@temp.com`,
        number,
        verifiedAt: new Date(),
      });
      isNewUser = true;
      console.log(`✅ New user created: ${user._id}`);
      
      // Send welcome email for new users (ONLY ONCE)
      if (email) {
        try {
          await sendWelcomeEmail(username || user.username, email);
          console.log(`✅ Welcome email sent to: ${email}`);
        } catch (emailError) {
          console.error(`❌ Welcome email failed for ${email}:`, emailError.message);
        }
      }

      // Send welcome SMS for new users
      try {
        await orderQueue.add('sendWelcomeSMS', {
          phone: number,
          username: username || user.username
        });
        console.log(`✅ Welcome SMS queued for: ${number}`);
      } catch (smsError) {
        console.error(`❌ Welcome SMS queue failed:`, smsError.message);
      }
    } else {
      console.log(`✅ Existing user found: ${user._id}`);
    }

    // ✅ Apply Referral Code (only for new users who haven't been referred yet)
    if (referralCode && isNewUser && !user.referredBy) {
      const referrer = await userModel.findOne({ referralCode });

      if (referrer) {
        // Prevent self-referral
        if (referrer._id.toString() === user._id.toString()) {
          console.log("⚠️ Self-referral attempt blocked");
        } else {
          user.referredBy = referrer._id;
          await user.save();

          // Update referrer's total referral count
          await userModel.findByIdAndUpdate(
            referrer._id,
            { $inc: { totalReferral: 1 } }
          );

          console.log(`✅ Referral applied: ${user.number} referred by ${referrer.number}`);
        }
      } else {
        console.log(`⚠️ Invalid referral code: ${referralCode}`);
      }
    }

    // Delete the used OTP
    await otpModel.deleteMany({ number });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, number: user.number },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log(`✅ Login successful for ${number}`);

    res.json({
      success: true,
      message: "Number verified successfully",
      token,
      user,
      isNewUser,
      hasReferral: !!user.referredBy,
      emailSent: isNewUser && email ? true : false,
      smsSent: isNewUser ? true : false
    });
  } catch (error) {
    console.error('❌ OTP Verification Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};






export const loginotp = async (req, res) => {
  try {
    const { number } = req.body;
    const otp = generateOTP();

    // Clear old OTPs
    await otpModel.deleteMany({ number });

    // Save OTP
    await otpModel.create({
      number,
      otp,
      createdAt: new Date()
    });

    // ⚠ MUST MATCH TEMPLATE EXACTLY
    const message = `Your verification code for Organic Diet is ${otp}`;

    // 🔹 SMSAlert expects FORM DATA
    // const data = qs.stringify({
    //   apikey: process.env.SMSALERT_API_KEY,
    //   sender: process.env.SMSALERT_SENDER,
    //   numbers: number,
    //   message: message,
    //   route: "otp",
    //   template_id: 3
    // });

    try {
      const smsResponse = await axios.get(
        `http://www.smsalert.co.in/api/push.json?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${number}&text=Your%20verification%20code%20for%20Organic%20Diet%20is%20${otp}%0A%20Regards%20Organic%20Diet`,
       
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      // console.log(`http://www.smsalert.co.in/api/push.json?apikey=${process.env.SMSALERT_API_KEY}&route=transactional&sender=${process.env.SMSALERT_SENDER}&mobileno=${number}&text=Your%20verification%20code%20for%20Organic%20Diet%20is%20${otp}%0A%20Regards%20Organic%20Diet`);

      console.log("✅ SMSAlert Success:", smsResponse.data);
    } catch (smsError) {
      console.error(
        "❌ SMSAlert Failed:",
        smsError.response?.data || smsError.message
      );
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp // ❌ remove in production
    });

  } catch (error) {
    console.error("❌ OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "OTP sending failed"
    });
  }
};



// 📌 Send WhatsApp OTP
// 📌 Send WhatsApp OTP
export const whatsappLoginOtp = async (req, res) => {
  try {
    const { number } = req.body;

    // For WhatsApp, we'll use static OTP for testing
    const otp = WHATSAPP_STATIC_OTP;

    console.log(`📱 Sending WhatsApp OTP ${otp} to ${number}`);

    // Save or update OTP in DB
    await otpModel.findOneAndUpdate(
      { number },
      { number, otp, createdAt: Date.now(), channel: 'whatsapp' },
      { upsert: true, new: true }
    );

    // Log the OTP for testing
    console.log(`✅ WhatsApp OTP for ${number}: ${otp}`);

    res.json({
      success: true,
      message: "WhatsApp OTP sent successfully",
      otp: WHATSAPP_STATIC_OTP,
      note: "For testing, use the static OTP displayed on screen"
    });
  } catch (error) {
    console.error('❌ WhatsApp OTP Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📌 Verify OTP (works for both SMS and WhatsApp)


// Function to send welcome email
const sendWelcomeEmail = async (username, email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Welcome to ${process.env.COMPANY_NAME || 'Our Store'}!`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Store</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #4f46e5;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
        }
        .content {
            padding: 30px;
        }
        .welcome-section {
            background-color: #f0f9ff;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #4f46e5;
        }
        .benefits {
            margin: 20px 0;
        }
        .benefit-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .benefit-icon {
            width: 24px;
            height: 24px;
            margin-right: 10px;
            background-color: #4f46e5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .footer {
            background-color: #f3f4f6;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome Aboard!</h1>
        </div>
        
        <div class="content">
            <h2>Hello ${username},</h2>
            
            <div class="welcome-section">
                <h3>Thank you for joining ${process.env.COMPANY_NAME || 'our store'}!</h3>
                <p>We're excited to have you as part of our community. Your account has been successfully created and verified.</p>
            </div>
            
            <div class="benefits">
                <h3>Here's what you can do with your account:</h3>
                
                <div class="benefit-item">
                    <div class="benefit-icon">✓</div>
                    <p>Track your orders in real-time</p>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon">✓</div>
                    <p>Save multiple shipping addresses</p>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon">✓</div>
                    <p>Get exclusive deals and promotions</p>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon">✓</div>
                    <p>Write reviews for products you've purchased</p>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon">✓</div>
                    <p>Quick checkout with saved payment methods</p>
                </div>
            </div>
            
            <p>Start shopping now and discover our amazing products!</p>
            
            <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping</a>
            
            <p>If you have any questions, feel free to contact our customer support team at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@yourcompany.com'}">${process.env.SUPPORT_EMAIL || 'support@yourcompany.com'}</a>.</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Your Company Name'}. All rights reserved.</p>
            <p>${process.env.COMPANY_ADDRESS || '123 Business Street, City, Country'}</p>
        </div>
    </div>
</body>
</html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

// ... (rest of your existing functions remain the same)
export const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getallverifiedNumber = async (req, res) => {
  try {
    const allverified = await userModel.find()
      .populate('referredBy', 'number') // Populate with the referrer's number
      .sort({ verifiedAt: -1 }); // Sort by latest verified first

    res.json({ success: true, allverified });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}




export const getReferralDashboard = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const referralLink = `${process.env.FRONTEND_URL}/login?ref=${user.referralCode}`;

    // Get direct referral stats
    const directReferralStats = await orderModel.aggregate([
      {
        $match: {
          referredBy: user._id,
          payment: true
        }
      },
      {
        $group: {
          _id: null,
          totalDirectCommission: { $sum: "$referralCoinsAdded.user" },
          successfulDirectReferrals: { $sum: 1 },
          totalDirectSales: { $sum: "$amount" }
        }
      }
    ]);


    const directStats = directReferralStats[0] || {
      totalDirectCommission: 0,
      successfulDirectReferrals: 0,
      totalDirectSales: 0
    };
    const totalCommission = directStats.totalDirectCommission;
    const totalSuccessfulReferrals = directStats.successfulDirectReferrals;

    res.json({
      // Direct Referral
      referralCode: user.referralCode,
      referralLink,
      totalReferral: user.totalReferral,
      successfulDirectReferrals: directStats.successfulDirectReferrals,
      totalDirectCommission: directStats.totalDirectCommission,


      // Combined Stats
      totalCommissionEarned: totalCommission,
      totalSuccessfulReferrals: totalSuccessfulReferrals
    });
  } catch (error) {
    console.error("Error in getReferralDashboard:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to load referral dashboard"
    });
  }
};



export const getReferredUsers = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Step 1: Find all direct referral orders (referredBy)
    const directReferralOrders = await orderModel.aggregate([
      {
        $match: {
          referredBy: user._id,
          payment: true, // only successful orders
        },
      },
      {
        $group: {
          _id: "$userId", // group by referred user
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
          totalCommission: { $sum: "$referralCoinsAdded.user" },
          latestOrder: { $max: "$createdAt" },
          userDetails: { $first: "$address" },
          referralType: { $first: "direct" }
        },
      },
      {
        $project: {
          _id: 1,
          totalOrders: 1,
          totalSpent: 1,
          totalCommission: 1,
          latestOrder: 1,
          name: {
            $concat: [
              { $ifNull: ["$userDetails.firstName", ""] },
              " ",
              { $ifNull: ["$userDetails.lastName", ""] },
            ],
          },
          email: "$userDetails.email",
          phone: "$userDetails.phone",
          referralType: 1
        },
      }
    ]);



    //   referrals
    const allReferrals = [...directReferralOrders,]
      .sort((a, b) => new Date(b.latestOrder) - new Date(a.latestOrder));

    // Calculate totals
    const totalStats = {
      directReferrals: directReferralOrders.length,
      totalReferrals: allReferrals.length,
      totalCommission: allReferrals.reduce((sum, ref) => sum + (ref.totalCommission || 0), 0),
      totalRevenue: allReferrals.reduce((sum, ref) => sum + (ref.totalSpent || 0), 0)
    };

    res.json({
      success: true,
      referrals: allReferrals,
      stats: totalStats,
      userStats: {
        totalCommissionEarned: user.totalCommissionEarned || 0,
        totalReferral: user.totalReferral || 0,
      }
    });
  } catch (error) {
    console.error("Error fetching referred users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};





// Get referral configuration
export const getReferralConfig = async (req, res) => {
  try {
    let config = await referrralModel.findOne();

    // If no config exists, create default one
    if (!config) {
      config = new referrralModel({
        userDiscountPercent: 5,
        referrerCommissionPercent: 5,
        maxDirectDiscountPercent: 20,
        maxTotalDiscountPercent: 30
      });
      await config.save();
    }

    res.json({
      success: true,
      config
    });

  } catch (error) {
    console.error("Get Referral Config Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referral configuration"
    });
  }
};




// Update referral configuration
// export const updateReferralConfig = async (req, res) => {
//   try {
//     const {
//       userDiscountPercent,
//       referrerCommissionPercent,
//       maxDirectDiscountPercent,
//       maxTotalDiscountPercent
//     } = req.body;

//     // Validate percentages
//     const validatePercentage = (value, name, max = 100) => {
//       if (value < 0 || value > max) {
//         throw new Error(`${name} must be between 0% and ${max}%`);
//       }
//     };

//     try {
//       validatePercentage(userDiscountPercent, "User discount", 50);
//       validatePercentage(referrerCommissionPercent, "Referrer commission", 50);
//       validatePercentage(maxDirectDiscountPercent, "Max direct discount", 50);
//       validatePercentage(maxTotalDiscountPercent, "Max total discount", 50);
//     } catch (validationError) {
//       return res.status(400).json({
//         success: false,
//         message: validationError.message
//       });
//     }

//     // Find and update or create new config
//     let config = await referrralModel.findOne();

//     if (config) {
//       // Update existing config
//       config.userDiscountPercent = userDiscountPercent;
//       config.referrerCommissionPercent = referrerCommissionPercent;
//       config.maxDirectDiscountPercent = maxDirectDiscountPercent;
//       config.maxTotalDiscountPercent = maxTotalDiscountPercent;
//     } else {
//       // Create new config
//       config = new referrralModel({
//         userDiscountPercent,
//         referrerCommissionPercent,
//         maxDirectDiscountPercent,
//         maxTotalDiscountPercent
//       });
//     }

//     await config.save();

//     res.json({
//       success: true,
//       message: "Referral configuration updated successfully",
//       config
//     });

//   } catch (error) {
//     console.error("Update Referral Config Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating referral configuration"
//     });
//   }
// };



// In authController.js - update the updateReferralConfig function
export const updateReferralConfig = async (req, res) => {
  try {
    const {
      userDiscountPercent,
      referrerCommissionPercent,
      maxDirectDiscountPercent,
      maxTotalDiscountPercent,
      firstOrderCoinPercent,
      subsequentOrderCoinPercent
    } = req.body;

    // Validate percentages
    const validatePercentage = (value, name, max = 100) => {
      if (value < 0 || value > max) {
        throw new Error(`${name} must be between 0% and ${max}%`);
      }
    };

    try {
      validatePercentage(userDiscountPercent, "User discount", 50);
      validatePercentage(referrerCommissionPercent, "Referrer commission", 50);
      validatePercentage(maxDirectDiscountPercent, "Max direct discount", 50);
      validatePercentage(maxTotalDiscountPercent, "Max total discount", 50);
      validatePercentage(firstOrderCoinPercent, "First order coin percent", 100);
      validatePercentage(subsequentOrderCoinPercent, "Subsequent order coin percent", 100);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Find and update or create new config
    let config = await referrralModel.findOne();

    if (config) {
      // Update existing config
      config.userDiscountPercent = userDiscountPercent;
      config.referrerCommissionPercent = referrerCommissionPercent;
      config.maxDirectDiscountPercent = maxDirectDiscountPercent;
      config.maxTotalDiscountPercent = maxTotalDiscountPercent;
      config.firstOrderCoinPercent = firstOrderCoinPercent;
      config.subsequentOrderCoinPercent = subsequentOrderCoinPercent;
    } else {
      // Create new config
      config = new referrralModel({
        userDiscountPercent,
        referrerCommissionPercent,
        maxDirectDiscountPercent,
        maxTotalDiscountPercent,
        firstOrderCoinPercent,
        subsequentOrderCoinPercent
      });
    }

    await config.save();

    res.json({
      success: true,
      message: "Referral configuration updated successfully",
      config
    });

  } catch (error) {
    console.error("Update Referral Config Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating referral configuration"
    });
  }
};





// Fix the getAllReferrals controller
export const getAllReferrals = async (req, res) => {
  try {
    const referrals = await orderModel.aggregate([
      {
        $match: {
          $or: [
            { referredBy: { $exists: true, $ne: null } },
          ]
        }
      },
      // Convert IDs to ObjectId if they are strings
      {
        $addFields: {
          referredByObj: {
            $cond: [
              { $and: [{ $ne: ["$referredBy", null] }, { $eq: [{ $type: "$referredBy" }, "string"] }] },
              { $toObjectId: "$referredBy" },
              "$referredBy"
            ]
          },
          userIdObj: {
            $cond: [
              { $eq: [{ $type: "$userId" }, "string"] },
              { $toObjectId: "$userId" },
              "$userId"
            ]
          }
        }
      },

      // Lookup referred user (buyer)
      {
        $lookup: {
          from: "users",
          localField: "userIdObj",
          foreignField: "_id",
          as: "referredUserData"
        }
      },
      { $unwind: { path: "$referredUserData", preserveNullAndEmptyArrays: true } },

      // Lookup direct referrer
      {
        $lookup: {
          from: "users",
          localField: "referredByObj",
          foreignField: "_id",
          as: "directReferrerData"
        }
      },
      { $unwind: { path: "$directReferrerData", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          orderId: "$orderid",
          orderDate: { $ifNull: ["$createdAt", "$date"] },
          orderAmount: "$amount",
          originalAmount: "$originalAmount",

          referralDiscount: {
            $cond: {
              if: { $ne: ["$referredBy", null] },
              then: { $toDouble: "$referralCoinsAdded.referrer" },
              else: 0
            }
          },

          commissionEarned: {
            $cond: {
              if: { $gt: ["$referralCoinsAdded.user", 0] },
              then: { $toDouble: "$referralCoinsAdded.user" },
              else: 0
            }
          },

          status: "$status",

          referralType: {
            $cond: {
              if: { $ne: ["$referredBy", null] },
              then: "direct",
              else: "none"
            }
          },

          discountType: {
            $cond: {
              if: { $ne: ["$referredBy", null] },
              then: "referral",
              else: "none"
            }
          },

          // Referred User (Buyer)
          referredUser: {
            name: {
              $concat: [
                { $ifNull: ["$address.firstName", ""] },
                " ",
                { $ifNull: ["$address.lastName", ""] }
              ]
            },
            email: "$address.email",
            phone: "$address.phone",
            number: "$referredUserData.number"
          },

          // Referrer
          referrer: {
            name: {
              $cond: {
                if: { $ne: ["$referredBy", null] },
                then: {
                  $concat: [
                    { $ifNull: ["$directReferrerData.name", ""] },
                    " ",
                    { $ifNull: ["$directReferrerData.lastName", ""] }
                  ]
                },
                else: ""
              }
            },
            email: {
              $cond: {
                if: { $ne: ["$referredBy", null] },
                then: "$directReferrerData.email",
                else: ""
              }
            },
            number: {
              $cond: {
                if: { $ne: ["$referredBy", null] },
                then: "$directReferrerData.number",
                else: ""
              }
            }
          }
        }
      },
      { $sort: { orderDate: -1 } }
    ]);

    console.log("Processed Referrals:", referrals.length);

    // Log sample data to verify discount calculation
    if (referrals.length > 0) {
      console.log("Sample referral data:", {
        orderId: referrals[0].orderId,
        referralDiscount: referrals[0].referralDiscount,
        commissionEarned: referrals[0].commissionEarned,
        referralType: referrals[0].referralType,
        discountType: referrals[0].discountType
      });
    }

    res.json({
      success: true,
      data: referrals,
      totalReferrals: referrals.length,
      totalCommission: referrals.reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
      totalDiscount: referrals.reduce((sum, r) => sum + (r.referralDiscount || 0), 0)
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referral data",
      error: error.message
    });
  }
};




export const getReferralStats = async (req, res) => {
  try {
    const stats = await orderModel.aggregate([
      {
        $match: {
          $or: [
            { referredBy: { $exists: true, $ne: null } },
          ],
          payment: true
        }
      },
      {
        $facet: {
          // Direct referral stats
          directReferrals: [
            {
              $match: {
                referredBy: { $exists: true, $ne: null }
              }
            },
            {
              $group: {
                _id: "$referredBy",
                totalOrders: { $sum: 1 },
                totalCommission: { $sum: { $toDouble: "$referralCoinsAdded.user" } },
                totalDiscount: { $sum: { $toDouble: "$referralCoinsAdded.referrer" } },
                totalSales: { $sum: { $toDouble: "$amount" } }
              }
            }
          ],

        }
      },
      {
        $project: {
          allStats: {
            $concatArrays: ["$directReferrals",]
          }
        }
      },
      { $unwind: "$allStats" },
      {
        $group: {
          _id: "$allStats._id",
          totalOrders: { $sum: "$allStats.totalOrders" },
          totalCommission: { $sum: "$allStats.totalCommission" },
          totalDiscount: { $sum: "$allStats.totalDiscount" },
          totalSales: { $sum: "$allStats.totalSales" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "referrer"
        }
      },
      {
        $unwind: {
          path: "$referrer",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          referrerName: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$referrer.name", null] },
                  { $ne: ["$referrer.name", ""] }
                ]
              },
              then: "$referrer.name",
              else: "Unknown User"
            }
          },
          referrerEmail: "$referrer.email",
          referrerNumber: "$referrer.number",
          totalOrders: 1,
          totalCommission: 1,
          totalDiscount: 1,
          totalSales: 1,
          averageOrderValue: {
            $cond: {
              if: { $gt: ["$totalOrders", 0] },
              then: { $divide: ["$totalSales", "$totalOrders"] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalCommission: -1 } }
    ]);

    console.log("Enhanced Referral Stats:", stats.length);

    res.json({
      success: true,
      data: stats,
      summary: {
        totalReferrers: stats.length,
        totalCommission: stats.reduce((sum, stat) => sum + stat.totalCommission, 0),
        totalSales: stats.reduce((sum, stat) => sum + stat.totalSales, 0),
        totalOrders: stats.reduce((sum, stat) => sum + stat.totalOrders, 0)
      }
    });
  } catch (error) {
    console.error("Error fetching referral statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referral statistics",
      error: error.message
    });
  }
};




export const requestPayout = async (req, res) => {
  try {
    const { method, upiId, bankName, accountNumber, ifsc, amount } = req.body;
    const user = await userModel.findById(req.user.id);

    // ✅ Check for minimum withdrawal limit
    if (amount < 100) {
      return res.status(400).json({ message: "Minimum withdrawal amount is ₹100" });
    }

    if (amount > user.totalCommissionEarned) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const payoutRequest = await PayoutRequest.create({
      user: req.user.id,
      method,
      upiId,
      bankName,
      accountNumber,
      ifsc,
      amount,
    });

    res.json({ success: true, message: "Payout request submitted", payoutRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




// ✅ 1. USER: Fetch payout history (logged-in user)
export const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await PayoutRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, payouts });
  } catch (error) {
    console.error("Error fetching user payout history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 2. ADMIN: Fetch all payout requests
export const getAllPayouts = async (req, res) => {
  try {
    const payouts = await PayoutRequest.find()
      .populate("user", "name number email") // populate basic user details
      .sort({ createdAt: -1 });

    res.json({ success: true, payouts });
  } catch (error) {
    console.error("Error fetching all payouts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const updatePayoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const payout = await PayoutRequest.findById(id).populate("user");
    if (!payout) {
      return res.status(404).json({ success: false, message: "Payout not found" });
    }

    // ✅ If already approved or rejected, do nothing
    if (payout.status === "Approved" || payout.status === "Rejected") {
      return res.status(400).json({ success: false, message: "Payout already processed" });
    }

    payout.status = status;
    await payout.save();

    // ✅ Deduct commission only if approved
    if (status === "Approved") {
      const user = payout.user;

      // Ensure user.totalCommissionEarned is not negative
      user.totalCommissionEarned = Math.max(0, user.totalCommissionEarned - payout.amount);
      await user.save();
    }

    res.json({ success: true, message: `Payout ${status}`, payout });
  } catch (error) {
    console.error("Error updating payout status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const getTotalEarnings = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const totalApproved = await PayoutRequest.aggregate([
      { $match: { user: userId, status: "Approved" } },
      { $group: { _id: null, totalReceived: { $sum: "$amount" } } },
    ]);

    console.log(totalApproved);

    res.json({
      success: true,
      totalEarnings: totalApproved[0]?.totalReceived || 0,
    });
  } catch (error) {
    console.error("Error calculating total earnings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const allUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addUserAddress = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address1,
      address2,
      addresstype,
      city,
      state,
      postalCode,
      landmark,
      isDefault,
    } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newAddress = {
      fullName,
      email,
      phone,
      address1,
      address2,
      addresstype,
      city,
      state,
      postalCode,
      landmark,
      isDefault: isDefault || false,
    };

    user.address.push(newAddress);
    await userModel.findByIdAndUpdate(user._id, { address: user.address });

    res.json({ success: true, message: "Address added successfully", user });
  } catch (error) {
    console.error("❌ Add Address Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserAddress = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, address: user.address });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.address = user.address.filter(
      (address) => address._id.toString() !== addressId
    );

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "Address deleted successfully",
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { fullName, email, phone, address1, address2, addresstype, city, state, postalCode, landmark } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.address.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (fullName) address.fullName = fullName;
    if (email) address.email = email;
    if (phone) address.phone = phone;
    if (address1) address.address1 = address1;
    if (address2) address.address2 = address2;
    if (addresstype) address.addresstype = addresstype;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (landmark) address.landmark = landmark;

    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      address: user.address,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const edituser = async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (req.file) {
      user.img = `/uploads/blogs/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get user wallet coins
export const getWalletCoins = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('walletCoins');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ 
      success: true, 
      walletCoins: user.walletCoins || 0 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Deduct wallet coins after order
export const deductWalletCoins = async (req, res) => {
  try {
    const { userId, coinsUsed } = req.body;
    
    await userModel.findByIdAndUpdate(userId, {
      $inc: { walletCoins: -coinsUsed }
    });
    
    res.json({ success: true, message: "Coins deducted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};





// Add this function to periodically clean up expired OTPs
export const cleanupExpiredOtps = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await otpModel.deleteMany({
      createdAt: { $lt: fiveMinutesAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired OTPs`);
    }
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
  }
};

// Run cleanup every 10 minutes
setInterval(cleanupExpiredOtps, 10 * 60 * 1000);








// Add this to your authController
export const checkOtpStatus = async (req, res) => {
  try {
    const { number } = req.query;

    if (!number) {
      return res.status(400).json({ success: false, message: "Number is required" });
    }

    const otps = await otpModel.find({ number }).sort({ createdAt: -1 });
    const now = new Date();

    res.json({
      success: true,
      number,
      currentTime: now,
      otps: otps.map(otp => ({
        otp: otp.otp,
        createdAt: otp.createdAt,
        ageSeconds: Math.round((now - new Date(otp.createdAt)) / 1000),
        isExpired: (now - new Date(otp.createdAt)) > 5 * 60 * 1000
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

