/* eslint-disable no-throw-literal */
/* eslint-disable new-cap */


const {Auth, logger} = require("./config/firebase");
const express = require("express");
const router = express.Router();
const axios = require("axios");
// import necessary Models
const Customer = require("./models/customer");
const Admin = require("./models/admin");

// const Validation = require("./validation");

router.post("/register", async (req, res) => {
    console.log(req.body);
    const newCustomerData = new Customer(req.body);

    // implement input validations

    try {
        const newCustomer = await Auth.createUser({
            email: newCustomerData.email,
            emailVerified: false,
            phoneNumber: newCustomerData.phone,
            password: newCustomerData.password,
            displayName: newCustomerData.firstname,
            photoUrl: "http://www.example.com/12345678/photo.png",
            disabled: false,
        });
        logger.log("Successfully created new user:", newCustomer.uid);
        // store user data in database
        logger.log("calling model function for creating new db entry for the new user........");
        await Customer.createNewUser(newCustomer.uid, newCustomerData);

        res.send({
            status: 200,
            message: "Successfully created new user",
            userId: newCustomer.uid,
        });
    } catch (error) {
        logger.log("Encountered error:", error);
        if (!error.code) {
            res.send({
                status: 400,
                message: `Error: ${error}`,
            });
        } else {
            res.send({
                status: 400,
                message: error.code,
            });
        }
    }
});

router.post("/updateCustomer", async (req, res) => {
    const {userId, firstname} = req.body;
    try {
        await Auth.updateUser(userId, {
            displayName: firstname,
        });
        res.send({
            status: 200,
            message: "Successfully updated user info",
        });
    } catch (error) {
        logger.log("Encountered error:", error);
        res.send({
            status: 400,
            message: error.code,
        });
    }
});

