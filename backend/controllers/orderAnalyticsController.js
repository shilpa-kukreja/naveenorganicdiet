import orderModel from "../models/orderModel.js";
import userModel from "../models/authModel.js";

// ✅ COMPLETE ORDER ANALYTICS WITH CONDITIONAL DATA
const getOrderAnalytics = async (req, res) => {
    try {
        // Fetch all orders with proper population
        const allOrders = await orderModel
            .find({})
            .populate("userId", "username email number")  // Added number field
            .lean();

        // Data structures
        const userAnalytics = {};
        const productAnalytics = {};
        const monthlyAnalytics = {};
        const yearlyAnalytics = {};
        const userProductMatrix = {}; // User-wise product data
        const productUserMatrix = {}; // Product-wise user data

        allOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const year = orderDate.getFullYear();
            const month = orderDate.getMonth() + 1;
            const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;
            const monthName = orderDate.toLocaleString('default', { month: 'short' });
            const monthYearKey = `${monthName} ${year}`;

            // ================= USER ANALYTICS =================
            if (order.userId) {
                const uId = order.userId._id.toString();
                const userNumber = order.userId.number;

                if (!userAnalytics[uId]) {
                    userAnalytics[uId] = {
                        user: {
                            id: order.userId._id,
                            username: order.userId.username || 'No Name',
                            email: order.userId.email || 'No Email',
                            number: userNumber || 'No Number'
                        },
                        totalOrders: 0,
                        totalAmount: 0,
                        monthlyOrders: [],
                        yearlyOrders: [],
                        products: [],
                        monthlyData: {},  // For detailed monthly breakdown
                        yearlyData: {}    // For detailed yearly breakdown
                    };
                }

                userAnalytics[uId].totalOrders += 1;
                userAnalytics[uId].totalAmount += order.amount;

                // Monthly breakdown (condensed)
                if (!userAnalytics[uId].monthlyData[yearMonth]) {
                    userAnalytics[uId].monthlyData[yearMonth] = {
                        month: monthYearKey,
                        orders: 0,
                        amount: 0
                    };
                }
                userAnalytics[uId].monthlyData[yearMonth].orders++;
                userAnalytics[uId].monthlyData[yearMonth].amount += order.amount;

                // Yearly breakdown (condensed)
                if (!userAnalytics[uId].yearlyData[year]) {
                    userAnalytics[uId].yearlyData[year] = {
                        year: year.toString(),
                        orders: 0,
                        amount: 0
                    };
                }
                userAnalytics[uId].yearlyData[year].orders++;
                userAnalytics[uId].yearlyData[year].amount += order.amount;

                // User-Product mapping
                if (!userProductMatrix[uId]) {
                    userProductMatrix[uId] = {
                        user: {
                            username: order.userId.username,
                            number: userNumber,
                            email: order.userId.email
                        },
                        products: {}
                    };
                }

                // Process each item in order
                order.items.forEach(item => {
                    const pId = item.productId.toString();

                    // User's product analytics
                    let userProduct = userAnalytics[uId].products.find(p => p.productId === pId);
                    if (!userProduct) {
                        userProduct = {
                            productId: pId,
                            productName: item.name,
                            totalQuantity: 0,
                            totalAmount: 0,
                            orders: 0
                        };
                        userAnalytics[uId].products.push(userProduct);
                    }
                    userProduct.totalQuantity += item.quantity;
                    userProduct.totalAmount += item.price * item.quantity;
                    userProduct.orders++;

                    // User-Product Matrix
                    if (!userProductMatrix[uId].products[pId]) {
                        userProductMatrix[uId].products[pId] = {
                            productName: item.name,
                            quantity: 0,
                            amount: 0,
                            orderCount: 0
                        };
                    }
                    userProductMatrix[uId].products[pId].quantity += item.quantity;
                    userProductMatrix[uId].products[pId].amount += item.price * item.quantity;
                    userProductMatrix[uId].products[pId].orderCount++;
                });
            }

            // ================= PRODUCT ANALYTICS =================
            order.items.forEach(item => {
                const pId = item.productId.toString();

                if (!productAnalytics[pId]) {
                    productAnalytics[pId] = {
                        productId: pId,
                        productName: item.name,
                        totalQuantity: 0,
                        totalAmount: 0,
                        totalOrders: 0,
                        users: [],
                        monthlySales: {},
                        yearlySales: {},
                        userDetails: []  // Detailed user info with number
                    };
                }

                productAnalytics[pId].totalQuantity += item.quantity;
                productAnalytics[pId].totalAmount += item.price * item.quantity;
                productAnalytics[pId].totalOrders++;

                // Product-User mapping with number
                if (order.userId) {
                    const uId = order.userId._id.toString();
                    const userNumber = order.userId.number;

                    // Check if user already exists in product's user list
                    let productUser = productAnalytics[pId].users.find(u => u.userId === uId);
                    if (!productUser) {
                        productUser = {
                            userId: uId,
                            username: order.userId.username,
                            number: userNumber,
                            email: order.userId.email,
                            totalQuantity: 0,
                            totalAmount: 0,
                            orders: 0
                        };
                        productAnalytics[pId].users.push(productUser);
                    }
                    productUser.totalQuantity += item.quantity;
                    productUser.totalAmount += item.price * item.quantity;
                    productUser.orders++;

                    // Detailed user info with number
                    let detailedUser = productAnalytics[pId].userDetails.find(u => u.userId === uId);
                    if (!detailedUser) {
                        detailedUser = {
                            userId: uId,
                            username: order.userId.username,
                            number: userNumber,
                            email: order.userId.email,
                            monthlyPurchases: {},
                            yearlyPurchases: {}
                        };
                        productAnalytics[pId].userDetails.push(detailedUser);
                    }

                    // Monthly purchases by user for this product
                    if (!detailedUser.monthlyPurchases[yearMonth]) {
                        detailedUser.monthlyPurchases[yearMonth] = {
                            month: monthYearKey,
                            quantity: 0,
                            amount: 0,
                            orders: 0
                        };
                    }
                    detailedUser.monthlyPurchases[yearMonth].quantity += item.quantity;
                    detailedUser.monthlyPurchases[yearMonth].amount += item.price * item.quantity;
                    detailedUser.monthlyPurchases[yearMonth].orders++;

                    // Yearly purchases by user for this product
                    if (!detailedUser.yearlyPurchases[year]) {
                        detailedUser.yearlyPurchases[year] = {
                            year: year.toString(),
                            quantity: 0,
                            amount: 0,
                            orders: 0
                        };
                    }
                    detailedUser.yearlyPurchases[year].quantity += item.quantity;
                    detailedUser.yearlyPurchases[year].amount += item.price * item.quantity;
                    detailedUser.yearlyPurchases[year].orders++;

                    // Product-User Matrix
                    if (!productUserMatrix[pId]) {
                        productUserMatrix[pId] = {
                            productName: item.name,
                            users: {}
                        };
                    }
                    if (!productUserMatrix[pId].users[uId]) {
                        productUserMatrix[pId].users[uId] = {
                            username: order.userId.username,
                            number: userNumber,
                            email: order.userId.email,
                            quantity: 0,
                            amount: 0,
                            orderCount: 0
                        };
                    }
                    productUserMatrix[pId].users[uId].quantity += item.quantity;
                    productUserMatrix[pId].users[uId].amount += item.price * item.quantity;
                    productUserMatrix[pId].users[uId].orderCount++;
                }

                // Monthly product sales
                if (!productAnalytics[pId].monthlySales[yearMonth]) {
                    productAnalytics[pId].monthlySales[yearMonth] = {
                        month: monthYearKey,
                        quantity: 0,
                        amount: 0,
                        orders: 0,
                        users: new Set()
                    };
                }
                productAnalytics[pId].monthlySales[yearMonth].quantity += item.quantity;
                productAnalytics[pId].monthlySales[yearMonth].amount += item.price * item.quantity;
                productAnalytics[pId].monthlySales[yearMonth].orders++;
                if (order.userId) {
                    productAnalytics[pId].monthlySales[yearMonth].users.add(order.userId._id.toString());
                }

                // Yearly product sales
                if (!productAnalytics[pId].yearlySales[year]) {
                    productAnalytics[pId].yearlySales[year] = {
                        year: year.toString(),
                        quantity: 0,
                        amount: 0,
                        orders: 0,
                        users: new Set()
                    };
                }
                productAnalytics[pId].yearlySales[year].quantity += item.quantity;
                productAnalytics[pId].yearlySales[year].amount += item.price * item.quantity;
                productAnalytics[pId].yearlySales[year].orders++;
                if (order.userId) {
                    productAnalytics[pId].yearlySales[year].users.add(order.userId._id.toString());
                }
            });

            // ================= OVERALL MONTHLY ANALYTICS =================
            if (!monthlyAnalytics[yearMonth]) {
                monthlyAnalytics[yearMonth] = {
                    month: monthYearKey,
                    totalOrders: 0,
                    totalAmount: 0,
                    totalUsers: new Set(),
                    totalProducts: new Set(),
                    users: new Map(),  // Store user details with orders
                    products: new Map() // Store product details
                };
            }
            monthlyAnalytics[yearMonth].totalOrders++;
            monthlyAnalytics[yearMonth].totalAmount += order.amount;

            if (order.userId) {
                const uId = order.userId._id.toString();
                monthlyAnalytics[yearMonth].totalUsers.add(uId);

                // Store user details
                if (!monthlyAnalytics[yearMonth].users.has(uId)) {
                    monthlyAnalytics[yearMonth].users.set(uId, {
                        username: order.userId.username,
                        number: order.userId.number,
                        email: order.userId.email,
                        orders: 0,
                        amount: 0
                    });
                }
                const userData = monthlyAnalytics[yearMonth].users.get(uId);
                userData.orders++;
                userData.amount += order.amount;
            }

            order.items.forEach(item => {
                const pId = item.productId.toString();
                monthlyAnalytics[yearMonth].totalProducts.add(pId);

                // Store product details
                if (!monthlyAnalytics[yearMonth].products.has(pId)) {
                    monthlyAnalytics[yearMonth].products.set(pId, {
                        productName: item.name,
                        quantity: 0,
                        amount: 0
                    });
                }
                const productData = monthlyAnalytics[yearMonth].products.get(pId);
                productData.quantity += item.quantity;
                productData.amount += item.price * item.quantity;
            });

            // ================= OVERALL YEARLY ANALYTICS =================
            if (!yearlyAnalytics[year]) {
                yearlyAnalytics[year] = {
                    year: year.toString(),
                    totalOrders: 0,
                    totalAmount: 0,
                    totalUsers: new Set(),
                    totalProducts: new Set(),
                    users: new Map(),
                    products: new Map()
                };
            }
            yearlyAnalytics[year].totalOrders++;
            yearlyAnalytics[year].totalAmount += order.amount;

            if (order.userId) {
                const uId = order.userId._id.toString();
                yearlyAnalytics[year].totalUsers.add(uId);

                // Store user details
                if (!yearlyAnalytics[year].users.has(uId)) {
                    yearlyAnalytics[year].users.set(uId, {
                        username: order.userId.username,
                        number: order.userId.number,
                        email: order.userId.email,
                        orders: 0,
                        amount: 0
                    });
                }
                const userData = yearlyAnalytics[year].users.get(uId);
                userData.orders++;
                userData.amount += order.amount;
            }

            order.items.forEach(item => {
                const pId = item.productId.toString();
                yearlyAnalytics[year].totalProducts.add(pId);

                // Store product details
                if (!yearlyAnalytics[year].products.has(pId)) {
                    yearlyAnalytics[year].products.set(pId, {
                        productName: item.name,
                        quantity: 0,
                        amount: 0
                    });
                }
                const productData = yearlyAnalytics[year].products.get(pId);
                productData.quantity += item.quantity;
                productData.amount += item.price * item.quantity;
            });
        });

        // Process user analytics data
        // Process user analytics data
        const processedUserAnalytics = Object.values(userAnalytics).map(user => {
            // Convert monthlyData to array
            const monthlyOrders = Object.values(user.monthlyData).map(data => ({
                month: data.month,
                orders: data.orders,
                amount: data.amount,
                avgAmount: data.orders > 0 ? Number((data.amount / data.orders).toFixed(2)) : 0 // Changed to Number
            })).sort((a, b) => b.month.localeCompare(a.month));

            // Convert yearlyData to array
            const yearlyOrders = Object.values(user.yearlyData).map(data => ({
                year: data.year,
                orders: data.orders,
                amount: data.amount,
                avgAmount: data.orders > 0 ? Number((data.amount / data.orders).toFixed(2)) : 0 // Changed to Number
            })).sort((a, b) => b.year - a.year);

            return {
                ...user,
                monthlyOrders,
                yearlyOrders,
                avgOrderValue: user.totalOrders > 0 ? Number((user.totalAmount / user.totalOrders).toFixed(2)) : 0 // Changed to Number
            };
        });

        // Process product analytics data
        // Process product analytics data
        const processedProductAnalytics = Object.values(productAnalytics).map(product => {
            // Convert monthlySales to array
            const monthlySales = Object.values(product.monthlySales).map(data => ({
                month: data.month,
                quantity: data.quantity,
                amount: data.amount,
                orders: data.orders,
                uniqueUsers: data.users.size,
                avgAmount: data.orders > 0 ? Number((data.amount / data.orders).toFixed(2)) : 0 // Changed to Number
            })).sort((a, b) => b.month.localeCompare(a.month));

            // Convert yearlySales to array
            const yearlySales = Object.values(product.yearlySales).map(data => ({
                year: data.year,
                quantity: data.quantity,
                amount: data.amount,
                orders: data.orders,
                uniqueUsers: data.users.size,
                avgAmount: data.orders > 0 ? Number((data.amount / data.orders).toFixed(2)) : 0 // Changed to Number
            })).sort((a, b) => b.year - a.year);

            // Process user details
            const detailedUsers = product.userDetails.map(user => {
                const monthlyPurchases = Object.values(user.monthlyPurchases).map(data => ({
                    month: data.month,
                    quantity: data.quantity,
                    amount: data.amount,
                    orders: data.orders
                })).sort((a, b) => b.month.localeCompare(a.month));

                const yearlyPurchases = Object.values(user.yearlyPurchases).map(data => ({
                    year: data.year,
                    quantity: data.quantity,
                    amount: data.amount,
                    orders: data.orders
                })).sort((a, b) => b.year - a.year);

                return {
                    userId: user.userId,
                    username: user.username,
                    number: user.number,
                    email: user.email,
                    monthlyPurchases,
                    yearlyPurchases
                };
            });

            return {
                ...product,
                monthlySales,
                yearlySales,
                detailedUsers,
                avgPrice: product.totalQuantity > 0 ? Number((product.totalAmount / product.totalQuantity).toFixed(2)) : 0, // Changed to Number
                avgOrderValue: product.totalOrders > 0 ? Number((product.totalAmount / product.totalOrders).toFixed(2)) : 0 // Changed to Number
            };
        });

        // Process monthly analytics
        // Process monthly analytics
        const processedMonthlyAnalytics = Object.values(monthlyAnalytics).map(data => {
            // Convert Maps to arrays
            const userDetails = Array.from(data.users.values()).map(user => ({
                ...user,
                avgAmount: user.orders > 0 ? Number((user.amount / user.orders).toFixed(2)) : 0 // Changed to Number
            }));

            const productDetails = Array.from(data.products.values());

            return {
                ...data,
                totalUsers: data.totalUsers.size,
                totalProducts: data.totalProducts.size,
                avgOrderValue: data.totalOrders > 0 ? Number((data.totalAmount / data.totalOrders).toFixed(2)) : 0, // Changed to Number
                userDetails,
                productDetails
            };
        }).sort((a, b) => b.month.localeCompare(a.month));

        // Process yearly analytics
        const processedYearlyAnalytics = Object.values(yearlyAnalytics).map(data => {
            // Convert Maps to arrays
            const userDetails = Array.from(data.users.values()).map(user => ({
                ...user,
                avgAmount: user.orders > 0 ? Number((user.amount / user.orders).toFixed(2)) : 0 // Changed to Number
            }));

            const productDetails = Array.from(data.products.values());

            return {
                ...data,
                totalUsers: data.totalUsers.size,
                totalProducts: data.totalProducts.size,
                avgOrderValue: data.totalOrders > 0 ? Number((data.totalAmount / data.totalOrders).toFixed(2)) : 0, // Changed to Number
                userDetails,
                productDetails
            };
        }).sort((a, b) => b.year - a.year);




        // Process matrices
        const processedUserProductMatrix = Object.values(userProductMatrix).map(userData => ({
            user: userData.user,
            products: Object.values(userData.products).map(product => ({
                ...product,
                avgAmount: product.orderCount > 0 ? (product.amount / product.orderCount).toFixed(2) : 0
            }))
        }));

        const processedProductUserMatrix = Object.values(productUserMatrix).map(productData => ({
            productName: productData.productName,
            users: Object.values(productData.users).map(user => ({
                ...user,
                avgAmount: user.orderCount > 0 ? (user.amount / user.orderCount).toFixed(2) : 0
            }))
        }));

        // Response data
        const responseData = {
            success: true,
            summary: {
                totalOrders: allOrders.length,
                totalRevenue: allOrders.reduce((sum, order) => sum + order.amount, 0),
                totalUsers: Object.keys(userAnalytics).length,
                totalProducts: Object.keys(productAnalytics).length,
                avgOrderValue: allOrders.length > 0 ?
                    Number((allOrders.reduce((sum, order) => sum + order.amount, 0) / allOrders.length).toFixed(2)) : 0,
                timePeriod: {
                    startDate: allOrders.length > 0 ? new Date(Math.min(...allOrders.map(o => new Date(o.createdAt)))) : null,
                    endDate: allOrders.length > 0 ? new Date(Math.max(...allOrders.map(o => new Date(o.createdAt)))) : null
                }
            },
            userAnalytics: processedUserAnalytics,
            productAnalytics: processedProductAnalytics,
            monthlyAnalytics: processedMonthlyAnalytics,
            yearlyAnalytics: processedYearlyAnalytics,
            matrices: {
                userProductMatrix: processedUserProductMatrix,  // User-wise product data
                productUserMatrix: processedProductUserMatrix   // Product-wise user data with numbers
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error in getOrderAnalytics:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// Get specific user analytics with detailed product info
const getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;

        const userOrders = await orderModel.find({ userId })
            .populate('userId', 'username email number')
            .lean();

        if (userOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user"
            });
        }

        const analytics = {
            user: userOrders[0].userId,
            totalOrders: userOrders.length,
            totalAmount: userOrders.reduce((sum, order) => sum + order.amount, 0),
            monthlyBreakdown: {},
            yearlyBreakdown: {},
            productBreakdown: {},
            paymentMethods: {},
            monthlyProductBreakdown: {},  // Monthly product-wise data
            yearlyProductBreakdown: {}    // Yearly product-wise data
        };

        userOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const year = orderDate.getFullYear();
            const month = orderDate.getMonth() + 1;
            const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
            const monthName = orderDate.toLocaleString('default', { month: 'short' });
            const monthYearKey = `${monthName} ${year}`;

            // Monthly breakdown
            if (!analytics.monthlyBreakdown[yearMonth]) {
                analytics.monthlyBreakdown[yearMonth] = {
                    month: monthYearKey,
                    orders: 0,
                    amount: 0,
                    products: new Set()
                };
            }
            analytics.monthlyBreakdown[yearMonth].orders++;
            analytics.monthlyBreakdown[yearMonth].amount += order.amount;

            // Yearly breakdown
            if (!analytics.yearlyBreakdown[year]) {
                analytics.yearlyBreakdown[year] = {
                    year: year.toString(),
                    orders: 0,
                    amount: 0,
                    products: new Set()
                };
            }
            analytics.yearlyBreakdown[year].orders++;
            analytics.yearlyBreakdown[year].amount += order.amount;

            // Product breakdown with monthly/yearly tracking
            order.items.forEach(item => {
                const productId = item.productId.toString();
                const productKey = `${item.name}_${productId}`;

                // Main product breakdown
                if (!analytics.productBreakdown[productKey]) {
                    analytics.productBreakdown[productKey] = {
                        productId: productId,
                        productName: item.name,
                        totalQuantity: 0,
                        totalAmount: 0,
                        orders: 0,
                        monthlyData: {},
                        yearlyData: {}
                    };
                }
                analytics.productBreakdown[productKey].totalQuantity += item.quantity;
                analytics.productBreakdown[productKey].totalAmount += (item.price * item.quantity);
                analytics.productBreakdown[productKey].orders++;

                // Add product to monthly breakdown
                analytics.monthlyBreakdown[yearMonth].products.add(productKey);

                // Add product to yearly breakdown
                analytics.yearlyBreakdown[year].products.add(productKey);

                // Monthly product data
                if (!analytics.productBreakdown[productKey].monthlyData[yearMonth]) {
                    analytics.productBreakdown[productKey].monthlyData[yearMonth] = {
                        month: monthYearKey,
                        quantity: 0,
                        amount: 0,
                        orders: 0
                    };
                }
                analytics.productBreakdown[productKey].monthlyData[yearMonth].quantity += item.quantity;
                analytics.productBreakdown[productKey].monthlyData[yearMonth].amount += item.price * item.quantity;
                analytics.productBreakdown[productKey].monthlyData[yearMonth].orders++;

                // Yearly product data
                if (!analytics.productBreakdown[productKey].yearlyData[year]) {
                    analytics.productBreakdown[productKey].yearlyData[year] = {
                        year: year.toString(),
                        quantity: 0,
                        amount: 0,
                        orders: 0
                    };
                }
                analytics.productBreakdown[productKey].yearlyData[year].quantity += item.quantity;
                analytics.productBreakdown[productKey].yearlyData[year].amount += item.price * item.quantity;
                analytics.productBreakdown[productKey].yearlyData[year].orders++;

                // Monthly product breakdown
                if (!analytics.monthlyProductBreakdown[yearMonth]) {
                    analytics.monthlyProductBreakdown[yearMonth] = {};
                }
                if (!analytics.monthlyProductBreakdown[yearMonth][productKey]) {
                    analytics.monthlyProductBreakdown[yearMonth][productKey] = {
                        productName: item.name,
                        quantity: 0,
                        amount: 0
                    };
                }
                analytics.monthlyProductBreakdown[yearMonth][productKey].quantity += item.quantity;
                analytics.monthlyProductBreakdown[yearMonth][productKey].amount += item.price * item.quantity;

                // Yearly product breakdown
                if (!analytics.yearlyProductBreakdown[year]) {
                    analytics.yearlyProductBreakdown[year] = {};
                }
                if (!analytics.yearlyProductBreakdown[year][productKey]) {
                    analytics.yearlyProductBreakdown[year][productKey] = {
                        productName: item.name,
                        quantity: 0,
                        amount: 0
                    };
                }
                analytics.yearlyProductBreakdown[year][productKey].quantity += item.quantity;
                analytics.yearlyProductBreakdown[year][productKey].amount += item.price * item.quantity;
            });

            // Payment methods
            if (!analytics.paymentMethods[order.paymentMethod]) {
                analytics.paymentMethods[order.paymentMethod] = 0;
            }
            analytics.paymentMethods[order.paymentMethod]++;
        });

        // Format data
        analytics.monthlyBreakdown = Object.entries(analytics.monthlyBreakdown)
            .map(([key, data]) => ({
                monthKey: key,
                month: data.month,
                orders: data.orders,
                amount: data.amount,
                avgAmount: data.orders > 0 ? (data.amount / data.orders).toFixed(2) : 0,
                uniqueProducts: data.products.size
            }))
            .sort((a, b) => b.monthKey.localeCompare(a.monthKey));

        analytics.yearlyBreakdown = Object.entries(analytics.yearlyBreakdown)
            .map(([year, data]) => ({
                year: data.year,
                orders: data.orders,
                amount: data.amount,
                avgAmount: data.orders > 0 ? (data.amount / data.orders).toFixed(2) : 0,
                uniqueProducts: data.products.size
            }))
            .sort((a, b) => b.year - a.year);

        // Process product breakdown
        analytics.productBreakdown = Object.values(analytics.productBreakdown).map(product => {
            // Convert monthly data to array
            const monthlyData = Object.values(product.monthlyData)
                .map(data => ({
                    ...data,
                    avgAmount: data.orders > 0 ? (data.amount / data.orders).toFixed(2) : 0
                }))
                .sort((a, b) => b.month.localeCompare(a.month));

            // Convert yearly data to array
            const yearlyData = Object.values(product.yearlyData)
                .map(data => ({
                    ...data,
                    avgAmount: data.orders > 0 ? (data.amount / data.orders).toFixed(2) : 0
                }))
                .sort((a, b) => b.year - a.year);

            return {
                ...product,
                avgPrice: product.totalQuantity > 0 ? (product.totalAmount / product.totalQuantity).toFixed(2) : 0,
                avgOrderValue: product.orders > 0 ? (product.totalAmount / product.orders).toFixed(2) : 0,
                monthlyData,
                yearlyData
            };
        }).sort((a, b) => b.totalAmount - a.totalAmount);

        analytics.paymentMethods = Object.entries(analytics.paymentMethods)
            .map(([method, count]) => ({ method, count, percentage: ((count / analytics.totalOrders) * 100).toFixed(1) + '%' }));

        // Add summary statistics
        analytics.summary = {
            avgOrderValue: analytics.totalOrders > 0 ? (analytics.totalAmount / analytics.totalOrders).toFixed(2) : 0,
            totalProducts: analytics.productBreakdown.length,
            firstOrder: userOrders.length > 0 ?
                new Date(Math.min(...userOrders.map(o => new Date(o.createdAt)))) : null,
            lastOrder: userOrders.length > 0 ?
                new Date(Math.max(...userOrders.map(o => new Date(o.createdAt)))) : null
        };

        res.json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error("Error in getUserAnalytics:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

export { getOrderAnalytics, getUserAnalytics };