/* eslint-disable max-len */
const {
    onDocumentCreated,
    onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const {SibApiV3Sdk, getMessaging} = require("./config/firebase");

const Admin = require("./models/admin");

const Customer = require("./models/customer");

exports.customerCreated = onDocumentCreated("customers/{customerId}", async (event, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }
    const newCustomer = snapshot.data();


    console.log("New user created:", newCustomer);
    console.log("env variable apikey:", process.env.SENDINGBLUEAPIKEY);
    await sendWelcomeMail(newCustomer);

    // perform more operations ...
});


exports.createNewOrder = onDocumentCreated("orders/{orderId}", async (event, context) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }
    const newOrder = snapshot.data();


    console.log("New order created:", newOrder);
    newOrder["id"]= event.params.orderId;
    try {
        const customerDoc = await Customer.getCustomerData(newOrder.userId);
        const customer = customerDoc.data();
        await sendOrderRecievedEmail(customer, newOrder);
    } catch (error) {
        console.log(error);
    }

    // get user info.

    // await sendNewOrderNotificationToAdmin(newOrder);
    // await sendOrderConfirmationNotification(newOrder);


    // perform more operations ...
});

exports.confirmOrder = onDocumentUpdated("orders/{orderId}", async (event, context)=>{
    const order = event.data.after.data();
    console.log("order updated:", order);
    order["id"]= event.params.orderId;

    try {
        const customerDoc = await Customer.getCustomerData(order.userId);
        const customer = customerDoc.data();
        if ( order.status.toLowerCase() === "confirmed" && order.paymentStatus.toLowerCase() === "paid" && order.paymentId) {
            await sendOrderConfirmationEmail(customer, order);

            // get registeredDeviceTokens
            const registeredTokens = await getRegisteredTokens();
            console.log(registeredTokens);

            const payload = {
                "notification": {
                    title: "New Order Confirmed",
                    body: `Order #${order.id} confirmed!`,
                },
                "webpush": {
                    "headers": {
                        "image": "https://admin.theokiddies.com/1.png",
                    },
                    "fcm_options": {
                        "link": `https://admin.theokiddies.com/sales/order-details?${order.id}`,
                    },
                },
                
                "tokens": registeredTokens,
            };

            // const payload = {
            //     data: {
            //         title: "New Order Confirmed",
            //         body: `Order #${order.id} confirmed!`,
            //         image: "https://admin.theokiddies.com/1.png",
            //         link: `https://admin.theokiddies.com/sales/online-orders?${order.id}`,
            //     },
            //     tokens: registeredTokens,
            // };
          

            // Send the notification to the admin's device
            getMessaging().sendEachForMulticast(payload)
                .then((response) => {
                    if (response.failureCount > 0) {
                        const failedTokens = [];
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) {
                                failedTokens.push(registeredTokens[idx]);
                            }
                        });
                        console.log("List of tokens that caused failures: " + failedTokens);
                    }
                });
        } else {
            await sendOrderCancelledEmail(customer, order);
        }
    } catch (error) {
        console.log(error);
    }
   

    // perform more operations ...
});

