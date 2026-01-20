/* eslint-disable no-throw-literal */
/* eslint-disable new-cap */

const {Auth, logger} = require("./config/firebase");
const express = require("express");
const router = express.Router();
// import necessary Models
const Admin = require("./models/admin");


const Validation = require("./validation");

// import necessary functions
const CustomFunctions = require("./custom_functions");

router.post("/register", async (req, res) => {
    console.log(req.body);
    // eslint-disable-next-line no-unused-vars
    const {email, phone, password, fullname} = req.body;
    // validate request
    // const newCustomer = new Admin(req.body);


    try {
        const newUser = await Auth.createUser({
            email: email,
            emailVerified: false,
            phoneNumber: phone,
            password: password,
            displayName: fullname,
            photoUrl: "http://www.example.com/12345678/photo.png",
            disabled: true,
        });
        logger.log("Successfully created new user:", newUser.uid);

        // set custom user claims on new user
        const customClaims = {
            admin: true,
            accessLevel: 1,
        };
        // calling firebase functions to set custom claims on new user
        await Auth.setCustomUserClaims(newUser.uid, customClaims);

        // store user data in database
        logger.log("Creating new entry in the database for the new user........");
        await Admin.createNewUser(newUser.uid, req.body);
        res.send({
            status: 200,
            message: "Successfully created new user",
        });
    } catch (error) {
        logger.log("Encountered error:", error);
        res.send({
            status: 400,
            message: error.code || error,
        });
    }
});


