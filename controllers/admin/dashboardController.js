const moment = require("moment");
const admin = require("../../models/adminModel");
const Order = require("../../models/orderModel");
const mongoose = require("mongoose");

// loadDashboard
const loadDashboard = async (req, res) => {
  try {
    const totalRevenue = await gettotalRevenue();
    const dailyRevenue = await getDailyData();
    const monthlyRevenue = await getMonthlyData();
    const yearlyRevenue = await getYearlyData();
    const adminData = await admin.findById({ _id: req.session.admin_id });
    res.render("dashboard", {
      admins: adminData,
      dailyRevenue: dailyRevenue.revenue,
      monthlyRevenue: monthlyRevenue.revenue,
      yearlyRevenue: yearlyRevenue.revenue,
      totalRevenue: totalRevenue,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const gettotalRevenue = async (req, res) => {
  try {
    const total = await Order.find({});

    const dailyRevenue = total.reduce((acc, order) => {
      if (!order.isCancelled) {
        return acc + order.orderAmount;
      } else {
        return acc;
      }
    }, 0);
    return dailyRevenue;
  } catch (error) {
    console.log(error.message);
  }
};

const getDailyData = async (req, res) => {
  try {
    const startOfDay = moment().startOf("day");
    const endOfDay = moment().endOf("day");

    const dailyOrder = await Order.find({
      orderDate: {
        $gte: startOfDay.toDate(),
        $lte: endOfDay.toDate(),
      },
    });

    let count = 0;
    const dailyRevenue = dailyOrder.reduce((acc, order) => {
      if (!order.isCancelled) {
        return acc + order.orderAmount;
      } else {
        count++;
        return acc;
      }
    }, 0);
    return {
      orders: dailyOrder.length,
      revenue: dailyRevenue,
      cancelledOrder: count,
    };
  } catch (error) {
    console.log(error.message);
  }
};

const getMonthlyData = async (req, res) => {
  try {
    const startOfMouth = moment().startOf("month");
    const endOfMouth = moment().endOf("month");

    const monthlyOrder = await Order.find({
      orderDate: {
        $gte: startOfMouth.toDate(),
        $lte: endOfMouth.toDate(),
      },
    });

    let count = 0;
    const monthlyRevenue = monthlyOrder.reduce((acc, order) => {
      if (!order.isCancelled) {
        return acc + order.orderAmount;
      } else {
        count++;
        return acc;
      }
    }, 0);

    return {
      orders: monthlyOrder.length,
      revenue: monthlyRevenue,
      cancelledOrder: count,
    };
  } catch (error) {
    console.log(error.message);
  }
};

const getYearlyData = async (req, res) => {
  try {
    const startOfYear = moment().startOf("year");
    const endOfYear = moment().endOf("year");

    const yearlyOrder = await Order.find({
      orderDate: {
        $gte: startOfYear.toDate(),
        $lte: endOfYear.toDate(),
      },
    });

    let count = 0;
    const yearlyRevenue = yearlyOrder.reduce((acc, order) => {
      if (!order.isCancelled) {
        return acc + order.orderAmount;
      } else {
        count++;
        return acc;
      }
    }, 0);

    return {
      orders: yearlyOrder.length,
      revenue: yearlyRevenue,
      cancelledOrder: count,
    };
  } catch (error) {
    console.log(error.message);
  }
};

// verifyDashboard
const verifyDashboard = async (req, res) => {
  try {
    const { type } = req.query;
    if (type === "daily") {
      const dailyData = await getDailyData();
      const { orders, revenue, cancelledOrder } = dailyData;
      res.send({
        orders,
        revenue,
        cancelledOrder,
        type,
      });
    } else if (type === "monthly") {
      const monthlyData = await getMonthlyData();
      const { orders, revenue, cancelledOrder } = monthlyData;
      res.send({
        orders,
        revenue,
        cancelledOrder,
        type,
      });
    } else if (type === "yearly") {
      const yearlyData = await getYearlyData();
      const { orders, revenue, cancelledOrder } = yearlyData;
      res.send({
        orders,
        revenue,
        cancelledOrder,
        type,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// custom sales report
const loadCustomSalesReport = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    res.render("CustomSaleReport", {
      admins: adminData,
      info: req.session.info,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verify custom report
const verifyCustomSalesReport = async (req, res) => {
  try {
    const { from, to } = req.body;
    
    const customReport = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(from),
            $lte: new Date(to),
          },
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$isCancelled", false] }, "$orderAmount", 0]
            }
          },
          cancelledOrdersCount: {
            $sum: {
              $cond: [{ $eq: ["$isCancelled", true] }, 1, 0]
            }
          },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project:{
          _id:0
        }
      },
    ]);
    
    req.session.info = customReport;
    res.redirect("/admin//custom-sale-report");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadDashboard,
  verifyDashboard,
  loadCustomSalesReport,
  verifyCustomSalesReport,
};