// send alert
// eslint-disable-next-line no-unused-vars
async function sendWelcomeMail(newCustomer) {
    try {
        const sendMail =
            await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
                subject: "Welcome to Theo Kiddies",
                sender: {
                    email: "welcome@theokiddies.com",
                    name: "Theo Kiddies",
                },
                to: [{
                    email: newCustomer.email,
                }],
                // eslint-disable-next-line max-len
                htmlContent: `<!-- Full Email Template -->
<div style="max-width: 600px; margin: 0 auto; font-family: Poppins-Medium, sans-serif; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background-color: #e6e6e6; padding: 20px; text-align: center;">
    <img src="https://firebasestorage.googleapis.com/v0/b/theokiddies-97d24.appspot.com/o/Theo%20Kiddies%20Logo_Logo%203v1%20copy.png?alt=media&token=3c38f135-93f2-44d7-b11d-dedc6b2fb6fd" alt="Company Logo" style="max-width: 200px; display: block; margin: 0 auto;" draggable="false"/>
  <!--  <p style="color: #777777; margin-top: 5px; margin-bottom: 0;">Discover stylish and affordable kids' clothing at Theo Kiddies. Shop trendy, comfortable, and durable outfits for babies, toddlers, and children in Nigeria. Fast delivery nationwide!</p> -->
  </div>
   
  <!-- Body -->
  <div style="padding: 20px; color: #333333;">
    <h2 style="color: #d66536;">Welcome to Theo Kiddies 🎉</h2>
    <p>Hello ${newCustomer.firstname} ☺️</p> 
    <p>Thank you for registering with Theo Kiddies. We are excited to have you on board and look forward to your first purchase.</p>
    
    <p>Start exploring our store by clicking the button below:</p>
    
    <a href="www.theokiddies.com/shop" style="background-color: #d66536; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Get Started
    </a>
    
    <p>If you have any questions, feel free to <a href="support@theokiddies.com" style="color: #d66536;">contact us</a> anytime.</p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
    <p style="color: #d66536;">Theo Kiddies | Sherrif Plaza | <a href="tel:+1234567890" style="color: #d66536;">+123 456 7890</a></p>
    <p style="color: #929673;">
      <a href="https://www.facebook.com/yourbrand" style="margin-right: 10px; color: #929673;">Facebook</a> | 
      <a href="https://www.instagram.com/yourbrand" style="margin-left: 10px; color: #929673;">Twitter</a>
    </p>
    <p><a href="https://yourdomain.com/unsubscribe" style="color: #777777;">Unsubscribe</a></p>
  </div>
  
</div>
`,
            });
        console.log(sendMail);
    } catch (error) {
        console.log(error);
    }
}


async function sendOrderRecievedEmail(customer, order) {
    try {
        const sendMail =
            await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
                subject: "Order Recieved",
                sender: {
                    email: "sales@theokiddies.com",
                    name: "Theo Kiddies",
                },
                to: [{
                    email: customer.email,
                }],
                // eslint-disable-next-line max-len
                htmlContent: `<!-- Full Email Template -->
<div style="max-width: 600px; margin: 0 auto; font-family: Poppins-Medium, sans-serif; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background-color: #e6e6e6; padding: 20px; text-align: center;">
    <img src="https://firebasestorage.googleapis.com/v0/b/theokiddies-97d24.appspot.com/o/Theo%20Kiddies%20Logo_Logo%203v1%20copy.png?alt=media&token=3c38f135-93f2-44d7-b11d-dedc6b2fb6fd" alt="Company Logo" style="max-width: 200px; display: block; margin: 0 auto;" draggable="false"/>
  <!--  <p style="color: #777777; margin-top: 5px; margin-bottom: 0;">Discover stylish and affordable kids' clothing at Theo Kiddies. Shop trendy, comfortable, and durable outfits for babies, toddlers, and children in Nigeria. Fast delivery nationwide!</p> -->
  </div>
   
  <!-- Body -->
  <div style="padding: 20px; color: #333333;">
    <h2 style="color: #d66536;">Thank you for your order! 🎉</h2>
     <p>Hi ${customer.firstname},</p> 
    <p>We have recieved your order <b>[${order.id}]</b> and it is now being processed while we confirm your payment. Here are the details: </p> 

         <!-- Order Details Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; background-color: #d66536;">Item</th>
              <th style="text-align: left; padding: 8px; background-color: #d66536;"></th>
              <th style="text-align: left; padding: 8px; background-color: #d66536;">Quantity</th>
              <th style="text-align: right; padding: 8px; background-color: #d66536;">Price</th>
            </tr>
          </thead>
          <tbody>
          ${order.items.map((item) => `                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><img src="${item.image}" alt="product image" style="width: 60px; display: block; margin: 0 auto;" draggable="false"/></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">₦${item.price.toLocaleString()}</td>
                </tr>
             `).join("")
}
</tbody>
</table>
     <!-- Order Summary -->
        <table style="width: 100%; margin-top: 5px;">
          <tr>
            <td style="padding: 8px;">Subtotal</td>
            <td style="padding: 8px; text-align: right;">₦${order.totalAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px;">Shipping</td>
            <td style="padding: 8px; text-align: right;">₦${0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Total</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
          </tr>
        </table>



       <!-- Billing and Shipping Information Table -->
        <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
         <tr>
              <th style="text-align: left; padding: 8px; background-color: #d66536;">Shipping Information</th>
            </tr>
          <tr>
            <!-- Shipping Info Column -->
            <td style="width: 100%; vertical-align: top; padding: 10px;">
              ${order.deliveryMethod === "Door Delivery" ? `<p>${order.deliveryAddress.name} <br>
              ${order.deliveryAddress.address} <br>
              ${order.deliveryAddress.city}<br>
              ${order.deliveryAddress.state}<br>
              ${order.deliveryAddress.phone}</p>` : `<P>N/A</P>`}
            </td>
          </tr>
        </table>
  
    <p>Thanks for shopping with us. <br> If you have any questions  about your order, feel free to <a href="theokiddies.com/contact" style="color: #d66536;">contact us</a> anytime.</p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
    <p style="color: #d66536;">Theo Kiddies | Sherrif Plaza | <a href="tel:+1234567890" style="color: #d66536;">+123 456 7890</a></p>
    <p style="color: #929673;">
      <a href="https://www.facebook.com/yourbrand" style="margin-right: 10px; color: #929673;">Facebook</a> | 
      <a href="https://www.instagram.com/yourbrand" style="margin-left: 10px; color: #929673;">Twitter</a>
    </p>
    <p><a href="https://yourdomain.com/unsubscribe" style="color: #777777;">Unsubscribe</a></p>
  </div>
  
</div>
`,
            });
        console.log(sendMail);
    } catch (error) {
        console.log(error);
    }
}


