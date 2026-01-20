/* eslint-disable no-throw-literal */
const {db, logger, FieldValue} = require("../config/firebase");


class Customer {
    constructor(newCustomer) {
        this.email = newCustomer.email;
        this.phone = newCustomer.phone;
        this.password = newCustomer.password;
        this.firstname = newCustomer.firstname;
        this.lastname = newCustomer.lastname;
        this.address = newCustomer.address;
    }

    static async createNewUser(id, newCustomer) {
        try {
            const res = await db.collection("customers").doc(id).set(
                {
                    email: newCustomer.email,
                    phone: newCustomer.phone,
                    firstname: newCustomer.firstname,
                    lastname: newCustomer.lastname,
                    addresses: [newCustomer.address],
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

    static async getCustomerData(userId) {
        const customerRef = db.collection("customers").doc(userId);
        try {
            const res = await customerRef.get();
            console.log(`Firestor get operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async setCustomerAddress(userId, addressItems) {
        console.log(userId, addressItems);
        const customerRef = db.collection("customers").doc(userId);
        try {
            const res = await customerRef.update({
                addresses: addressItems,

            });
            console.log(`Firestor update operation successful: ${res}`);
            return (res);
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

    static async getProducts() {
        try {
            const productsRef = db.collection("products");
            const products = await productsRef.orderBy("createdAt", "DESC").get();
            console.log(`firestore read process complete: ${products}`);
            return products;
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getNewProducts() {
        try {
            const productsRef = db.collection("products").where("marketStatus", "!=", "onsale");
            const products = await productsRef.orderBy("createdAt", "DESC").limit(4).get();
            console.log(`firestore process complete: ${products}`);
            return (products);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getOnSaleProducts() {
        try {
            const productsRef = db.collection("products").where("marketStatus", "==", "onsale");
            const products = await productsRef.orderBy("createdAt", "DESC").limit(4).get();
            console.log(`firestore process complete: ${products}`);
            return (products);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getProductsbyCategory(category) {
        const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        try {
            const productsRef = db.collection("products").where("category", "==", capitalizedCategory);
            const products = await productsRef.orderBy("createdAt", "DESC").get();
            console.log(`firestore process complete: ${products}`);
            return (products);
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

    static async updateProductQuantity(productID, updatedQuantityObject) {
        const variations = updatedQuantityObject.variations;
        const stockLevel = updatedQuantityObject.stockLevel;
        const quantitySold = updatedQuantityObject.quantitySold;
        try {
            const productRef = db.collection("products").doc(productID);
            const res = await productRef.update({
                variations,
                stockLevel,
                quantitySold,
                "lastUpdated": FieldValue.serverTimestamp(),
            });
            console.log(`Firestor update operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }


    static async createCart(userId, cart) {
        try {
            const cartRef = db.collection("cart").doc(userId);
            const res = await cartRef.set({
                items: cart,
                createdAt: FieldValue.serverTimestamp(),
            });
            console.log(`Firestor create operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getCart(userId) {
        try {
            const cartRef = db.collection("cart").doc(userId);
            const res = await cartRef.get();
            console.log(`Firestor get operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async updateCart(userId, cartItems) {
        try {
            const cartRef = db.collection("cart").doc(userId);
            const res = await cartRef.update({
                items: cartItems,
                lastUpdated: FieldValue.serverTimestamp(),
            });
            console.log(`Firestor update operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async deleteCart(userId) {
        try {
            const cartRef = db.collection("cart").doc(userId);
            const res = await cartRef.delete();
            console.log(`Firestor delete operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async createOrder(newOrder) {
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

    static async getOrders(userId) {
        try {
            const orderRef = db.collection("orders").where("userId", "==", userId);
            const order = await orderRef.orderBy("createdAt", "DESC").get();
            console.log(`Firestore read operation successful:${order}`);
            return (order);
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw error;
        }
    }

    static async getOrder(orderId) {
        try {
            const orderRef = db.collection("orders").doc(orderId);
            const order = await orderRef.get();
            console.log(`firestore process complete: ${order}`);
            if (!order.exists) {
                logger.log("There is no such order in the db");
                throw "There is not order with that id";
            }
            return (order.data());
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw error;
        }
    }


    static async updateOrder(orderID, order) {
        try {
            const orderRef = db.collection("orders").doc(orderID);
            const res = await orderRef.update({
                ...order,
                lastUpdated: FieldValue.serverTimestamp(),
            });
            console.log(`Firestor update operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }


    static async createPayment(newPayment) {
        try {
            const paymentRef = db.collection("payments");
            const payment = await paymentRef.add({
                ...newPayment,
                createdAt: FieldValue.serverTimestamp(),
            });
            console.log(`Firestore creation operation successful:${payment.id}`);
            return (payment.id);
        } catch (error) {
            console.log(`firestore error: ${error}`);
            throw error;
        }
    }

    static async createWishlist(userId, wishlist) {
        try {
            const wishlistRef = db.collection("wishlist").doc(userId);
            const res = await wishlistRef.set({
                items: [wishlist],
                createdAt: FieldValue.serverTimestamp(),
            });
            console.log(`Firestor create operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }

    static async getWishlist(userId) {
        try {
            const wishlistRef = db.collection("wishlist").doc(userId);
            const res = await wishlistRef.get();
            console.log(`Firestor get operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }


    static async updateWishlist(userId, wishlistItems) {
        try {
            const wishlistRef = db.collection("wishlist").doc(userId);
            const res = await wishlistRef.update({
                items: wishlistItems,
                lastUpdated: FieldValue.serverTimestamp(),
            });
            console.log(`Firestor update operation successful: ${res}`);
            return (res);
        } catch (error) {
            console.log(`firestore error:${error}`);
            throw error;
        }
    }


    // static async updateCartItem(userId, cartItems) {
    //     try {
    //         const cartRef = db.collection("cart").doc(userId);
    //         const res = await cartRef.update({
    //             items:cartItems,
    //             lastUpdated: FieldValue.serverTimestamp()
    //         });
    //         console.log(`Firestor update operation successful: ${res}`)
    //         return (res);
    //     } catch (error) {
    //         console.log(`firestore error:${error}`)
    //         throw error;
    //     }
    // }


    // update an item within a cart
}

module.exports = Customer;
