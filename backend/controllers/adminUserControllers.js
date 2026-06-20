// import AdminUser from "../models/adminUserModel.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // Create new admin user
// export const createAdminUser = async (req, res) => {
//     try {
//         const { name, email, password, role, isAdmin } = req.body;

//         // Check if user already exists
//         const existingUser = await AdminUser.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Admin user with this email already exists"
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create new admin user
//         const adminUser = new AdminUser({
//             name,
//             email,
//             password: hashedPassword,
//             role: role || "admin",
//             isAdmin: isAdmin || false
//         });

//         await adminUser.save();

//         // Remove password from response
//         const userResponse = adminUser.toObject();
//         delete userResponse.password;

//         res.status(201).json({
//             success: true,
//             message: "Admin user created successfully",
//             data: userResponse
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error creating admin user",
//             error: error.message
//         });
//     }
// };

// // Get all admin users
// export const getAllAdminUsers = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search } = req.query;
        
//         const query = {};
//         if (search) {
//             query.$or = [
//                 { name: { $regex: search, $options: "i" } },
//                 { email: { $regex: search, $options: "i" } }
//             ];
//         }

//         const adminUsers = await AdminUser.find(query)
//             .select("-password")
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ createdAt: -1 });

//         const total = await AdminUser.countDocuments(query);

//         res.status(200).json({
//             success: true,
//             data: adminUsers,
//             pagination: {
//                 currentPage: parseInt(page),
//                 totalPages: Math.ceil(total / limit),
//                 totalUsers: total,
//                 hasNext: page < Math.ceil(total / limit),
//                 hasPrev: page > 1
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error fetching admin users",
//             error: error.message
//         });
//     }
// };

// // Get admin user by ID
// export const getAdminUserById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid admin user ID"
//             });
//         }

//         const adminUser = await AdminUser.findById(id).select("-password");

//         if (!adminUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Admin user not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: adminUser
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error fetching admin user",
//             error: error.message
//         });
//     }
// };

// // Update admin user
// export const updateAdminUser = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, email, role, isAdmin, password } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid admin user ID"
//             });
//         }

//         const updateData = { name, email, role, isAdmin };

//         // If password is provided, hash it
//         if (password) {
//             updateData.password = await bcrypt.hash(password, 12);
//         }

//         // Check if email already exists for other users
//         if (email) {
//             const existingUser = await AdminUser.findOne({ 
//                 email, 
//                 _id: { $ne: id } 
//             });
//             if (existingUser) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Email already exists for another admin user"
//                 });
//             }
//         }

//         const updatedAdminUser = await AdminUser.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         ).select("-password");

//         if (!updatedAdminUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Admin user not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Admin user updated successfully",
//             data: updatedAdminUser
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error updating admin user",
//             error: error.message
//         });
//     }
// };

// // Delete admin user
// export const deleteAdminUser = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid admin user ID"
//             });
//         }

//         const deletedAdminUser = await AdminUser.findByIdAndDelete(id);

//         if (!deletedAdminUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Admin user not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Admin user deleted successfully"
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error deleting admin user",
//             error: error.message
//         });
//     }
// };

// // Admin login
// export const loginAdmin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find admin user by email
//         const adminUser = await AdminUser.findOne({ email });
//         if (!adminUser) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         // Check password
//         const isPasswordValid = await bcrypt.compare(password, adminUser.password);
//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { 
//                 userId: adminUser._id, 
//                 email: adminUser.email,
//                 role: adminUser.role,
//                 isAdmin: adminUser.isAdmin
//             },
//             process.env.JWT_SECRET || "your-secret-key",
//             { expiresIn: "24h" }
//         );

//         // Remove password from response
//         const userResponse = adminUser.toObject();
//         delete userResponse.password;

//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             data: {
//                 user: userResponse,
//                 token
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error during login",
//             error: error.message
//         });
//     }
// };





// // Get current admin user profile
// export const getCurrentAdminProfile = async (req, res) => {
//     try {
//         // Assuming you have middleware that adds user info to req.user
//         const adminUser = await AdminUser.findById(req.user.userId).select("-password");

//         if (!adminUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Admin user not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: adminUser
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error fetching admin profile",
//             error: error.message
//         });
//     }
// };

// // Change password
// export const changePassword = async (req, res) => {
//     try {
//         const { currentPassword, newPassword } = req.body;
//         const userId = req.user.userId; // From auth middleware

//         const adminUser = await AdminUser.findById(userId);
//         if (!adminUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Admin user not found"
//             });
//         }

//         // Verify current password
//         const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password);
//         if (!isCurrentPasswordValid) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Current password is incorrect"
//             });
//         }

//         // Hash new password
//         const hashedNewPassword = await bcrypt.hash(newPassword, 12);

//         // Update password
//         adminUser.password = hashedNewPassword;
//         await adminUser.save();

