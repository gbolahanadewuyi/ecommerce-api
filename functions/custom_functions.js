/* eslint-disable max-len */
const calculateTotalAmountOfOrders = async function(orders) {
    // console.log(orders);
    try {
        return orders.reduce((accumulator, order) => {
            return accumulator + parseInt(order.totalAmount);
        }, 0);
    } catch (error) {
        console.log(error);
        throw error;
    }
};


const calculateTotalProductsNum = async function(orders) {
    // console.log(orders);
    try {
        return orders.reduce((accumulator, order) => {
            return accumulator + parseInt(order.noOfProducts);
        }, 0);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const convertTimestampToDateTime = async function(timestamp) {
    // converts _seconds field to milliseconds
    const milliseconds = timestamp._seconds * 1000;

    // create new javascript date object
    const date = new Date(milliseconds);

    // format date and time
    const formattedDate = date.toLocaleString();

    return formattedDate;
};

const convertTimestampToDate = async function(timestamp) {
    // // converts _seconds field to milliseconds
    // const milliseconds = timestamp._seconds * 1000;

    // // create new javascript date object
    // const date = new Date(milliseconds);

    // // format date and time
    // const formattedDate = date.toLocaleDateString();

    // return formattedDate;
    // Simulate an async timestamp conversion
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(new Date(timestamp._seconds * 1000).toLocaleDateString()); // Format the date
        }, 100); // Simulate a delay
    });
};


const convertTimestampToLocaleDateString = async function(timestamp) {
    // converts _seconds field to milliseconds
    const milliseconds = timestamp._seconds * 1000;

    // create new javascript date object
    const date = new Date(milliseconds);

    // format date and time
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return formattedDate;
};

const convertTimestampToMonthDate = async function(timestamp) {
    const date = timestamp.toDate();
    const shortDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
    });

    return shortDate;
};


const groupByDate = async function(orders) {
    // first, group the orders by date using reduce
    const groupedOrders = await orders.reduce(async (accPromise, order) => {
        const grouped = await accPromise;
        const date = await convertTimestampToLocaleDateString(order.createdAt);

        if (!grouped[date]) {
            grouped[date] = [];
        }

        grouped[date].push(order);
        // console.log(grouped);
        return grouped;
    }, Promise.resolve({}));

    // console.log(groupedOrders);

    // Convert the grouped orders object into an array
    return Object.keys(groupedOrders).map((date) => ({
        date: date,
        orders: groupedOrders[date],
    }));
};
const calculateAverageDailySales = async function(salesData) {
    // Step 1: Sum the total sales
    const totalSales = salesData.reduce((acc, sale) => acc + sale.totalAmount, 0);

    // Step 2: Get unique days from the sales data
    const uniqueDates = new Set(salesData.map((sale) => sale.date));
    const numberOfDays = uniqueDates.size;

    // Step 3: Calculate the average
    const averageSales = totalSales / numberOfDays;

    // Return the result
    return averageSales || 0;
};
// Function to calculate total earnings from "girls" products
const calculateGirlsEarnings = async function(orders) {
    let total = 0;
    orders.forEach((order) => {
        order.items.forEach((item) => {
            if (item.category && item.category.toLowerCase() === "girls") {
                total += item.price * item.quantity;
            }
        });
    });
    return Math.ceil(total * 100 / 100);
};

// Function to calculate total earnings from "boys" products
const calculateBoysEarnings = async function(orders) {
    let total = 0;
    orders.forEach((order) => {
        // console.log(order);
        order.items.forEach((item) => {
            console.log(item);
            if (item.category && item.category.toLowerCase() === "boys") {
                total += item.price * item.quantity;
            }
        });
    });
    return Math.ceil(total * 100 / 100);
};

// Function to calculate total earnings from "other" products
const calculateOthersEarnings = async function(orders) {
    let total = 0;
    orders.forEach((order) => {
        order.items.forEach((item) => {
            if (item.category && item.category.toLowerCase() !== "girls" && item.category.toLowerCase() !== "boys") {
                total += item.price * item.quantity;
            }
        });
    });
    return Math.ceil(total * 100 / 100);
};

const getPriceRangefunction = async function(variations) {
    // Extract all prices directly from the variations array
    const allPrices = variations.map((variation) => variation.price).filter((price) => price !== undefined && price !== null);

    if (allPrices.length === 0) {
        return null; // Return null if no prices are available
    }

    // Calculate the minimum and maximum prices
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    // If min and max prices are the same, return a single price
    if (minPrice === maxPrice) {
        return minPrice; // Return a single price value
    }

    // Return the price range as an array of two values: min and max prices
    return [minPrice, maxPrice];
};
// export the functions after they are defined
exports.calculateTotalAmountOfOrders = calculateTotalAmountOfOrders;
exports.calculateTotalProductsNum = calculateTotalProductsNum;
exports.convertTimestampToDateTime = convertTimestampToDateTime;
exports.convertTimestampToDate = convertTimestampToDate;
exports.convertTimestampToMonthDate = convertTimestampToMonthDate;
exports.calculateAverageDailySales = calculateAverageDailySales;
exports.groupByDate = groupByDate;
exports.calculateGirlsEarnings = calculateGirlsEarnings;
exports.calculateBoysEarnings = calculateBoysEarnings;
exports.calculateOthersEarnings = calculateOthersEarnings;
exports.getPriceRangefunction= getPriceRangefunction;