router.get("/getCustomerData", async (req, res) => {
    const userId = req.query.userId;
    try {
        logger.log("Calling model function to get customer data");
        const customerDoc = await Customer.getCustomerData(userId);
        if (!customerDoc.exists) {
            throw "There is no user with this id";
        }
        res.send({
            status: 200,
            data: customerDoc.data(),
        });
    } catch (error) {
        logger.log(`Error getting customer data: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

// create Address
router.post("/createAddress", async (req, res) => {
    const {userId, address, city, state, name, phone} = req.body;
    const addressData = {
        address: address,
        city: city,
        state: state,
        phone: phone,
        name: name,
        status: " ",
    };
    try {
        logger.log("calling model function to get customer data");
        const customerDoc = await Customer.getCustomerData(userId);
        if (!customerDoc.exists) {
            throw new Error("There is no user with this Id");
        }
        const customerData = customerDoc.data();
        const addresses = customerData.addresses;
        // add the address to the existing address array
        addresses.push(addressData);
        logger.log("calling model function to update the address field in customer document");
        await Customer.setCustomerAddress(userId, addresses);
        res.send({
            status: 200,
            message: "New address successfully created",
        });
    } catch (error) {
        logger.log(`Error creating address: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/setDefaultAddress", async (req, res) => {
    console.log(req.body);
    const {userId, targetIndex} = req.body;
    const newStatus = "Default";
    try {
        logger.log("calling model function to get customer data");
        const customerDoc = await Customer.getCustomerData(userId);
        if (!customerDoc.exists) {
            throw new Error("There is no user with this Id");
        }
        const customerData = customerDoc.data();
        let addresses = customerData.addresses;

        console.log(addresses);

        // check if target index is within the bound of the array
        if (targetIndex < 0 || targetIndex >= addresses.length) {
            throw "target index is out of bound";
        }

        // set the address with the target index to default.
        addresses = await addresses.map((address, index) => {
            if (index === targetIndex) {
                return {...address, status: newStatus};
            } else {
                return {...address, status: " "};
            }
        });
        console.log(addresses);
        logger.log("Calling model function to update address array in customer document");
        await Customer.setCustomerAddress(userId, addresses);
        res.send({
            status: 200,
            message: "Address successfully set to default",
        });
    } catch (error) {
        logger.log(`Error setting address as default: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/removeAddress", async (req, res) => {
    const {userId, targetIndex} = req.body;
    try {
        logger.log("calling model function to get customer data");
        const customerDoc = await Customer.getCustomerData(userId);
        if (!customerDoc.exists) {
            throw "There is no user with this Id";
        }
        const customerData = customerDoc.data();
        const addresses = customerData.addresses;

        // check if target index is within the bound of the array
        if (targetIndex < 0 || targetIndex >= addresses.length) {
            throw "target index is out of bound";
        }
        if (addresses[targetIndex].status == "Default") {
            // remove address with targetindex
            // addresses.splice(targetIndex, 1);
            // set address status of index 0 to default
            addresses[0].status = "Default";
        }
        addresses.splice(targetIndex, 1);
        logger.log(`addresses array after an address removal ${addresses}`);

        logger.log("Calling model function to update address array in customer document");
        await Customer.setCustomerAddress(userId, addresses);
        res.send({
            status: 200,
            message: "Address successfully deleted",
        });
    } catch (error) {
        logger.log(`Error deleting address: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/updateAddress", async (req, res) => {
    const {userId, targetIndex, updatedAddress} = req.body;
    try {
        logger.log("calling model function to get customer data");
        const customerDoc = await Customer.getCustomerData(userId);
        if (!customerDoc.exists) {
            throw "There is no user with this Id";
        }
        const customerData = customerDoc.data();
        const addresses = customerData.addresses;

        // check if target index is within the bound of the array
        if (targetIndex < 0 || targetIndex >= addresses.length) {
            throw "target index is out of bound";
        }
        // update the address at its specified target index
        addresses[targetIndex] = updatedAddress;

        logger.log("Calling model function to update address array in customer document");
        await Customer.setCustomerAddress(userId, addresses);
        res.send({
            status: 200,
            message: "Address successfully updated",
        });
    } catch (error) {
        logger.log(`Error updating address: ${error}`);
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
        const snapshot = await Customer.getProducts();
        if (snapshot.empty) {
            logger.log("there are no products");
            res.send({
                status: 200,
                data: products,
            });
        } else {
            snapshot.forEach((doc) => {
                logger.log(doc.id, "=>", doc.data());
                products.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            res.send({
                status: 200,
                data: products,
            });
        }
    } catch (error) {
        logger.log(`Error creating new product: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getNewArrivalAndOnsaleProducts", async (req, res) => {
    const newProducts = [];
    const onSale = [];
    try {
        logger.log("calling the model function to get all products");
        const newProductsSnapshot = await Customer.getNewProducts();
        if (newProductsSnapshot.empty) {
            logger.log("there are no products");
        }
        newProductsSnapshot.forEach((doc) => {
            logger.log(doc.id, "=>", doc.data());
            newProducts.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        const onSaleProductsSnapshot = await Customer.getOnSaleProducts();

        if (onSaleProductsSnapshot.empty) {
            logger.log("there are no products");
        }
        onSaleProductsSnapshot.forEach((doc) => {
            logger.log(doc.id, "=>", doc.data());
            onSale.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        res.send({
            status: 200,
            data: {
                newProducts,
                onSale,
            },
        });
    } catch (error) {
        logger.log(`Error creating new product: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getProduct", async (req, res) => {
    const productId = req.query.productId;
    try {
        logger.log("calling the model function to get the product");
        const product = await Customer.getProduct(productId);
        res.send({
            status: 200,
            data: product,
            id: productId,
        });
    } catch (error) {
        logger.log(error);
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
        const brandsSnapshot = await Customer.getBrands();
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


router.get("/searchProducts", async (req, res) => {
    const searchTerm = req.query.searchTerm.toLowerCase();
    console.log(searchTerm);
    const products = [];
    const searchedProducts = [];
    try {
        logger.log("Calling model function get all products");
        const snapshot = await Customer.getProducts();
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
            const matchesColor = product.color.toLowerCase() === searchTerm;

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


// router.post("/filterProducts", async (req, res) => {
//     const {category, sortOrder, priceRange, size, color, brand} = req.body;
//     console.log(category, sortOrder, priceRange, size, color, brand);
//     const products = [];

//     try {
//         logger.log("Calling model function to get all products");
//         const snapshot = category != "*" ? await Customer.getProductsbyCategory(category.substring(1)) : await Customer.getProducts();
//         if (snapshot.empty) {
//             logger.log("There are no products");
//             throw "There are no products";
//         }
//         snapshot.forEach((doc) => {
//             // logger.log(doc.id, "=>", doc.data());
//             products.push({
//                 id: doc.id,
//                 ...doc.data(),
//             });
//         });


//         // Parse priceRange
//         let minPrice = 0; let maxPrice = Infinity;

//         if (priceRange) {
//             const [min, max] = priceRange.split("-").map(Number);
//             minPrice = isNaN(min) ? 0 : min;
//             maxPrice = isNaN(max) ? Infinity : max;
//         }

//         console.log(minPrice, maxPrice);

//         // Apply filters using And across categories and OR within categories
//         const filteredProducts = products.filter((product) => {
//             // price range filter
//             const matchesPriceRange = product.price >= minPrice && product.price <= maxPrice;

//             // color filter
//             const matchesColor = !color || product.color.some((c) => color.split(",").map((color) => color.trim().toLowerCase()).includes(c.toLowerCase()));

//             const matchesSize = !size || product.size.some((s) => size.split(",").map((size) => size.trim().toLowerCase()).includes(s.toLowerCase()));

//             const matchesBrand = !brand || brand.split(",").map((b) => b.trim().toLowerCase()).includes(product.brand.toLowerCase());

//             // const matchesTags = !tags || product.tags.some((tag) => tags.split(",").map((t) => t.trim().toLowerCase()).includes(tag.toLowerCase()));

//             // All categories must match (AND logic)
//             return matchesPriceRange && matchesColor && matchesSize && matchesBrand;
//         });

//         // sort by price if requested
//         switch (sortOrder) {
//         case "low-to-high":
//             filteredProducts.sort((a, b) => a.price - b.price);
//             break;
//         case "high-to-low":
//             filteredProducts.sort((a, b) => b.price - a.price);
//             break;
//         case "old-to-new":
//             filteredProducts.sort((a, b)=> a.createdAt.toDate() - b.createdAt.toDate());
//             break;
//         default:
//             filteredProducts.sort((a, b)=> b.createdAt.toDate() - a.createdAt.toDate());
//         }

//         // if (sortOrder) {
//         //     if (sortOrder === "low-to-high") {
//         //         filteredProducts.sort((a, b) => a.price - b.price);
//         //     } else if (sortOrder === "high-to-low") {
//         //         filteredProducts.sort((a, b) => b.price - a.price);
//         //     }
//         // }


//         // Ensure at least one product passes through with partial matching (fallback)
//         // if (filteredProducts.length === 0) {
//         //     console.log("filtered products is:", 0);
//         //     // Implement a fallback logic, e.g., relax some filters or return all products
//         //     filteredProducts = products.filter((product) => {
//         //         return (
//         //             product.price >= minPrice && product.price <= maxPrice ||
//         //                 (color && product.color.some((c)=> color.split(",").map((color)=>color.trim().toLowerCase()).includes(c.toLowerCase()))) ||
//         //                 (size && product.size.some((s)=> size.split(",").map((size)=>size.trim().toLowerCase()).includes(s.toLowerCase()))) ||
//         //                 (tags && product.tags.some((tag) => tags.split(",").map((t) => t.trim().toLowerCase()).includes(tag.toLowerCase()))) ||
//         //                 (brand && brand.split(",").map((b) => b.trim().toLowerCase()).includes(product.brand.toLowerCase()))
//         //         );
//         //     });
//         // }

//         res.send({
//             status: 200,
//             data: filteredProducts,
//         });
//     } catch (error) {
//         logger.log(`Error getting searched products: ${error}`);
//         res.send({
//             status: 400,
//             message: error,
//         });
//     }
// });

router.post("/filterProducts", async (req, res) => {
    const {category, sortOrder, priceRange, size, color, brand} = req.body;
    console.log(category, sortOrder, priceRange, size, color, brand);
    const products = [];

    try {
        logger.log("Calling model function to get all products");
        const snapshot = category != "*" ? await Customer.getProductsbyCategory(category.substring(1)) : await Customer.getProducts();
        if (snapshot.empty) {
            logger.log("There are no products");
            throw "There are no products";
        }
        snapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Parse priceRange
        let minPrice = 0; let maxPrice = Infinity;
        if (priceRange) {
            const [min, max] = priceRange.split("-").map(Number);
            minPrice = isNaN(min) ? 0 : min;
            maxPrice = isNaN(max) ? Infinity : max;
        }

        // Convert comma-separated strings to arrays for comparison
        const sizesArray = size ? size.split(",").map((s) => s.trim().toLowerCase()) : null;
        const colorsArray = color ? color.split(",").map((c) => c.trim().toLowerCase()) : null;
        const brandsArray = brand ? brand.split(",").map((b) => b.trim().toLowerCase()) : null;

        // Apply filters
        const filteredProducts = products.filter((product) => {
            // Price filter: Handle array or single value
            const matchesPriceRange = product.price ?
                (Array.isArray(product.price) ?
                    product.price.some((price) => price >= minPrice && price <= maxPrice) :
                    product.price >= minPrice && product.price <= maxPrice) :
                false;

            // Color filter: Compare against array of colors
            const matchesColor = !colorsArray || (product.color && colorsArray.includes(product.color.toLowerCase()));

            // Size filter: Check within variations against size array
            const matchesSize = !sizesArray || (product.variations && product.variations.some((variation) => {
                return sizesArray.includes(variation.size.toLowerCase());
            }));

            // Brand filter: Compare against array of brands
            const matchesBrand = !brandsArray || (product.brand && brandsArray.includes(product.brand.toLowerCase()));

            // All categories must match (AND logic)
            return matchesPriceRange && matchesColor && matchesSize && matchesBrand;
        });

        // Sort products
        switch (sortOrder) {
        case "low-to-high":
            filteredProducts.sort((a, b) => (Array.isArray(a.price) ? Math.min(...a.price) : a.price) - (Array.isArray(b.price) ? Math.min(...b.price) : b.price));
            break;
        case "high-to-low":
            filteredProducts.sort((a, b) => (Array.isArray(b.price) ? Math.min(...b.price) : b.price) - (Array.isArray(a.price) ? Math.min(...a.price) : a.price));
            break;
        case "old-to-new":
            filteredProducts.sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate());
            break;
        default:
            filteredProducts.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
        }

        res.send({
            status: 200,
            data: filteredProducts,
        });
    } catch (error) {
        logger.log(`Error getting searched products: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


router.post("/addToCart", async (req, res) => {
    const {productId, userId, quantity, size, color} = req.body;
    console.log(req.body);

    try {
        logger.log("Calling model function to get product image and name");
        const productData = await inspectProduct(productId, quantity, size);
        console.log(productData);


        // Find the correct variation that matches the selected color and size
        const selectedVariation = productData.variations.find(
            (variation) => variation.size === size,
        );

        // If a matching variation is found, get the price
        let variationPrice = 0;
        if (selectedVariation) {
            variationPrice = selectedVariation.price;
        }

        const productImage = productData.images[0];

        // assemble cartBody
        const cartData = {
            productId: productId,
            quantity: parseInt(quantity),
            image: productImage,
            color: color,
            name: productData.name,
            category: productData.category,
            size: size,
            price: variationPrice,
        };

        console.log(cartData);

        logger.log("calling the model function to check if cart already exists");
        const cartDoc = await Customer.getCart(userId);
        if (!cartDoc.exists) {
            // create new cart for the user
            logger.log("calling the model to create new cart for user");
            await Customer.createCart(userId, [cartData]);
            res.send({
                status: 200,
                message: "Item successfully added to cart",
                data: {
                    name: productData.name,
                    image: productImage,
                },
            });
        } else {
            // add to existing cart
            logger.log("calling the model to add to existing cart");
            const cart = cartDoc.data();
            const cartItems = cart.items;

            // Check if the item already exists based on productId, color, and size
            const existingItemIndex = cartItems.findIndex((item) => item.productId === productId && item.color === color && item.size === size);

            if (existingItemIndex !== -1) {
                // If the item exists, update its quantity
                const existingItem = cartItems[existingItemIndex];
                existingItem.quantity += parseInt(quantity); // Add the new quantity to the existing quantity
                cartItems[existingItemIndex] = existingItem; // Update the cart array with the updated item
                await Customer.updateCart(userId, cartItems); // Save the updated cart

                res.send({
                    status: 200,
                    message: "Item quantity updated in cart",
                    data: {
                        name: productData.name,
                        image: productImage,
                    },
                });
            } else {
                // If the item doesn't exist, add the new item to the cart
                cartItems.push(cartData);
                await Customer.updateCart(userId, cartItems); // Save the updated cart

                res.send({
                    status: 200,
                    message: "Item successfully added to cart",
                    data: {
                        name: productData.name,
                        image: productImage,
                    },
                });
            }
        }
    } catch (error) {
        logger.log(`Error adding to cart: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/syncCart", async (req, res) => {
    const {userId, cart} = req.body;

    try {
        // Fetch the user's current cart
        const cartDoc = await Customer.getCart(userId);
        const existingCart = cartDoc.exists ? cartDoc.data().items : [];

        // Loop through the new cart data and merge it with the existing cart
        cart.forEach((newItem) => {
            // Find the existing item in the cart that matches the productId, color, and size
            const existingItemIndex = existingCart.findIndex(
                (item) =>
                    item.productId === newItem.productId &&
                    item.color === newItem.color &&
                    item.size === newItem.size,
            );

            if (existingItemIndex !== -1) {
                // If the item exists, update its quantity
                existingCart[existingItemIndex].quantity += newItem.quantity;
                if (existingCart[existingItemIndex].quantity <= 0) {
                    // If quantity is zero or less, remove it from the cart
                    existingCart.splice(existingItemIndex, 1);
                }
            } else {
                // If the item doesn't exist in the cart, add it
                existingCart.push(newItem);
            }
        });

        if (!cartDoc.exists) {
            // If no existing cart, create a new one with the incoming cart data
            await Customer.createCart(userId, cart);
        } else {
            // Update the existing cart with the merged cart data
            await Customer.updateCart(userId, existingCart);
        }

        res.send({
            status: 200,
            message: "User cart successfully synced",
        });
    } catch (error) {
        logger.log(`Error syncing user cart: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


// get cart
router.get("/getCart", async (req, res) => {
    const userId = req.query.userId;
    try {
        logger.log("Calling model function to get cart");
        const cartDoc = await Customer.getCart(userId);
        if (!cartDoc.exists) {
            throw "User has no cart";
        } else {
            // Calculate the total price
            const cartData = cartDoc.data();
            logger.log("Calling function to calculate total price of cart items");
            const totalPrice = await calculateTotal(cartData.items);
            console.log(`total price: ${totalPrice}`);
            res.send({
                status: 200,
                message: "User cart fetched successfully",
                cart: {
                    ...cartData,
                    totalPrice: totalPrice,

                },
            });
        }
    } catch (error) {
        logger.log(`Error adding get cart: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


// update cart item
router.post("/updateCartItem", async (req, res) => {
    console.log(req.body);
    const {userId, productId, color, size, quantity} = req.body;

    try {
        logger.log("Calling model function to get product image and name");


        logger.log("Calling model function to get cart");
        const cartDoc = await Customer.getCart(userId);
        if (!cartDoc.exists) {
            throw "User has no cart";
        }

        // Get the current items array
        const cartData = cartDoc.data();
        const cartItems = cartData.items;

        // Find the index of the cart item based on productId, color, and size
        const existingItemIndex = cartItems.findIndex((item) => item.productId === productId && item.color === color && item.size === size);

        if (existingItemIndex === -1) {
            throw "Item not found in cart"; // If the item doesn't exist in the cart
        }

        // Update the quantity (either increase or decrease based on quantityChange)
        const existingItem = cartItems[existingItemIndex];
        console.log(existingItem);
        existingItem.quantity = quantity;
        console.log(existingItem);

        // If quantity is 0 or less, remove the item from the cart
        if (existingItem.quantity <= 0) {
            cartItems.splice(existingItemIndex, 1); // Remove the item from the cart if quantity is 0 or less
        } else {
            cartItems[existingItemIndex] = existingItem; // Update the item in the cart
        }

        // Write the updated items array back to Firestore
        logger.log("Calling model function to update cart");
        console.log(cartItems);
        await Customer.updateCart(userId, cartItems);

        res.send({
            status: 200,
            message: "Cart item successfully updated",
        });
    } catch (error) {
        logger.log(`Error updating cart item: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


// remove cart item
router.post("/removeCartItem", async (req, res) => {
    console.log(req.body);
    // eslint-disable-next-line no-unused-vars
    const {userId, productId, color, size} = req.body;

    try {
        logger.log("Calling model function to get cart");
        const cartDoc = await Customer.getCart(userId);
        if (!cartDoc.exists) {
            throw "User has no cart";
        }

        // Get the current items array
        const cartData = cartDoc.data();
        const cartItems = cartData.items;
        logger.log(`Current cart items: ${cartItems}`);

        // Find the index of the cart item based on productId, color, and size
        const itemIndex = cartItems.findIndex((item) => item.productId === productId && item.size === size);

        if (itemIndex === -1) {
            throw "Item not found in cart"; // If the item doesn't exist in the cart
        }

        // Remove the item from the cart
        cartItems.splice(itemIndex, 1);
        logger.log(`Cart items after removal: ${cartItems}`);

        // Write the updated items array back to Firestore
        logger.log("Calling model function to update cart");
        await Customer.updateCart(userId, cartItems);

        res.send({
            status: 200,
            message: "Cart item successfully removed",
        });
    } catch (error) {
        logger.log(`Error removing cart item: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


// delete cart
router.post("/deleteCart", async (req, res) => {
    const {userId} = req.body;
    try {
        logger.log("Calling model to get cart");
        const cartDoc = await Customer.getCart(userId);
        if (!cartDoc.exists) {
            throw "User has no cart";
        }
        // delete cart
        await Customer.deleteCart(userId);
        res.send({
            status: 200,
            message: "Cart deleted successfully",
        });
    } catch (error) {
        logger.log(`Error deleting cart: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/createOrder", async (req, res) => {
    console.log(req.body);
    const {deliveryMethod, shippingCost} = req.body;
    let deliveryAddress = "";
    try {
        // check if user has cart
        logger.log("Calling model function to check if user has carts");
        const cartDoc = await Customer.getCart(req.user.id);
        if (!cartDoc.exists) {
            throw "cart not found";
        }

        // get User's default address
        if (deliveryMethod.toLowerCase() === "door delivery") {
            if (!shippingCost || shippingCost === 0) {
                throw ("Shipping cost is required. Select shipping option");
            }

            // Get user info
            const customerDoc = await Customer.getCustomerData(req.user.id);
            const customerData = customerDoc.data();

            if (customerData.addresses.length <= 0) {
                throw ("User must enter a delivery address");
            }

            console.log(customerData.addresses);

            // Find the default delivery address
            deliveryAddress = customerData.addresses.find((address) => address.status.toLowerCase() === "default");

            if (!deliveryAddress) {
                throw ("No default delivery address found");
            }

            console.log(deliveryAddress);
        }


        const cartData = cartDoc.data();
        const subtotal = await calculateTotal(cartData.items);
        const vat = await addVat(subtotal);
        const checkoutTotalPrice = subtotal + vat + shippingCost;
        console.log(checkoutTotalPrice);

        // assemble orderdata
        const orderData = {
            userId: req.user.id,
            orderDate: new Date().toISOString(),
            status: "Pending",
            subTotal: subtotal,
            vat: vat,
            shippingCost: shippingCost,
            totalAmount: parseInt(checkoutTotalPrice),
            deliveryMethod: deliveryMethod,
            deliveryAddress: deliveryAddress,
            purchaseMode: "online-store",

            // billingAddress: billingAddress
            // paymentMethod: "paymentMethod",
            paymentStatus: "Pending",
            items: cartData.items,
        };

        // create an order
        const order = await Customer.createOrder(orderData);

        // initialize paystack payment
        const paymentResponse = await initializePayment(req.user.email, orderData.totalAmount, order);
        console.log(paymentResponse.data.data.authorization_url);

        res.send({
            status: 200,
            message: "Order created successfully. Your will receive a confirmation email",
            insertId: order,
            amount: orderData.totalAmount,
            paymentUrl: paymentResponse.data.data.authorization_url,
        });
    } catch (error) {
        logger.log(`Error creating order: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

async function initializePayment(email, amount, orderId) {
    const paymentData = {
        "email": email,
        "amount": amount,
        "callback_url": `https://www.theokiddies.com/order-confirmation`,
        "metadata": {
            "orderId": orderId,
        },
    };
    try {
        const paymentResponse = await axios.post("https://api.paystack.co/transaction/initialize", paymentData, {
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        return paymentResponse;
    } catch (error) {
        console.log(error);
        throw `Error initializing payment:${error}`;
    }
}

router.post("/confirmPayment", async (req, res) => {
    console.log(req.body);
    const {reference} = req.body;

    try {
        // confirming payment status
        const paymentConfirmationResponse = await confirmPayment(reference);
        console.log(paymentConfirmationResponse);


        const paymentData = {
            transacionId: paymentConfirmationResponse.id,
            reference: paymentConfirmationResponse.reference,
            orderId: paymentConfirmationResponse.metadata.orderId,
            userId: req.user.id,
            amount: paymentConfirmationResponse.amount,
            paymentMethod: paymentConfirmationResponse.channel,
            paymentDate: paymentConfirmationResponse.paid_at,
            status: paymentConfirmationResponse.status,
        };

        // creating a firestore entry for the payment
        const payment = await Customer.createPayment(paymentData);

        // get orderDetails
        const order = await Customer.getOrder(paymentConfirmationResponse.metadata.orderId);
        const orderId = paymentConfirmationResponse.metadata.orderId;

        // updating the order with the paymentStatus
        if (paymentConfirmationResponse.status === "success" && order.totalAmount === paymentConfirmationResponse.amount) {
            await Customer.updateOrder(paymentConfirmationResponse.metadata.orderId, {
                paymentStatus: "paid",
                status: "confirmed",
                paymentMethod: paymentConfirmationResponse.channel,
                paymentId: payment,
            });
            // Clear the cart
            await Customer.deleteCart(req.user.id);
            // update inventory
            await updateInventory(orderId);
            res.send({
                status: 200,
                message: "Payment completed",
                order: {
                    orderId,
                    ...order,
                },
            });
        } else if (paymentConfirmationResponse.status === "success" && order.totalAmount > paymentConfirmationResponse.amount) {
            await Customer.updateOrder(paymentConfirmationResponse.metadata.orderId, {
                paymentStatus: "payment made but not completed",
                status: "pending",
                paymentMethod: paymentConfirmationResponse.channel,
                paymentId: payment,
            });
            await updateInventory(orderId);
            res.send({
                status: 201,
                message: "payment made is lesser an order amount",
                order: {
                    orderId,
                    ...order,
                },
            });
        } else {
            await Customer.updateOrder(paymentConfirmationResponse.metadata.orderId, {
                paymentStatus: "failed",
                status: "failed",
                paymentMethod: paymentConfirmationResponse.channel,
                paymentId: payment,
            });
            throw new Error("Payment failed for order: " + paymentConfirmationResponse.metadata.orderId);
        }
    } catch (error) {
        logger.log(`Error confirming payment: ${error}`);
        res.send({
            status: 400,
            message: "An error occurred during payment processing",
            error: error.message || error,
        });
    }
});

async function confirmPayment(reference) {
    try {
        const paymentConfirmationResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        return paymentConfirmationResponse.data.data;
    } catch (error) {
        console.log(error);
        throw `Error confirming payment status:${error}`;
    }
}


// get orders
router.get("/getOrders", async (req, res) => {
    const userId = req.query.userId;
    const orders = [];

    try {
        logger.log("Calling model function to get orders");
        const snapshot = await Customer.getOrders(userId);
        if (snapshot.empty) {
            logger.log("User has no orders");
            res.send({
                status: 202,
                data: orders,
            });
        }
        snapshot.forEach((doc) => {
            logger.log(doc.id, "=>", doc.data());
            orders.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        // TODO: fetch items data by there id's in the product document
        res.send({
            status: 200,
            data: orders,
        });
    } catch (error) {
        logger.log(`Error getting your orders: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.get("/getOrder", async (req, res) => {
    const orderId = req.query.orderId;

    try {
        logger.log("Calling model function to get order details");
        const order = await Customer.getOrder(orderId);

        res.send({
            status: 200,
            data: order,
        });
    } catch (error) {
        logger.log(`Error getting your orders: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});

router.post("/addToWishlist", async (req, res) => {
    console.log(req.body);
    const {userId, productId} = req.body;

    const wishlistData = {
        productId: productId,
    };

    try {
        logger.log("calling the model function to check if wishlist already exists");
        const wishlistDoc = await Customer.getWishlist(userId);
        if (!wishlistDoc.exists) {
            // create new wishlist for the user
            logger.log("calling the model to create new wishlist for user");
            await Customer.createWishlist(userId, wishlistData);
            res.send({
                status: 200,
                message: "Product successfully added to wishlist",
                // data: {
                //     name: productData.name,
                //     image: productImage
                // }
            });
        } else {
            // add to existing wishlist
            logger.log("calling the model to add to existing wishlist");
            const wishlist = wishlistDoc.data();
            const wishlistItems = wishlist.items;

            const exists = await wishlistItems.some((item) => item.productId === productId);
            if (exists) {
                res.send({
                    status: 200,
                    message: "Product has already been added to wishlist",
                    // data: {
                    //     name: productData.name,
                    //     image: productImage
                    // }
                });
            } else {
                // push new item unto the items array in the wishlist doc
                wishlistItems.push(wishlistData);
                await Customer.updateWishlist(userId, wishlistItems);
                res.send({
                    status: 200,
                    message: "Product successfully added to cart",
                    // data: {
                    //     name: productData.name,
                    //     image: productImage
                    // }
                });
            }
        }
    } catch (error) {
        logger.log(`Error adding to wishlist: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});
// get cart
router.get("/getWishlists", async (req, res) => {
    const userId = req.query.userId;
    try {
        logger.log("Calling model function to get wishlist");
        const wishlistDoc = await Customer.getWishlist(userId);
        if (!wishlistDoc.exists) {
            res.send({
                status: 202,
                message: "User has no wishlist",
                data: [],
            });
        } else {
            // use the productids to get products data.
            const wishlist = wishlistDoc.data();
            const products = [];
            const filteredProducts = [];

            logger.log("Calling model function to get products");
            const snapshot = await Customer.getProducts();
            if (snapshot.empty) {
                logger.log("there are no products");
                res.send({
                    status: 400,
                    message: "There are no products at this time",
                });
            }
            snapshot.forEach((doc) => {
                logger.log(doc.id, "=>", doc.data());
                products.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            await wishlist.items.forEach(async (item, index) => {
                const product = await products.find((product) => product.id === item.productId);
                filteredProducts.push({
                    index: index,
                    ...product,
                });
            });

            res.send({
                status: 200,
                message: "User wishlist fetched successfully",
                data: filteredProducts,
            });
        }
    } catch (error) {
        logger.log(`Error getting wishlist: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


router.post("/removeWishlistItem", async (req, res) => {
    logger.log(req.body);
    const {userId, productId} = req.body;
    try {
        logger.log("Calling model function to get wishlist");
        const wishlistDoc = await Customer.getWishlist(userId);
        if (!wishlistDoc.exists) {
            throw "User has no wishlist";
        }
        // get the current items array
        const wishlistData = wishlistDoc.data();
        const wishlistItems = wishlistData.items;
        logger.log(`current wishlist items ${wishlistItems}`);

        // check if product exists in the user's wishlist
        const exists = await wishlistItems.some((item) => item.productId == productId);
        if (!exists) {
            throw "This product is not in your wishlist or you already removed it";
        }

        const updatedWishlist = await wishlistItems.filter((item) => item.productId !== productId);

        // write the updated items array back to firestore
        logger.log("Calling model function to update wishlist");
        await Customer.updateWishlist(userId, updatedWishlist);
        res.send({
            status: 200,
            message: "product item successfully removed from wishlist",
        });
    } catch (error) {
        logger.log(`Error removing wishlist item: ${error}`);
        res.send({
            status: 400,
            message: error,
        });
    }
});


// router.post('/updateOrderStatus', async (req, res) => {
//     const orderId = req.query.orderId;
//     console.log(req.body);
//     try {
//         logger.log("calling the model to update the order");
//         await Customer.updateOrderStatus(orderId, req.body);
//         res.send({
//             status: 200,
//             message: "Successfully updated the order status"
//         });
//     } catch (error) {
//         logger.log(`Error updating order status: ${error}`)
//         res.send({
//             status: 400,
//             message: error
//         });
//     }
// });


router.post("/productViewCount", async (req, res) => {
    console.log(req.body);
    const productId = req.body.productId;
    try {
        logger.log("Calling model function to get check if product exists");
        await Customer.getProduct(productId);
        logger.log("Calling model function to check if product has been viewed before");
        const isproductView = await Admin.isProductViewed(productId);
        if (!isproductView.exists) {
            logger.log("calling model function to add product view count");
            await Admin.addProductViewCount(productId, 1);
        } else {
            logger.log("calling model function to increase product view count");
            const currentCount = isproductView.data().count;
            await Admin.updateProductViewCount(productId, currentCount + 1);
        }
        res.send({
            status: 200,
        });
    } catch (error) {
        logger.log(error);
        res.send({
            status: 400,
        });
    }
});


// updateOrderStatus
// update payment status in payments and orders based on transaction.

async function inspectProduct(productId, quantity, size) {
    try {
        const productDoc = await Customer.getProduct(productId);

        // Find the variation that matches the provided size
        const sizeVariation = productDoc.variations.find(
            (variation) => variation.size === size,
        );

        if (!sizeVariation) {
            throw `Size "${size}" is not available for this product.`;
        }

        // Check if the requested quantity is available
        if (sizeVariation.stock < quantity) {
            throw `Only ${sizeVariation.stock} of size "${size}" remain.`;
        }

        return productDoc;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


async function calculateTotal(cart) {
    console.log(cart);
    try {
        return cart.reduce((total, item) => {
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

// async function updateInventory(orderId) {
//     console.log("Updating inventory");

//     try {
//         const order = await Customer.getOrder(orderId);

//         // Loop through each item in the order sequentially
//         for (const item of order.items) {
//             const product = await Customer.getProduct(item.productId);

//             if (!product || !product.variations) {
//                 console.error(`Product ${item.productId} not found or does not have variations`);
//                 continue; // Skip to the next item
//             }

//             // Update stock level for each variation size
//             const updatedVariations = product.variations.map((variation) => {
//                 if (variation.size === item.size) {
//                     const updatedStock = variation.stock - item.quantity;

//                     if (updatedStock < 0) {
//                         throw new Error(`Insufficient stock for product ${item.productId}, size ${item.size}`);
//                     }

//                     return {
//                         ...variation,
//                         stock: updatedStock,
//                     };
//                 }
//                 return variation; // No change for other variations
//             });

//             // Calculate new total stock level
//             const newStockLevel = updatedVariations.reduce((total, variation) => total + variation.stock, 0);

//             // Update the quantity sold field (initialize if not present)
//             const updatedQuantitySold = (product.quantitySold || 0) + item.quantity;

//             // Update product in the database
//             await Customer.updateProductQuantity(item.productId, {
//                 variations: updatedVariations,
//                 stockLevel: newStockLevel, // Update total stock level
//                 quantitySold: updatedQuantitySold, // Add or update quantity sold
//             });

//             console.log(`Product ${item.productId} updated successfully`);
//         }
//     } catch (error) {
//         console.error(`Error updating inventory: ${error.message}`);
//     }
// }

async function updateInventory(orderId) {
    console.log("Updating inventory");

    try {
        const order = await Customer.getOrder(orderId);

        // Loop through each item in the order
        for (const item of order.items) {
            const product = await Customer.getProduct(item.productId);

            if (!product || !product.variations) {
                console.error(`Product ${item.productId} not found or does not have variations`);
                continue; // Skip to the next item
            }

            // Update stock level and sold quantity for each variation size
            const updatedVariations = product.variations.map((variation) => {
                if (variation.size === item.size) {
                    const updatedStock = variation.stock - item.quantity;

                    if (updatedStock < 0) {
                        throw new Error(`Insufficient stock for product ${item.productId}, size ${item.size}`);
                    }

                    return {
                        ...variation,
                        stock: updatedStock,
                        sold: (variation.sold || 0) + item.quantity, // Track sold quantity per variation
                    };
                }
                return variation; // No change for other variations
            });

            // Calculate new total stock level
            const newStockLevel = updatedVariations.reduce((total, variation) => total + variation.stock, 0);

            // Calculate total quantity sold across all variations
            const totalQuantitySold = updatedVariations.reduce((total, variation) => total + (variation.sold || 0), 0);

            // Update product in the database
            await Customer.updateProductQuantity(item.productId, {
                variations: updatedVariations,
                stockLevel: newStockLevel, // Update total stock level
                quantitySold: totalQuantitySold, // Store total quantity sold at product level
            });

            console.log(`Product ${item.productId} updated successfully`);
        }
    } catch (error) {
        console.error(`Error updating inventory: ${error.message}`);
    }
}
router.post("/updatePassword", async (req, res) => {
    const {userId, newPassword} = req.body;
    try {
        await Auth.updateUser(userId, {
            password: newPassword,
        });
        res.send({
            status: 200,
            message: "Password update successful",
        });
    } catch (error) {
        console.log(error);
        res.send({
            status: 400,
            message: "Error updating user password",
        });
    }
});


// async function sendWelcomeEmail(){

// }


module.exports = router;