async function sendOrderConfirmationEmail(customer, order) {
    try {
        const sendMail =
          await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
              subject: "Order Confirmed",
              sender: {
                  email: "sales@theokiddies.com",
                  name: "Theo Kiddies",
              },
              to: [{
                  email: customer.email,
              }],
              // eslint-disable-next-line max-len
              htmlContent: `<!-- Full Email Template -->
<div style="max-width: 600px; margin: 0 auto; font-family: Poppins-Medium, sans-serif; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden;">

<!-- Header -->
<div style="background-color: #e6e6e6; padding: 20px; text-align: center;">
  <img src="https://firebasestorage.googleapis.com/v0/b/theokiddies-97d24.appspot.com/o/Theo%20Kiddies%20Logo_Logo%203v1%20copy.png?alt=media&token=3c38f135-93f2-44d7-b11d-dedc6b2fb6fd" alt="Company Logo" style="max-width: 200px; display: block; margin: 0 auto;" draggable="false"/>
<!--  <p style="color: #777777; margin-top: 5px; margin-bottom: 0;">Discover stylish and affordable kids' clothing at Theo Kiddies. Shop trendy, comfortable, and durable outfits for babies, toddlers, and children in Nigeria. Fast delivery nationwide!</p> -->
</div>
 
<!-- Body -->
<div style="padding: 20px; color: #333333;">
  <h2 style="color: #d66536;">Thank you for your order! 🎉</h2>
   <p>Hi ${customer.firstname},</p> 
  <p>Your order <b>[${order.id}]</b> has been confirmed. Here are the details: </p> 

       <!-- Order Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; background-color: #d66536;">Item</th>
            <th style="text-align: left; padding: 8px; background-color: #d66536;"></th>
             <th style="text-align: left; padding: 8px; background-color: #d66536;">Size</th>
            <th style="text-align: left; padding: 8px; background-color: #d66536;">Quantity</th>
            <th style="text-align: right; padding: 8px; background-color: #d66536;">Price</th>
          </tr>
        </thead>
        <tbody>
        ${order.items.map((item) => `                <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><img src="${item.image}" alt="product image" style="width: 60px; display: block; margin: 0 auto;" draggable="false"/></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">₦${item.price.toLocaleString()}</td>
              </tr>
           `).join("")
}
</tbody>
</table>
   <!-- Order Summary -->
      <table style="width: 100%; margin-top: 5px;">
        <tr>
            <td style="padding: 8px;">Sub-Total</td>
            <td style="padding: 8px; text-align: right;">₦${order.subTotal.toLocaleString()}</td>
          </tr>
            <tr>
            <td style="padding: 8px;">VAT</td>
            <td style="padding: 8px; text-align: right;">₦${order.vat.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px;">Delivery Fee</td>
            <td style="padding: 8px; text-align: right;">₦${order.shippingCost.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Total</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
          </tr>
      </table>



     <!-- Billing and Shipping Information Table -->
      <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
       <tr>
            <th style="text-align: left; padding: 8px; background-color: #d66536;">Shipping Information</th>
          </tr>
        <tr>
          <!-- Shipping Info Column -->
          <td style="width: 100%; vertical-align: top; padding: 10px;">
            ${order.deliveryMethod === "Door Delivery" ? `<p>${order.deliveryAddress.name} <br>
            ${order.deliveryAddress.address} <br>
            ${order.deliveryAddress.city}<br>
            ${order.deliveryAddress.state}<br>
            ${order.deliveryAddress.phone}</p>` : `<P>N/A</P>`}
          </td>
        </tr>
      </table>

  <p>Thanks for shopping with us. <br> If you have any questions  about your order, feel free to <a href="theokiddies.com/contact" style="color: #d66536;">contact us</a> anytime.</p>
</div>

<!-- Footer -->
<div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
  <p style="color: #d66536;">Theo Kiddies | Sherrif Plaza | <a href="" style="color: #d66536;">08058557281</a></p>
  <p style="color: #929673;">
    <a href="https://www.facebook.com/yourbrand" style="margin-right: 10px; color: #929673;">Facebook</a> | 
    <a href="https://www.instagram.com/yourbrand" style="margin-left: 10px; color: #929673;">Twitter</a>
  </p>
  <p><a href="#" style="color: #777777;">Unsubscribe</a></p>
</div>

</div>
`,
          });
        console.log(sendMail);
    } catch (error) {
        console.log(error);
    }
}

