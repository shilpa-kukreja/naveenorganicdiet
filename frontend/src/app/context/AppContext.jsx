// "use client";

// import { useRouter } from "next/navigation";
// import { useContext, createContext, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useState } from "react";


// export const AppContext = createContext();

// export const useAppContext = () => {
//   return useContext(AppContext);
// }

// export const AppContextProvider = ({ children }) => {
//   const router = useRouter();
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [wishlist, setWishlist] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [blogs, setBlogs] = useState([]);
//   const [token, setToken] = useState(null);



//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
//       setCartItems(savedCart);

//       const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
//       setWishlist(savedWishlist);
//     }
//   }, []);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('cart', JSON.stringify(cartItems));
//     }
//   }, [cartItems]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('wishlist', JSON.stringify(wishlist));
//     }
//   }, [wishlist]);


//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedToken = localStorage.getItem('token');
//       setToken(storedToken);
//     }
//   }, []);



//   const addToCart = (product, discountPrice, quantity) => {
//     const cartItem = {
//       id: product._id,
//       slug: product.slug,
//       name: product.name,
//       image: `http://localhost:5000${product.thumbImg}`, // ✅ fixed
//       quantity: quantity,
//       pack: product.pack,
//       price: discountPrice ? discountPrice : product.price,
//     };


//     let updatedCart = [...cartItems];
//     const existingItemIndex = updatedCart.findIndex(
//       item => item.id === product._id
//     );

//     if (existingItemIndex >= 0) {
//       // Update quantity if item already in cart
//       updatedCart[existingItemIndex].quantity += quantity;
//     } else {
//       // Add new item to cart
//       updatedCart.push(cartItem);
//     }

//     setCartItems(updatedCart);

//   };