//         res.status(200).json({
//             success: true,
//             message: "Password changed successfully"
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error changing password",
//             error: error.message
//         });
//     }
// };






import AdminUser from "../models/adminUserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Send welcome email to team member
const sendWelcomeEmail = async (email, name, password) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our Team - Admin Portal Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Team!</h2>
          <p>Hello ${name},</p>
          <p>You have been added as a team member to our admin portal. Here are your login credentials:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Login URL:</strong> ${process.env.FRONTEND_URL}/admin/login</p>
          </div>
          <p>Please login and change your password after first login.</p>
          <p>Best regards,<br>Admin Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Create admin user or team member
export const createAdminUser = async (req, res) => {
    try {
        const { name, email, password, role, isAdmin, phone } = req.body;

        // Check if user already exists
        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const adminUser = new AdminUser({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            role: role || "team_member",
            isAdmin: isAdmin || false
        });

        await adminUser.save();

        // Send welcome email if it's a team member
        if (role === "team_member" || !isAdmin) {
            await sendWelcomeEmail(email, name, password);
        }

        // Remove password from response
        const userResponse = adminUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: role === "admin" ? "Admin user created successfully" : "Team member added successfully",
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
};

// Get all admin users and team members with filtering
export const getAllAdminUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role } = req.query;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const adminUsers = await AdminUser.find(query)
            .select("-password")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await AdminUser.countDocuments(query);

        res.status(200).json({
            success: true,
            data: adminUsers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Get current user profile
// export const getCurrentAdminProfile = async (req, res) => {
//     try {
//         const adminUser = await AdminUser.findById(req.user.userId).select("-password");

//         if (!adminUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: adminUser
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error fetching user profile",
//             error: error.message
//         });
//     }
// };

export const getCurrentAdminProfile = async (req, res) => {
    try {
        const adminUser = await AdminUser.findById(req.user.userId).select("-password");

        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Convert to object and ensure isAdmin is included
        const userResponse = adminUser.toObject();
        userResponse.isAdmin = adminUser.isAdmin;

        res.status(200).json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error.message
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const adminUser = await AdminUser.findById(userId);
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check current password
        const isPasswordValid = await bcrypt.compare(currentPassword, adminUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        adminUser.password = await bcrypt.hash(newPassword, 12);
        await adminUser.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error changing password",
            error: error.message
        });
    }
};

// Admin login
// export const loginAdmin = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         console.log('Login attempt:', { email });

//         // Find user by email
//         const adminUser = await AdminUser.findOne({ email, isActive: true });
//         console.log('User found:', adminUser ? 'Yes' : 'No');
        
//         if (!adminUser) {
//             console.log('User not found or inactive');
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         // Check password
//         const isPasswordValid = await bcrypt.compare(password, adminUser.password);
//         console.log('Password valid:', isPasswordValid);
        
//         if (!isPasswordValid) {
//             console.log('Invalid password');
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { 
//                 userId: adminUser._id, 
//                 email: adminUser.email,
//                 role: adminUser.role,
//                 isAdmin: adminUser.isAdmin
//             },
//             process.env.JWT_SECRET || "your-secret-key",
//             { expiresIn: "24h" }
//         );

//         // Remove password from response
//         const userResponse = adminUser.toObject();
//         delete userResponse.password;

//         console.log('Login successful for user:', adminUser.email);
        
//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             data: {
//                 user: userResponse,
//                 token
//             }
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({
//             success: false,
//             message: "Error during login",
//             error: error.message
//         });
//     }
// };


export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        // Find user by email
        const adminUser = await AdminUser.findOne({ email, isActive: true });
        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        console.log(adminUser);

        // Check password
        const isPasswordValid = await bcrypt.compare(password, adminUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: adminUser._id, 
                email: adminUser.email,
                role: adminUser.role,
                isAdmin: adminUser.isAdmin // Include isAdmin in token
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        // Remove password from response
        const userResponse = adminUser.toObject();
        delete userResponse.password;
        
        // Ensure isAdmin is included in the response
        userResponse.isAdmin = adminUser.isAdmin;
        console.log('User response:', userResponse);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message
        });
    }
};

// Get admin user by ID
export const getAdminUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const adminUser = await AdminUser.findById(id).select("-password");

        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: adminUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

// Update admin user
export const updateAdminUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isAdmin, phone, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const updateData = { name, email, role, isAdmin, phone, isActive };

        // Check if email already exists for other users
        if (email) {
            const existingUser = await AdminUser.findOne({ 
                email, 
                _id: { $ne: id } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists for another user"
                });
            }
        }

        const updatedAdminUser = await AdminUser.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedAdminUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedAdminUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

// Delete admin user
export const deleteAdminUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const deletedAdminUser = await AdminUser.findByIdAndDelete(id);

        if (!deletedAdminUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};