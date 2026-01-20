/* eslint-disable no-throw-literal */
const {db, logger, FieldValue} = require("../config/firebase");
const CustomFunctions = require("../custom_functions");

class Admin {
    constructor(data) {
        this.email = data.email;
        this.phone = data.phone;
        this.password = data.password;
        this.fullname = data.fullname;
    }

    static async createNewUser(id, newUser) {
        try {
            const res = await db.collection("admin").doc(id).set(
                {
                    email: newUser.email,
                    phone: newUser.phone,
                    fullname: newUser.fullname,
                    createdAt: FieldValue.serverTimestamp(),
                },

            );
            console.log(`firestore process: new user entry created: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async createProduct(newProduct) {
        const priceRange = await CustomFunctions.getPriceRangefunction(newProduct.variations);
        console.log(priceRange);
        // product id should be like this "productID": "SKU12345",
        try {
            const res = await db.collection("products").add(
                {
                    "name": newProduct.name,
                    "category": newProduct.category,
                    "brand": newProduct.brand,
                    "price": priceRange,
                    // "price": Math.ceil(newProduct.price * 100 / 100), // coverts the price to two decimal places atmost
                    "discountType": newProduct.discountType,
                    "material": newProduct.material,
                    "description": newProduct.description,
                    "color": newProduct.color,
                    "variations": newProduct.variations,
                    "fit": newProduct.fit,
                    "images": newProduct.images,
                    "stockAvailability": newProduct.stockAvailability,
                    "stockLevel": newProduct.stockLevel,
                    "weight": newProduct.weight,
                    "dimensions": newProduct.dimensions,
                    "tags": newProduct.tags,
                    "style": [],
                    "composition": [],
                    "care": [],
                    "status": newProduct.status,
                    "marketStatus": newProduct.marketStatus,
                    "taxClass": newProduct.taxClass,
                    "taxPercent": newProduct.taxPercent,
                    "barcodes": newProduct.barcodes || [],
                    "createdAt": FieldValue.serverTimestamp(),
                },
            );
            console.log(`firestore process: new product entry created: ${res.id}`);
            return (res.id);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getProducts() {
        try {
            const productsRef = db.collection("products");
            const products = await productsRef.orderBy("createdAt", "DESC").get();
            console.log(`firestore process complete: ${products}`);
            return products;
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getProduct(productID) {
        try {
            const productRef = db.collection("products").doc(productID);
            const product = await productRef.get();
            console.log(`firestore process complete: ${product}`);
            if (!product.exists) {
                logger.log("There is no such product in the db");
                throw "There is not product with that id";
            }
            return (product.data());
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw error;
        }
    }


    static async updateProduct(productID, updatedProduct) {
        const priceRange = await CustomFunctions.getPriceRangefunction(updatedProduct.variations);
        console.log(priceRange);
        try {
            const productRef = db.collection("products").doc(productID);
            const res = await productRef.update({
                "barcodes": updatedProduct.barcodes,
                "name": updatedProduct.name,
                "category": updatedProduct.category,
                "brand": updatedProduct.brand,
                "price": priceRange,
                "discountType": updatedProduct.discountType,
                "material": updatedProduct.material,
                "description": updatedProduct.description,
                "variations": updatedProduct.variations,
                "color": updatedProduct.color,
                // "size": updatedProduct.size,
                "fit": updatedProduct.fit,
                "images": updatedProduct.images,
                "stockAvailability": updatedProduct.stockAvailability,
                "stockLevel": updatedProduct.stockLevel,
                "weight": updatedProduct.weight,
                "dimensions": updatedProduct.dimensions,
                "tags": updatedProduct.tags,
                "style": [],
                "composition": [],
                "care": [],
                "status": updatedProduct.status,
                "marketStatus": updatedProduct.marketStatus,
                "taxClass": updatedProduct.taxClass,
                "taxPercent": updatedProduct.taxPercent,
                "lastUpdated": FieldValue.serverTimestamp(),
            });
            console.log(`Firestor update operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async DeleteProduct(productID) {
        try {
            const productRef = db.collection("products").doc(productID);
            const res = await productRef.delete();
            console.log(`Firestor delete operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async createProductCategory(newProductCategory) {
        try {
            const productCategoryRef = db.collection("productCategories");
            const res = await productCategoryRef.add({...newProductCategory, createdAt: FieldValue.serverTimestamp()});
            console.log(`Firestore creation operation successful:${res.id}`);
            return res.id;
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getProductCategories() {
        try {
            const categoriesRef = db.collection("productCategories");
            const res = await categoriesRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw error;
        }
    }

    
    static async getProductCategory(productCategoryId) {
        const categoryRef = db.collection("productCategories").doc(productCategoryId);
        try {
            const category = await categoryRef.get();
            if (!category.exists) {
                throw "There is no category with such categoryId";
            }
            console.log(`Firestore read operation successful: ${category}`);
            return category.data();
        } catch (error) {
            console.log("Firestore error:", error);
            throw `firestore error: ${error}`;
        }
    }

    static async createBrand(newBrand) {
        try {
            const brandRef = db.collection("brands");
            const res = await brandRef.add({...newBrand, createdAt: FieldValue.serverTimestamp()});
            console.log(`Firestore creation operation successful:${res.id}`);
            return (res.id);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

  
    static async getBrands() {
        try {
            const brandsRef = db.collection("brands");
            const res = await brandsRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw error;
        }
    }

    
    static async getBrand(brandId) {
        const brandRef = db.collection("brands").doc(brandId);
        try {
            const brand = await brandRef.get();
            if (!brand.exists) {
                throw "There is no brand with such brandId";
            }
            console.log(`Firestore read operation successful: ${brand}`);
            return brand.data();
        } catch (error) {
            console.log("Firestore error:", error);
            throw `firestore error: ${error}`;
        }
    }

    static async getOrders() {
        try {
            const ordersRef = db.collection("orders");
            const res = await ordersRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw error;
        }
    }


    static async getOnlineOrders() {
        try {
            const ordersRef = db.collection("orders").where("userId", "!=", "null");
            const res = await ordersRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw error;
        }
    }

    static async getWalkInOrders() {
        try {
            const ordersRef = db.collection("orders").where("adminId", "!=", "null");
            const res = await ordersRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw error;
        }
    }

    static async getOrder(orderId) {
        try {
            const orderRef = db.collection("orders").doc(orderId);
            const order = await orderRef.get();
            if (!order.exists) {
                throw "There is no order with such orderid";
            }
            console.log("Firestore read operation completed:", order);
            return order.data();
        } catch (error) {
            console.log("Firestore error:", error);
            throw `firestore error: ${error}`;
        }
    }

    static async updateOrder(orderId, status) {
        try {
            const orderRef = db.collection("orders").doc(orderId);
            const res = await orderRef.update({
                "status": status,
                "lastUpdated": FieldValue.serverTimestamp(),
            });
            console.log(`Firestor update operation successful: ${res}`);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw `firestore error: ${error}`;
        }
    }

    static async createPosOrder(newOrder) {
        try {
            const orderRef = db.collection("orders");
            const order = await orderRef.add({
                ...newOrder,
                createdAt: FieldValue.serverTimestamp(),
            });
            console.log(`Firestore creation operation successful:${order.id}`);
            return (order.id);
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw error;
        }
    }


    static async getCustomers() {
        try {
            const customersRef = db.collection("customers");
            const res = await customersRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw ("Firestore error:", error);
        }
    }

    
    static async getCustomer(customerId) {
        const customerRef = db.collection("customers").doc(customerId);
        try {
            const customer = await customerRef.get();
            if (!customer.exists) {
                throw "There is no customer with such userId";
            }
            console.log(`Firestor read operation successful: ${customer}`);
            return customer.data();
        } catch (error) {
            console.log("Firestore error:", error);
            throw `firestore error: ${error}`;
        }
    }

    static async addProductViewCount(productId, count) {
        const productViewRef = db.collection("productViewCount").doc(productId);
        try {
            const res = await productViewRef.set({
                count: count,
                createdAt: FieldValue.serverTimestamp()});
            console.log(`Firestore creation operation successful:${res}`);
            return res;
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async isProductViewed(productId) {
        const isProductViewedRef = db.collection("productViewCount").doc(productId);
        try {
            const brand = await isProductViewedRef.get();
            console.log(`Firestore read operation successful: ${brand}`);
            return brand;
        } catch (error) {
            console.log("Firestore error:", error);
            throw `firestore error: ${error}`;
        }
    }


    static async updateProductViewCount(productId, count) {
        const productViewRef = db.collection("productViewCount").doc(productId);
        try {
            const res = await productViewRef.update({
                count: count,
                lastUpdated: FieldValue.serverTimestamp()});
            console.log(`Firestore update operation successful:${res}`);
            return res;
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getCustomerOrders(userId) {
        try {
            const orderRef = db.collection("orders").where("userId", "==", userId);
            const orders = await orderRef.orderBy("createdAt", "DESC").get();
            console.log(`Firestore read operation successful:${orders}`);
            return orders;
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw (`firestore error: ${error}`);
        }
    }

    static async getOnlineOrdersThisMonth() {
        // get the current date
        const now = new Date();

        // calculate the first day of the current month
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // calculate the last day of the current month
        const lastDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        try {
            const orderRef = db.collection("orders").where("purchaseMode", "!=", "walk-in-store").where("createdAt", ">=", firstDayOfCurrentMonth).where("createdAt", "<=", lastDayOfCurrentMonth);
            const orders = await orderRef.get();
            console.log(`Firestore read operation successful:${orders.size}`);
            return orders;
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw (`firestore error: ${error}`);
        }
    }

    static async getNewCustomersThisMonth() {
        // get the current date
        const now = new Date();

        // calculate the first day of the current month
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // calculate the last day of the current month
        const lastdayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        try {
            const orderRef = db.collection("customers").where("createdAt", ">=", firstDayOfCurrentMonth).where("createdAt", "<=", lastdayOfCurrentMonth);
            const orders = await orderRef.get();
            console.log(`Firestore read operation successful:${orders}`);
            return orders;
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw (`firestore error: ${error}`);
        }
    }

    static async getPosOrdersThisMonth() {
        // get the current date
        const now = new Date();

        // calculate the first day of the current month
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // calculate the last day of the current month
        const lastDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        console.log(firstDayOfCurrentMonth, lastDayOfCurrentMonth);

        try {
            const orderRef = db.collection("orders").where("purchaseMode", "==", "walk-in-store").where("createdAt", ">=", firstDayOfCurrentMonth).where("createdAt", "<=", lastDayOfCurrentMonth);
            const orders = await orderRef.get();
            // console.log(`Firestore read operation successful:${orders}`);
            console.log(`Firestore read operation successful:${orders.ize}`);
            return orders;
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw (`firestore error: ${error}`);
        }
    }

    static async getPosOrdersToday() {
        // get the current date
        const now = new Date();

        // Calculate the start of the day (00:00:00)
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        // Calculate the end of the day (23:59:59)
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        try {
            const orderRef = db.collection("orders").where("purchaseMode", "==", "walk-in-store").where("createdAt", ">=", startOfDay).where("createdAt", "<=", endOfDay);
            const orders = await orderRef.get();
            // console.log(`Firestore read operation successful:${orders}`);
            return orders;
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw (`firestore error: ${error}`);
        }
    }

    static async updateProductQuantity(productID, updatedQuantity) {
        try {
            const productRef = db.collection("products").doc(productID);
            const res = await productRef.update({
                "stockLevel": updatedQuantity,
                "lastUpdated": FieldValue.serverTimestamp(),
            });
            console.log(`Firestor update operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async storeDeviceToken(token, userId) {
        try {
            const deviceTokensRef = db.collection("deviceTokens");
            const res = await deviceTokensRef.add({token, userId, createdAt: FieldValue.serverTimestamp()});
            console.log(`Firestore creation operation successful:${res.id}`);
            return (res.id);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }


    static async getRegisteredTokens() {
        try {
            const tokensRef = db.collection("deviceTokens");
            const res = await tokensRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw error;
        }
    }

    static async getRegisteredToken(deviceToken) {
        try {
            const tokensRef = db.collection("deviceTokens").where("token", "==", deviceToken);
            const res = await tokensRef.orderBy("createdAt", "desc").get();
            console.log("Firestore read operation completed:", res);
            return res;
        } catch (error) {
            console.log("Firestore error:", error);
            throw error;
        }
    }

   
    // static async getSalesThisMonth(firstDayOfCurrentMonth, lastdayOfCurrentMonth) {
    //     try {
    //         const orderRef = db.collection("orders").where("createdAt", ">=", firstDayOfCurrentMonth).where("createdAt", "<=", lastdayOfCurrentMonth);
    //         const orders = await orderRef.orderBy("createdAt", "Desc").get();
    //         console.log(`Firestore read operation successful:${orders}`);
    //         return orders;
    //     } catch (error) {
    //         console.log(`firestore error: ${error}`);
    //         throw (`firestore error: ${error}`)
    //     }
    // }
}

module.exports = Admin;