router.post("/createProduct", async (req, res) => {
    console.log(req.body);

    try {
        // validate request body
        // eslint-disable-next-line no-unused-vars
        const {error, value} = Validation.productSchema.validate(req.body);
        if (error) {
            throw error.details[0].message;
        }

        // adding new product to the database
        const newProduct = await Admin.createProduct(req.body);
        res.send({
            status: 200,
            message: `Successfully created a new product`,
            insertId: newProduct,
        });
    } catch (error) {
        logger.log(`Error creating new product: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getProducts", async (req, res) => {
    const products = [];
    try {
        logger.log("calling the model function to get all products");
        const snapshot = await Admin.getProducts();
        if (snapshot.empty) {
            logger.log("there are no products");
        } else {
            snapshot.forEach((doc) => {
                logger.log(doc.id, "=>", doc.data());
                products.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
        }
        res.send({
            status: 200,
            data: products,
        });
    } catch (error) {
        logger.log(`Error getting new products: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getProduct", async (req, res) => {
    const productID = req.query.productID;
    try {
        logger.log("calling the model function to get the product");
        const product = await Admin.getProduct(productID);
        res.send({
            status: 200,
            data: product,
            id: productID,
        });
    } catch (error) {
        logger.log(`Error getting: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});
router.get("/searchProducts", async (req, res) => {
    const searchTerm = req.query.searchTerm.toLowerCase();
    console.log(searchTerm);
    const products = [];
    const searchedProducts = [];
    try {
        logger.log("Calling model function get all products");
        const snapshot = await Admin.getProducts();
        if (snapshot.empty) {
            logger.log("there are no products");
            throw "there are no products";
        }
        snapshot.forEach((doc) => {
            logger.log(doc.id, "=>", doc.data());
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        for (const product of products) {
            // check if the product name matches or includes the searchTerm
            const matchesTitle = product.name.toLowerCase().includes(searchTerm);

            // check if the tags array contains the query
            const matchesTags = product.tags.some((tag) => tag.toLowerCase() === searchTerm);

            // check if the product description includes the searchTerm
            const matchesDescription = product.description.toLowerCase().includes(searchTerm);

            // check if the product category matches or includes the searchTerm
            const matchesCategory = product.category.toLowerCase().includes(searchTerm);

            // check if the product brand matches or includes the searchTerm
            const matchesBrand = product.brand.toLowerCase().includes(searchTerm);

            // check if the product color matches or includes the searchTerm
            const matchesColor = product.color.some((color) => color.toLowerCase() === searchTerm);

            // If either condition is met, push the product into the searchedProducts array
            if (matchesTitle || matchesTags || matchesDescription || matchesCategory || matchesBrand || matchesColor) {
                searchedProducts.push(product);
            }
        }

        res.send({
            status: 200,
            data: searchedProducts,
        });
    } catch (error) {
        logger.log(`Error getting searched products: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


router.post("/updateProduct", async (req, res) => {
    const productID = req.query.productId;
    console.log(req.body);
    try {
        logger.log("calling the model to update the product");
        await Admin.updateProduct(productID, req.body);
        res.send({
            status: 200,
            message: "Successfully updated the product",
        });
    } catch (error) {
        logger.log(`Error updating product: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/deleteProduct", async (req, res) => {
    console.log(req.body);
    const {productId} = req.body;
      
    try {
        logger.log("Calling model function to delete product");
        await Admin.DeleteProduct(productId);
        res.send({
            status: 200,
            message: "Successfully deleted the product",
        });
    } catch (error) {
        logger.log(`Error deleting product:${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/createProductCategory", async (req, res) => {
    console.log(req.body);
    try {
        logger.log("Calling model function to create productCategory");
        const newProductCategory = await Admin.createProductCategory(req.body);
        res.send({
            status: 200,
            message: "Successfully added new product category",
            insertId: newProductCategory,
        });
    } catch (error) {
        logger.log(`Error adding product category:${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getProductCategories", async (req, res) => {
    const productCategories = [];
    try {
        logger.log("calling the model function to get all product categories");
        const snapshot = await Admin.getProductCategories();
        if (snapshot.empty) {
            logger.log("there are no product categories");
        } else {
            snapshot.forEach((doc) => {
                logger.log(doc.id, "=>", doc.data());
                productCategories.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
        }
        res.send({
            status: 200,
            data: productCategories,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getProductCategory", async (req, res) => {
    const productCategoryId = req.query.productCategoryId;
    try {
        logger.log("calling the model function to get the product category info with:", productCategoryId);
        const productCategory = await Admin.getProductCategory(productCategoryId);
        res.send({
            status: 200,
            data: productCategory,
            id: productCategoryId,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

// TODO:
router.post("/updateProductCategory", async (req, res) => {

});


router.post("/createBrand", async (req, res) => {
    console.log(req.body);
    try {
        logger.log("Calling model function to create brand");
        const newBrand = await Admin.createBrand(req.body);
        res.send({
            status: 200,
            message: "Successfully added a new brand",
            insertId: newBrand,
        });
    } catch (error) {
        logger.log(`Error adding new brand:${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getBrands", async (req, res) => {
    const brands = [];
    try {
        logger.log("Calling model function to get all brands");
        const brandsSnapshot = await Admin.getBrands();
        if (brandsSnapshot.empty) {
            logger.log("There are no brands");
        } else {
            brandsSnapshot.forEach((brand) => {
                logger.log(brand.id, "=>", brand.data());
                brands.push({
                    id: brand.id,
                    ...brand.data(),
                });
            });
        }
        res.send({
            status: 200,
            data: brands,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getBrand", async (req, res) => {
    const brandId = req.query.brandId;
    try {
        logger.log("calling the model function to get the brand info with:", brandId);
        const brand = await Admin.getBrand(brandId);
        res.send({
            status: 200,
            data: brand,
            id: brandId,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

// TODO:
router.post("/updateBrand", async (req, res) => {

});


router.post("/createPosOrder", async (req, res)=>{
    const {orders} = req.body;
    // console.log(orders);

    try {
        const subTotal = await calculateTotal(orders);
        const vat = await addVat(subTotal);
        const checkoutTotalPrice = subTotal + vat;
        console.log(checkoutTotalPrice);

        // assemble orderdata
        const orderData = {
            adminId: req.user.id,
            orderDate: new Date().toISOString(),
            status: "Completed",
            subTotal: subTotal,
            vat: vat,
            totalAmount: parseInt(checkoutTotalPrice),
            deliveryMethod: "N/A",
            deliveryAddress: "N/A",
            purchaseMode: "walk-in-store",
            // paymentMethod: "paymentMethod",
            paymentStatus: "Paid",
            items: orders,
        };

        // console.log(orderData);

        // inspect order and ensure products are still available
        orderData.items.forEach(async (item)=>{
            await inspectProduct(item.productId, item.quantity);
        });

        const order = await Admin.createPosOrder(orderData);
        await updateInventory(orderData);

        res.send({
            status: 200,
            message: "Order completed successfully",
            insertId: order,
            amount: orderData.totalAmount,
        });
    } catch (error) {
        console.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});


router.get("/getOnlineOrders", async (req, res) => {
    const orders = [];
    const customOrders = [];
    try {
        logger.log("Calling model function to get all orders");
        const ordersSnapshot = await Admin.getOnlineOrders();
        if (ordersSnapshot.empty) {
            logger.log("there are no orders");
        } else {
            ordersSnapshot.forEach((order) => {
                logger.log(order.id, "=>", order.data());
                orders.push({
                    id: order.id,
                    ...order.data(),
                });
            });
        }
        for (const order of orders) {
            const user = await Admin.getCustomer(order.userId);
            customOrders.push({
                customerName: user.firstname + " " + user.lastname,
                ...order,
            });
        }
        res.send({
            status: 200,
            data: customOrders,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getWalkInOrders", async (req, res) => {
    const orders = [];
    try {
        logger.log("Calling model function to get all orders");
        const ordersSnapshot = await Admin.getWalkInOrders();
        if (ordersSnapshot.empty) {
            logger.log("there are no orders");
        } else {
            ordersSnapshot.forEach((order) => {
                logger.log(order.id, "=>", order.data());
                orders.push({
                    id: order.id,
                    ...order.data(),
                });
            });
        }
        res.send({
            status: 200,
            data: orders,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getOrder", async (req, res) => {
    const orderId = req.query.orderId;
    let customerObject;
    try {
        logger.log("calling model function to get an order with orderId:", orderId);
        const order = await Admin.getOrder(orderId);
        if (order.userId) {
            logger.log("Calling model function to get customer info");
            const customer = await Admin.getCustomer(order.userId);
            customerObject = {
                name: customer.firstname + " " + customer.lastname,
                email: customer.email,
                phone: customer.phone,
                photoUrl: customer.photoUrl,
            };
        } else {
            customerObject = {
                name: order.customerName,
                email: order.customerEmail,
                phone: order.phone,
                photoUrl: "",
            };
        }
   
        res.send({
            status: 200,
            data: {
                order: {
                    orderId: orderId,
                    ...order,
                },
                customer: customerObject,
            },
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: "Error getting order data",
            error: error,
        });
    }
});

router.post("/updateOrderStatus", async (req, res) => {
    console.log(req.body);
    const {orderId, status} = req.body;
    try {
        logger.log("calling the model function to update the order");
        await Admin.updateOrder(orderId, status);
        res.send({
            status: 200,
            message: "Order successfully updated",
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

// TODO:orderHistory

router.get("/getCustomers", async (req, res) => {
    const customers = [];
    try {
        logger.log("Calling model function to get all customers");
        const customersSnapshot = await Admin.getCustomers();
        if (customersSnapshot.empty) {
            logger.log("There are no customers");
        } else {
            customersSnapshot.forEach((customer) => {
                logger.log(customer.id, "=>", customer.data());
                customers.push({
                    id: customer.id,
                    ...customer.data(),
                });
            });
        }
        res.send({
            status: 200,
            data: customers,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getCustomer", async (req, res) => {
    const customerId = req.query.customerId;
    try {
        logger.log("calling the model function to get the customer info with:", customerId);
        const customer = await Admin.getCustomer(customerId);
        res.send({
            status: 200,
            data: customer,
            id: customerId,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

// TODO:
router.get("/getProductsViewedReport", async (req, res) => {
    const products = [];
    const productsViewedCount = [];
    try {
        logger.log("Calling model function to get all products");
        const productsSnapshot = await Admin.getProducts();
        if (productsSnapshot.empty) {
            logger.log("there are no products");
        } else {
            productsSnapshot.forEach((product) => {
                products.push({
                    id: product.id,
                    ...product.data(),
                });
            });
        }
        for (const product of products) {
            const isProductViewed = await Admin.isProductViewed(product.id);
            if (!isProductViewed.exists) {
                productsViewedCount.push({
                    productId: product.id,
                    image: product.images[0],
                    name: product.name,
                    price: product.price,
                    viewCount: 0,
                });
            } else {
                productsViewedCount.push({
                    productId: product.id,
                    image: product.images[0],
                    name: product.name,
                    price: product.price,
                    viewCount: isProductViewed.data().count,
                });
            }
        }
        // sort the array by viewCount in descending order
        const sortedProductViewedCount = productsViewedCount.sort((a, b) => b.viewCount - a.viewCount);

        res.send({
            status: 200,
            data: sortedProductViewedCount,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getSalesReport", async (req, res) => {
    const orders = [];
    const salesReport = [];
    try {
        logger.log("Calling model function to get all orders");
        const ordersSnapshot = await Admin.getOrders();
        if (ordersSnapshot.empty) {
            logger.log("There are no orders");
        } else {
            ordersSnapshot.forEach(async (order) => {
                // console.log(order.data());
                orders.push({
                    id: order.id,
                    noOfProducts: order.data().items.length,
                    createdAt: order.data().createdAt,
                    totalAmount: order.data().totalAmount,
                    // ...order.data(),
                });
            });
        }
        console.log(orders);
        // group the orders by date
        logger.log("calling function to group orders by date");
        const groupedOrders = await CustomFunctions.groupByDate(orders);
        console.log(groupedOrders);

        for (const groupedOrder of groupedOrders) {
            const noOfOrders = groupedOrder.orders.length;
            const productsSold = await CustomFunctions.calculateTotalProductsNum(groupedOrder.orders);
            const ordersOverallTotal = await CustomFunctions.calculateTotalAmountOfOrders(groupedOrder.orders);

            salesReport.push({
                date: groupedOrder.date,
                noOfOrders: noOfOrders,
                productsSold: productsSold,
                total: ordersOverallTotal,
            });
        }

        res.send({
            status: 200,
            data: salesReport,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getCustomerOrdersReport", async (req, res) => {
    const customers = [];
    const customerOrders = [];

    try {
        logger.log("Calling model function to get all customers");
        const customersSnapshot = await Admin.getCustomers();
        if (customersSnapshot.empty) {
            logger.log("there are no customers");
        } else {
            customersSnapshot.forEach((customer) => {
                // logger.log(customer.id, "=>", customer.data());
                customers.push({
                    id: customer.id,
                    ...customer.data(),
                });
            });
        }

        for (const customer of customers) {
            logger.log("Calling model function to get orders linked to a customer");
            const orders = await Admin.getCustomerOrders(customer.id);
            const tempCustomerOrders = [];
            if (orders.empty) {
                logger.log("There are no orders for the user with this id");
            } else {
                orders.forEach((order) => {
                    // logger.log(order.id, "=>", order.data());
                    tempCustomerOrders.push({
                        id: order.id,
                        noOfProducts: order.data().items.length,
                        ...order.data(),
                    });
                });
            }
            console.log("this are the customer orders:", tempCustomerOrders);
            const ordersOverallTotal = await CustomFunctions.calculateTotalAmountOfOrders(tempCustomerOrders);
            const totalNumberOfProducts = await CustomFunctions.calculateTotalProductsNum(tempCustomerOrders);
            const formattedDate = await CustomFunctions.convertTimestampToDateTime(customer.createdAt);
            customerOrders.push({
                customerId: customer.id,
                name: customer.firstname + " " + customer.lastname,
                email: customer.email,
                dateJoined: formattedDate,
                noOfOrders: tempCustomerOrders.length,
                noOfProducts: totalNumberOfProducts,
                overAllTotal: ordersOverallTotal,
                // orders: tempCustomerOrders,

            });
        }

        res.send({
            status: 200,
            data: customerOrders,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/online-store-dashboard-data", async (req, res) => {
    const allOrders = [];
    let newCustomers = 0;
    const tempSales = [];
    const monthSales = [];

    try {
        // earnings info
        const totalOrders = await Admin.getOnlineOrdersThisMonth();
        if (totalOrders.empty) {
            console.log("there are no orders");
        } else {
            totalOrders.forEach((order) => {
                const orderData = order.data();
                if (
                    orderData.purchaseMode === "online-store" &&
              orderData.status.toLowerCase() !== "pending" &&
              orderData.status.toLowerCase() !== "failed"
                ) {
                    allOrders.push({
                        id: order.id,
                        totalAmount: orderData.subTotal + orderData.vat,
                        items: orderData.items,
                    });

                    tempSales.push({
                        id: order.id,
                        createdAt: order.data().createdAt,
                        totalAmount: order.data().subTotal + order.data().vat, // totalamount should be exclusive of shippingcost
                    });
                }
            });
      
            // console.log(allOrders);
        }

        const totalEarnings = await CustomFunctions.calculateTotalAmountOfOrders(allOrders);
        const totalBoysEarnings = await CustomFunctions.calculateBoysEarnings(allOrders);
        const totalGirlsEarnings = await CustomFunctions.calculateGirlsEarnings(allOrders);
        const totalOtherEarnings = await CustomFunctions.calculateOthersEarnings(allOrders);

        // sales information
        // logger.log("calling model function to get all sales/orders this month");
        // const salesSnapshot = await Admin.getOnlineOrdersThisMonth();
        // if (salesSnapshot.empty) {
        //     console.log("no orders");
        // } else {
        //     // Todo:Update this filter condition to make sure it only filters the orders that have been paid for
        //     const filteredSalesSnapshot = salesSnapshot.docs.filter((doc) => doc.data().status.toLowerCase() != "failed" && doc.data().status.toLowerCase() !="pending");
        //     filteredSalesSnapshot.empty ? console.log("There are no sales this month") : filteredSalesSnapshot.forEach((sale) => {
        //         tempSales.push({
        //             id: sale.id,
        //             createdAt: sale.data().createdAt,
        //             totalAmount: sale.data().subTotal + sale.data().vat, // totalamount should be exclusive of shippingcost
        //         });
        //     });
        // }


        for (const sale of tempSales) {
            const formattedDate = await CustomFunctions.convertTimestampToMonthDate(sale.createdAt);
            monthSales.push({
                id: sale.id,
                date: formattedDate,
                totalAmount: sale.totalAmount,
            });
        }

        const salesTotal = await CustomFunctions.calculateTotalAmountOfOrders(monthSales);
        const averageDailySale = await CustomFunctions.calculateAverageDailySales(monthSales);


        logger.log("calling model function to get new customers this month");
        const newCustomersThisMonthSnapshot = await Admin.getNewCustomersThisMonth();
        newCustomersThisMonthSnapshot.empty ? console.log("There are no new customers this month") : newCustomers = newCustomersThisMonthSnapshot.size;

      
        res.send({
            status: 200,
            data: {
                totalEarnings: totalEarnings,
                totalGirlsEarnings: totalGirlsEarnings,
                totalBoysEarnings: totalBoysEarnings,
                totalOtherEarnings: totalOtherEarnings,
                ordersCount: monthSales.length,
                newCustomers: newCustomers,
                sales: {
                    salesTotal: salesTotal,
                    averageDailySale: averageDailySale,
                    sales: monthSales,
                },
            },

        });
    } catch (error) {
        console.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

// router.get("/pos-dashboard-data", async (req, res) => {
//     const allOrders = [];
//     // let ordersCount = 0;
//     const dailySales = [];
//     const tempSales = [];
//     const monthlySales = [];


//     try {
//         logger.log("Calling model function to get orders for today");
//         const ordersTodaySnapshot = await Admin.getPosOrdersToday();
//         ordersTodaySnapshot.empty ? console.log("There are no orders today") : ordersTodaySnapshot.forEach((doc) => {
//             dailySales.push({
//                 id: doc.id,
//                 ...doc.data(),
//             });
//         });

    
//         // sales information
//         logger.log("calling model function to get all sales/orders this month");
//         const salesSnapshot = await Admin.getPosOrdersThisMonth();
//         if (salesSnapshot.empty) {
//             console.log("no orders");
//         } else {
//             const filteredSalesSnapshot = salesSnapshot.docs.filter((doc) => doc.data().status.toLowerCase() === "completed");
//             filteredSalesSnapshot.empty ? console.log("There are no sales this month") : filteredSalesSnapshot.forEach((sale) => {
//                 tempSales.push({
//                     id: sale.id,
//                     createdAt: sale.data().createdAt,
//                     totalAmount: sale.data().totalAmount,
//                 });
//             });
//         }

//         for (const sale of tempSales) {
//             const formattedDate = await CustomFunctions.convertTimestampToMonthDate(sale.createdAt);
//             monthlySales.push({
//                 id: sale.id,
//                 date: formattedDate,
//                 totalAmount: sale.totalAmount,
//             });
//         }
//         const dailySalesTotal = await CustomFunctions.calculateTotalAmountOfOrders(dailySales);
//         const monthSalesTotal = await CustomFunctions.calculateTotalAmountOfOrders(monthlySales);
//         const averageMonthlyDailySale = await CustomFunctions.calculateAverageDailySales(monthlySales);


//         // earnings info
//         const totalOrders = await Admin.getOrders();
//         if (totalOrders.empty) {
//             console.log("there are no orders");
//         } else {
//             totalOrders.forEach((order) => {
//                 if (order.data().purchaseMode === "walk-in-store" && order.data().status.toLowerCase() === "completed") {
//                     allOrders.push({
//                         id: order.id,
//                         totalAmount: order.data().totalAmount,
//                         items: order.data().items,
//                     });
//                 }
//             });
//         }

//         const totalEarnings = await CustomFunctions.calculateTotalAmountOfOrders(allOrders);
//         const totalGirlsEarnings = await CustomFunctions.calculateGirlsEarnings(allOrders);
//         const totalBoysEarnings = await CustomFunctions.calculateBoysEarnings(allOrders);
//         const totalOtherEarnings = await CustomFunctions.calculateOthersEarnings(allOrders);
//         res.send({
//             status: 200,
//             data: {
//                 totalEarnings: totalEarnings,
//                 totalGirlsEarnings: totalGirlsEarnings,
//                 totalBoysEarnings: totalBoysEarnings,
//                 totalOtherEarnings: totalOtherEarnings,
//                 ordersCount: monthlySales.length,
//                 sales: {
//                     salesTotal: monthSalesTotal,
//                     averageDailySale: averageMonthlyDailySale,
//                     dailySalesTotal: dailySalesTotal,
//                     sales: monthlySales,
//                 },
//             },


//         });
//     } catch (error) {
//         console.log(error);
//         res.send({
//             status: 400,
//             message: error,
//         });
//     }
// });

// TODO:  get number of products, orders, totalsales, profit and quantity sold
router.get("/general-overview", async (req, res) => {
    let productSize = 0;
    let orderSize = 0;
    let totalSales = 0;
    let totalProductValue = 0;
    let totalCost = 0;
    let totalVAT = 0;
    let profit = 0;
    let actualProfit = 0;

    try {
        // Fetch all products
        const productsSnapshot = await Admin.getProducts();
        if (!productsSnapshot.empty) {
            productsSnapshot.forEach((product) => {
                const productData = product.data();
                

                if (Array.isArray(productData.variations)) {
                    productData.variations.forEach((variation) => {
                        productSize += variation.stock || 0;

                        const stockValue = (variation.stock || 0) * (variation.price || 0);
                        const soldValue = (variation.sold || 0) * (variation.price || 0);
                        totalProductValue += stockValue + soldValue;

                        // Assuming each variation has a costPrice field
                        if (variation.costPrice) {
                            totalCost += (variation.sold || 0) * variation.costPrice;
                        }
                    });
                }
            });
            // productSize = productsSnapshot.size;
        } else {
            console.log("There are no products.");
        }

        // Fetch all orders
        const ordersSnapshot = await Admin.getOrders();
        if (!ordersSnapshot.empty) {
            ordersSnapshot.forEach((order) => {
                const orderData = order.data();
                if (orderData.status.toLowerCase() !="failed" && orderData.status.toLowerCase() !="pending" && orderData.subTotal) {
                    const vatAmount = orderData.vat || 0; // Ensure VAT is captured
                    totalSales += orderData.subTotal + vatAmount;
                    totalVAT += vatAmount; // Accumulate total VAT
                }
            });
            orderSize = ordersSnapshot.size;
        } else {
            console.log("There are no orders.");
        }

        // Calculate profit and actual profit
        profit = totalSales - totalCost; // Profit before tax
        actualProfit = profit - totalVAT; // Net profit after tax

        res.send({
            status: 200,
            data: {
                productSize,
                orderSize,
                totalProductValue,
                totalSales,
                totalCost,
                totalVAT,
                profit, // Before VAT deduction
                actualProfit,
            },
            // Net profit after VAT deduction
        });
    } catch (error) {
        console.error("Error fetching general overview:", error);
        res.status(500).json({error: "Internal server error"});
        res.send({
            status: 500,
            message: error || "Internal server error",
        });
    }
});


router.post("/storeDeviceToken", async (req, res) => {
    // const storedDeviceTokens = [];
    let message;
    console.log(req.body);
    const sentDeviceToken = req.body.token;
    try {
        // check if token already exists
        const tokensSnapshot = await Admin.getRegisteredToken(sentDeviceToken);
        if (tokensSnapshot.empty) {
            console.log("There are no tokens");
            // create new entry
            await Admin.storeDeviceToken(sentDeviceToken, req.user.id);
            
            message = "device token stored successfully";
        } else {
            message = "device token already exists";
        }
        res.send({
            status: 200,
            message: message,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/updateDeviceToken", async (req, res) => {
    console.log(req.body);
    const {token} = req.body;
    try {
        logger.log("calling the model function to update the order");
        await Admin.storeDeviceToken(req.user.id, token);
        res.send({
            status: 200,
            message: "device token stored successfully",
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
            message: error,
        });
    }
});


async function calculateTotal(order) {
    console.log(order);
    try {
        return order.reduce((total, item) => {
            const customTotal = total + (item.price * item.quantity);
            return Math.ceil(customTotal * 100 / 100); // converts to two decimal places
        }, 0);
    } catch (error) {
        console.log(error);
        throw error;
    }
}


async function addVat(subTotal) {
    console.log(subTotal);
    try {
        const vat = 0.075 * parseInt(subTotal);
        return Math.ceil(vat * 100 / 100);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function inspectProduct(productId, quantity) {
    try {
        const productDoc = await Admin.getProduct(productId);

        if (productDoc.stockLevel < quantity) {
            throw `${productDoc.name} is out of stock. Only ${productDoc.stockLevel} remains`;
        }
        return productDoc;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateInventory(orderData) {
    console.log("updating inventory");
    try {
        orderData.items.forEach(async (item) => {
            const product = await Admin.getProduct(item.productId);
            const updatedProductQuantity = product.stockLevel - item.quantity; // Reduce stock
            console.log(updatedProductQuantity);
            await Admin.updateProductQuantity(item.productId, updatedProductQuantity);
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = router;
