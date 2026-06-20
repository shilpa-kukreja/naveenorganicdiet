import jwt from "jsonwebtoken";

/**
 * Generate restore token for abandoned cart
 */
export const generateRestoreToken = () => {
  return jwt.sign(
    { 
      type: 'cart_restore',
      timestamp: Date.now() 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};