async function sendOrderCancelledEmail(customer, order) {
    try {
        const sendMail =
        await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
            subject: "Order Cancelled",
            sender: {
                email: "sales@theokiddies.com",
                name: "Theo Kiddies",
            },
            to: [{
                email: customer.email,
            }],
            // eslint-disable-next-line max-len
            htmlContent: `<!-- Full Email Template -->
<div style="max-width: 600px; margin: 0 auto; font-family: Poppins-Medium, sans-serif; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden;">

<!-- Header -->
<div style="background-color: #e6e6e6; padding: 20px; text-align: center;">
<img src="https://firebasestorage.googleapis.com/v0/b/theokiddies-97d24.appspot.com/o/Theo%20Kiddies%20Logo_Logo%203v1%20copy.png?alt=media&token=3c38f135-93f2-44d7-b11d-dedc6b2fb6fd" alt="Company Logo" style="max-width: 200px; display: block; margin: 0 auto;" draggable="false"/>
<!--  <p style="color: #777777; margin-top: -5px; margin-bottom: 0;">Discover stylish and affordable kids' clothing at Theo Kiddies. Shop trendy, comfortable, and durable outfits for babies, toddlers, and children in Nigeria. Fast delivery nationwide!</p> -->
</div>

<!-- Body -->
<div style="padding: 20px; color: #333333;">
 <p>Hi ${customer.firstname},</p> 
<p>Your order <b>[${order.id}]</b> has been cancelled because your payment could not be completed</p> 
<p><b>This could have happened because:<b/></p>
<ul>
  <li>
    You attempted to pay via Debit/Credit Card but entered incorrect information, such as the Security PIN, Name, or Expiry Date, or your card is not activated for online transactions by your bank. We suggest selecting another payment method next time or calling your bank to enable your card for future transactions.
  </li>
  <li>
    You did not update the OTP sent by the bank as an SMS. Sometimes, the phone number registered with your card or bank account is different from the one you’re using during the transaction. Please call your bank to update to the correct phone number, or use the SIM card associated with your bank account to receive the OTP.
  </li>
  <li>
    You have insufficient funds/credit. In this case, select another payment method or complete the transaction after you have sufficient funds/credit on your card or bank account.
  </li>
  <li>
    The bank has declined to process this transaction.
  </li>
</ul>

<p>If any amount was debited from your mobile money/bank account, please <a href="theokiddies.com/contact" style="color: #d66536;">contact us</a>  and provide us with the details of the transaction</p>

<P>Here are the details:<p/>
     <!-- Order Details Table -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px; background-color: #d66536;">Item</th>
          <th style="text-align: left; padding: 8px; background-color: #d66536;"></th>
          <th style="text-align: left; padding: 8px; background-color: #d66536;">Quantity</th>
          <th style="text-align: right; padding: 8px; background-color: #d66536;">Price</th>
        </tr>
      </thead>
      <tbody>
      ${order.items.map((item) => `                <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><img src="${item.image}" alt="product image" style="width: 60px; display: block; margin: 0 auto;" draggable="false"/></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">₦${item.price.toLocaleString()}</td>
            </tr>
         `).join("")
}
</tbody>
</table>
 <!-- Order Summary -->
    <table style="width: 100%; margin-top: 5px;">
      <tr>
        <td style="padding: 8px;">Subtotal</td>
        <td style="padding: 8px; text-align: right;">₦${order.totalAmount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px;">Shipping</td>
        <td style="padding: 8px; text-align: right;">₦${0}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Total</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
      </tr>
    </table>



   <!-- Billing and Shipping Information Table -->
    <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
     <tr>
          <th style="text-align: left; padding: 8px; background-color: #d66536;">Shipping Information</th>
        </tr>
      <tr>
        <!-- Shipping Info Column -->
        <td style="width: 100%; vertical-align: top; padding: 10px;">
          ${order.deliveryMethod === "Door Delivery" ? `<p>${order.deliveryAddress.name} <br>
          ${order.deliveryAddress.address} <br>
          ${order.deliveryAddress.city}<br>
          ${order.deliveryAddress.state}<br>
          ${order.deliveryAddress.phone}</p>` : `<P>N/A</P>`}
        </td>
      </tr>
    </table>

<p>Happy Shopping!<br/> Warm Regards.</p>
</div>

<!-- Footer -->
<div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
<p style="color: #d66536;">Theo Kiddies | Sherrif Plaza | <a href="tel:+1234567890" style="color: #d66536;">+123 456 7890</a></p>
<p style="color: #929673;">
  <a href="https://www.facebook.com/yourbrand" style="margin-right: 10px; color: #929673;">Facebook</a> | 
  <a href="https://www.instagram.com/yourbrand" style="margin-left: 10px; color: #929673;">Twitter</a>
</p>
<p><a href="https://yourdomain.com/unsubscribe" style="color: #777777;">Unsubscribe</a></p>
</div>

</div>
`,
        });
        console.log(sendMail);
    } catch (error) {
        console.log(error);
    }
}

// eslint-disable-next-line no-unused-vars
async function getRegisteredTokens() {
    const tokens = [];
    try {
        console.log("Calling model function to get all deviceTokens");
        const tokensSnapshot = await Admin.getRegisteredTokens();
        if (tokensSnapshot.empty) {
            console.log("There are no tokens");
        } else {
            tokensSnapshot.forEach(async (token) => {
                // console.log(order.data());
                const deviceToken = token.data().token;
                tokens.push(deviceToken);
            });
        }
        return tokens;
    } catch (error) {
        console.log(error);
    }
}