//   const removeFromCart = (itemId) => {
//     const updatedCart = cartItems.filter(
//       item => item.id !== itemId
//     );
//     setCartItems(updatedCart);
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   const getCartCount = () => {
//     return cartItems.reduce((total, item) => total + item.quantity, 0);
//   };


//   const updateCartItemQuantity = (itemId, newQuantity) => {
//     if (newQuantity < 1) return;

//     const updatedCart = cartItems.map(item => {
//       if (item.id === itemId) {
//         return { ...item, quantity: newQuantity };
//       }
//       return item;
//     });

//     setCartItems(updatedCart);
//   };


//   const calculateCartTotal = () => {
//     return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };





//   /**
//    * Save abandoned cart to backend
//    */
//   const saveAbandonedCart = useCallback(async () => {
//     if (!token || !cartItems.length) return;

//     try {
//       await axios.post(
//         "/api/abandoned-cart/save",
//         {
//           items: cartItems.map(item => ({
//             productId: item.id || item._id,
//             name: item.name,
//             quantity: item.quantity,
//             price: item.price,
//             productUpdatedAt: new Date() // This should come from product data
//           }))
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
//     } catch (error) {
//       console.error("Failed to save abandoned cart:", error);
//     }
//   }, [cartItems, token])



"use client";

import { useRouter } from "next/navigation";
import { useContext, createContext, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [token, setToken] = useState(null);

  // Initialize cart and wishlist from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(savedCart);

      const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      setWishlist(savedWishlist);

      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

// Replace your current saveAbandonedCart function with this:

// context/AppContext.js - Update saveAbandonedCart function

// Cart abandonment tracking with debouncing
const saveAbandonedCart = useCallback(async () => {
  if (!token || !cartItems.length) {
    return;
  }

  try {
    const itemsToSave = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
      pack: item.pack
    }));

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/abandonedcart/save`,
      { items: itemsToSave },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Cart saved for reminders:", response.data);
  } catch (error) {
    console.error("Failed to save abandoned cart:", error.message);
  }
}, [cartItems, token]);

// Add debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Debounced cart save function
const debouncedSaveCart = useRef(
  debounce(() => {
    saveAbandonedCart();
  }, 30000) // 30 seconds debounce
).current;

// Track cart changes
useEffect(() => {
  if (token && cartItems.length > 0) {
    console.log("🛒 Cart changed, scheduling save...");
    debouncedSaveCart();
  }
}, [cartItems, token, debouncedSaveCart]);

// Also save when user leaves page
useEffect(() => {
  const handleBeforeUnload = () => {
    if (token && cartItems.length > 0) {
      // Send beacon or sync call
      saveAbandonedCart();
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [cartItems, token, saveAbandonedCart]);



// Add this function to trigger save on cart changes
useEffect(() => {
  if (token && cartItems.length > 0) {
    const saveTimeout = setTimeout(() => {
      saveAbandonedCart();
    }, 30000); // Save after 30 seconds of inactivity
    
    return () => clearTimeout(saveTimeout);
  }
}, [cartItems, token, saveAbandonedCart]);

useEffect(() => {
  const token = localStorage.getItem('token');
  console.log("Token from localStorage:", token);
}, []);

  /**
   * Add to cart with product validation
   */
  const addToCart = async (product, discountPrice, quantity = 1) => {
    try {
      const cartItem = {
        id: product._id,
        slug: product.slug,
        name: product.name,
        image: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.thumbImg}`,
        quantity: quantity,
        pack: product.pack,
        price: discountPrice || product.price,
        updatedAt: product.updatedAt
      };

      let updatedCart = [...cartItems];
      console.log("Current cart items:", updatedCart);
      const existingItemIndex = updatedCart.findIndex(
        item => item.id === product._id
      );

      if (existingItemIndex >= 0) {
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        updatedCart.push(cartItem);
      }

      setCartItems(updatedCart);
      toast.success(`${product.name} added to cart!`);
      
      // Save abandoned cart after delay
      setTimeout(() => {
        saveAbandonedCart();
      }, 2000);
      
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  /**
   * Remove from cart
   */
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    toast.success("Item removed from cart");
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Update cart item quantity
   */
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
  };

  /**
   * Get cart count
   */
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Calculate cart total
   */
  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  /**
   * Merge guest cart with user cart after login
   */
  const mergeGuestCart = async () => {
    if (!token) return;

    const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (guestCart.length > 0) {
      try {
        await axios.post(
          "http://localhost:5000/api/cart/merge",
          { items: guestCart },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        localStorage.removeItem("cart");
      } catch (error) {
        console.error("Failed to merge cart:", error);
      }
    }
  };

  useEffect(() => {
    mergeGuestCart();
  }, [token]);

  // Save abandoned cart on component unmount
  useEffect(() => {
    return () => {
      if (token && cartItems.length > 0) {
        saveAbandonedCart();
      }
    };
  }, [token, cartItems, saveAbandonedCart]);

  




  const toggleWishlist = (product) => {
    const productId = typeof product === 'object' ? product._id || product.id : product;

    if (!productId) return;

    setWishlist(prevWishlist => {
      const isWishlisted = prevWishlist.some(
        item => (item._id || item.id) === productId
      );

      let updatedWishlist;

      if (isWishlisted) {
        updatedWishlist = prevWishlist.filter(
          item => (item._id || item.id) !== productId
        );
      } else {
        if (typeof product === 'object') {
          updatedWishlist = [...prevWishlist, product];
        } else {
          updatedWishlist = prevWishlist;
        }
      }

      return updatedWishlist;
    });
  };


  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };


  const getwhichlistcount = () => {
    return wishlist.length;

  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category/get");

      // CORRECTED: Use res.data directly since backend returns array
      // console.log("API Response:", res.data); // This should show your categories array
      setCategories(res.data || []);
      console.log("categories", categories);

    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error("Fetch error:", error);
      setCategories([]);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);


  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/product/products");
      if (res.data?.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchProducts();
  }, []);





  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/blog/blogs");

        if (response.data && Array.isArray(response.data)) {
          setBlogs(response.data);
        } else {
          setBlogs([]);
          setError("Invalid data format received from server");
        }
      } catch (error) {
        console.error("Error fetching blogs", error);
        setError("Failed to load blogs. Please try again later.");
        setBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  console.log("blogs", blogs);

  const value = {
    categories,
    cartItems,
    blogs,
    setBlogs,
    setCartItems,
    addToCart,
    removeFromCart,
    token,
    setToken,
    clearCart,
    toggleWishlist,
    getwhichlistcount,
    wishlist,
    setWishlist,
    isInWishlist,
    getCartCount,
    updateCartItemQuantity,
    calculateCartTotal,
    products,
    setCategories,
    setProducts
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
