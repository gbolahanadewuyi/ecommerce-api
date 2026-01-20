/* eslint-disable no-throw-literal */

const {onRequest, Auth} = require("./config/firebase");
const backgroundFunctions = require("./background");
const express = require("express");
const cors = require("cors");
const app = express();
// Automatically allow cross-origin requests
app.use(cors({origin: true}));

// Import routes from other files
const adminRoutes = require("./admin");
const customerRoutes = require("./customer");

// Middleware
const authenticateUser = async (req, res, next)=>{
    // log request path
    console.log(req.path);
    try {
        if (req.path === "/admin/register" ||
             // eslint-disable-next-line max-len
             req.path === "/customer/register" || /^\/customer\/(getProducts|searchProducts|filterProducts|productViewCount|getProduct|getNewArrivalAndOnsaleProducts|updatePassword|getBrands)$/.test(req.path) ) {
            next();
        } else if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            throw "Unauthorized: No authorization header or token";
        } else {
            const token = req.headers.authorization.split("Bearer ")[1];
            // console.log(token);
            const claims = await Auth.verifyIdToken(token);
            console.log(claims);
            if (/\/admin\/.*/.test(req.path) && claims.admin === true) {
                req.user = {
                    id: claims.uid,
                    email: claims.email,
                };
                next();
            } else if (/\/customer\/.*/.test(req.path) && claims) {
                req.user = {
                    id: claims.uid,
                    email: claims.email,
                };
                next();
            } else {
                throw "Unauthorized: User is not authorised to access this resource";
            }
        }
    } catch (error) {
        console.log(error);
        res.json({
            status: 403,
            message: error,
        });
    }
};


app.use(authenticateUser);
// Use the imported routes
app.use("/admin", adminRoutes);
app.use("/customer", customerRoutes);

// http based routes
exports.api = onRequest(app);

// background functions
exports.customerCreated = backgroundFunctions.customerCreated;
exports.orderCreated = backgroundFunctions.createNewOrder;
exports.confirmOrder = backgroundFunctions.confirmOrder;

