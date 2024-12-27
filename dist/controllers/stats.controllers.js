import { myCache } from "../app.js";
import { tryCatch } from "../middleware/errorMiddleware.js";
import { Order } from "../models/orders.schema.js";
import { Product } from "../models/products.models.js";
import { User } from "../models/user.models.js";
import { calculatePercentage, getCategory, getChartData, } from "../utils/features.js";
export const getDashboardStats = tryCatch(async (req, res, next) => {
    let stats = {};
    if (myCache.has("admin-stats")) {
        stats = JSON.parse(myCache.get("admin-stats"));
    }
    else {
        const today = new Date();
        const currentMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0),
        };
        const lastSixMonths = {
            start: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
            end: today,
        };
        const currentMonthProductsPromise = await Product.find({
            createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
        });
        const lastMonthProductsPromise = await Product.find({
            createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
        });
        const currentMonthUsersPromise = await User.find({
            createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
        });
        const lastMonthUsersPromise = await User.find({
            createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
        });
        const currentMonthOrdersPromise = await Order.find({
            createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
        });
        const lastMonthOrdersPromise = await Order.find({
            createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
        });
        const lastSixMonthOrdersPromise = await Order.find({
            createdAt: { $gte: lastSixMonths.start, $lte: lastSixMonths.end },
        });
        let categoriesPromise = await Product.distinct("category");
        const topTrantactionPromise = await Order.find({})
            .select(["orderItems", "discount", "total", "status"])
            .limit(4);
        const [currentMonthProducts, lastMonthProducts, currentMonthUsers, lastMonthUsers, currentMonthOrders, lastMonthOrders, usersCount, productsCount, allOrders, lastSixMonthOrders, categories, usersfemaleCounts, topTrantaction,] = await Promise.all([
            currentMonthProductsPromise,
            lastMonthProductsPromise,
            currentMonthUsersPromise,
            lastMonthUsersPromise,
            currentMonthOrdersPromise,
            lastMonthOrdersPromise,
            User.countDocuments(),
            Product.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            categoriesPromise,
            User.countDocuments({ gender: "male" }),
            topTrantactionPromise,
        ]);
        const currentMonthRevenue = currentMonthOrders.reduce((total, order) => {
            return total + (order?.total || 0);
        }, 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => {
            return total + (order?.total || 0);
        }, 0);
        const productsPercentage = calculatePercentage(currentMonthProducts.length, lastMonthProducts.length);
        const usersPercentage = calculatePercentage(currentMonthUsers.length, lastMonthUsers.length);
        const ordersPercentage = calculatePercentage(currentMonthOrders.length, lastMonthOrders.length);
        const reveneuePercentage = calculatePercentage(currentMonthRevenue, lastMonthRevenue);
        const count = {
            users: usersCount,
            products: productsCount,
            orders: allOrders.length,
        };
        const orderMonthsCounts = new Array(6).fill(0);
        const orderMonthlyReveneu = new Array(6).fill(0);
        //  const lastSixMonthsOrder =lastSixMonthOrders.length
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthsDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
            if (monthsDiff < 6) {
                orderMonthsCounts[6 - monthsDiff - 1] += 1;
                orderMonthlyReveneu[6 - monthsDiff - 1] += order.total;
            }
        });
        const categoriesCount = await getCategory({
            categories,
            productsCount,
        });
        // let categoriesCount: Record<string, number>[] = [];
        // const categoryCountsPromise = categories.map((category) =>
        //   Product.countDocuments({ category })
        // );
        // const categoryCounts = await Promise.all(categoryCountsPromise);
        // categories.forEach((category, i) => {
        //   categoriesCount.push({
        //     [category]: Math.round((categoryCounts[i] / productsCount) * 100),
        //   });
        // });
        // const userCounts= userGender.map((gender) =>
        //   User.countDocuments({gender} )
        // )
        //how many are there male female
        const genderRatio = {
            female: Math.round((usersfemaleCounts / usersCount) * 100),
            male: Math.round(((usersCount - usersfemaleCounts) / usersCount) * 100),
        };
        // inventory
        const modifiedTopTrantaction = topTrantaction.map((i) => ({
            _id: i._id,
            quantity: i.orderItems.length,
            status: i.status,
            amount: i.total,
            discount: i.discount,
        }));
        stats = {
            productsPercentage,
            usersPercentage,
            ordersPercentage,
            reveneuePercentage,
            count,
            lastSixMonthOrders,
            carts: {
                orderMonthsCounts,
                orderMonthlyReveneu,
            },
            categoriesCount,
            genderRatio,
            topTrantaction: modifiedTopTrantaction,
        };
        myCache.set("admin-stats", JSON.stringify(stats));
    }
    console.log(stats);
    res.status(200).json({
        success: true,
        stats,
    });
});
export const getPieCharts = tryCatch(async (req, res, next) => {
    let charts = {};
    if (myCache.has("admin-pie-charts")) {
        charts = JSON.parse(myCache.get("admin-pie-charts"));
    }
    else {
        const allOrderPromise = Order.find({}).select([
            "tax",
            "shippingCharge",
            "total",
            "subtotal",
            "discount",
        ]);
        const [ordersProcessing, ordersShipped, ordersDelivered, categories, productsCount, outofStock, allOrders, allUsers, adminUsers, customerUsers,] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Order.countDocuments({ stock: 0 }),
            allOrderPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ]);
        const productCategories = await getCategory({
            categories,
            productsCount,
        });
        const orderFullfillmets = {
            Processing: ordersProcessing,
            Shipped: ordersShipped,
            Delivered: ordersDelivered,
        };
        const stockAvailability = {
            InStock: productsCount - outofStock,
            outofStock,
        };
        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;
        const reveneuDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };
        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length,
        };
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };
        charts = {
            orderFullfillmets,
            productCategories,
            stockAvailability,
            reveneuDistribution,
            usersAgeGroup,
            adminCustomer,
        };
        myCache.set("admin-pie-charts", JSON.stringify(charts));
    }
    res.status(200).json({
        success: true,
        charts,
    });
});
export const getBarCharts = tryCatch(async (req, res, next) => {
    let charts = {};
    if (myCache.has("admin-bar-charts")) {
        charts = JSON.parse(myCache.get("admin-bar-charts"));
    }
    else {
        const today = new Date();
        const lastSixMonths = {
            start: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
            end: today,
        };
        const twelveMonthsAgo = {
            start: new Date(today.getFullYear(), today.getMonth() - 12, today.getDate()),
            end: today,
        };
        const sixMonthProductPromise = Product.find({
            createdAt: {
                $gte: lastSixMonths.start,
                $lte: lastSixMonths.end,
            },
        }).select("createdAt");
        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastSixMonths.start,
                $lte: lastSixMonths.end,
            },
        }).select("createdAt");
        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo.start,
                $lte: twelveMonthsAgo.end,
            },
        }).select("createdAt");
        const [products, users, orders] = await Promise.all([
            sixMonthProductPromise,
            sixMonthUsersPromise,
            twelveMonthOrdersPromise,
        ]);
        const productCounts = getChartData({ length: 6, docArr: products });
        const usersCounts = getChartData({ length: 6, docArr: users });
        const ordersCounts = getChartData({ length: 12, docArr: orders });
        charts = {
            products: productCounts,
            users: usersCounts,
            orders: ordersCounts,
        };
        myCache.set("admin-bar-charts", JSON.stringify(charts));
    }
    res.status(200).json({
        success: true,
        charts,
    });
});
export const getLineCharts = tryCatch(async () => { });
