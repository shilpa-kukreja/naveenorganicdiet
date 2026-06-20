// import jwt from "jsonwebtoken";

// export const authMiddleware = async (req, res, next) => {
//     try {
//         const token = req.header("Authorization")?.replace("Bearer ", "");

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Access denied. No token provided."
//             });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(401).json({
//             success: false,
//             message: "Invalid token"
//         });
//     }
// };

// // Middleware to check if user is admin
// export const adminMiddleware = (req, res, next) => {
//     if (!req.user || !req.user.isAdmin) {
//         return res.status(403).json({
//             success: false,
//             message: "Access denied. Admin privileges required."
//         });
//     }
//     next();
// };





import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

// Middleware to check if user is admin
export const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
    next();
};

// Middleware to check if user is team member or admin
export const teamMemberMiddleware = (req, res, next) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "team_member")) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Team member or admin privileges required."
        });
    }
    next();
};