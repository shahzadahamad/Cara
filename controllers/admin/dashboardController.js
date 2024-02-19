const moment = require("moment");
const admin = require("../../models/adminModel");
const Order = require("../../models/orderModel");
const User = require("../../models/userModel");
const Product = require("../../models/productsModel");
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
      if (!order.isCancelled && !order.isReturned) {
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
    const startOfDay = moment().startOf("day").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString();
    const endOfDay = moment().endOf("day").set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toISOString();

    const dailyOrder = await Order.find({
      orderDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    let count = 0;
    const dailyRevenue = dailyOrder.reduce((acc, order) => {
      if (!order.isCancelled && !order.isReturned) {
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
      date: moment().format("YYYY-MM-DD"),
    };
  } catch (error) {
    console.log(error.message);
  }
};

const getWeeklyData = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("week").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString();
    const endOfWeek = moment().endOf("week").set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toISOString();

    const weeklyOrder = await Order.find({
      orderDate: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });

    let count = 0;
    const weeklyRevenue = weeklyOrder.reduce((acc, order) => {
      if (!order.isCancelled && !order.isReturned) {
        return acc + order.orderAmount;
      } else {
        count++;
        return acc;
      }
    }, 0);

    return {
      orders: weeklyOrder.length,
      revenue: weeklyRevenue,
      cancelledOrder: count,
      startOfWeek:startOfWeek,
      endOfWeek:endOfWeek,
    };
  } catch (error) {
    console.log(error.message);
  }
};

const getMonthlyData = async (req, res) => {
  try {
    const startOfMouth = moment().startOf("month").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString();
    const endOfMouth = moment().endOf("month").set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toISOString();

    const monthlyOrder = await Order.find({
      orderDate: {
        $gte: startOfMouth,
        $lte: endOfMouth,
      },
    });

    let count = 0;
    const monthlyRevenue = monthlyOrder.reduce((acc, order) => {
      if (!order.isCancelled && !order.isReturned) {
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
      startOfMouth:startOfMouth,
      endOfMouth:endOfMouth,
    };
  } catch (error) {
    console.log(error.message);
  }
};

const getYearlyData = async (req, res) => {
  try {
    const startOfYear = moment().startOf("year").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString();
    const endOfYear = moment().endOf("year").set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toISOString();

    const yearlyOrder = await Order.find({
      orderDate: {
        $gte: startOfYear,
        $lte: endOfYear,
      },
    });

    let count = 0;
    const yearlyRevenue = yearlyOrder.reduce((acc, order) => {
      if (!order.isCancelled && !order.isReturned) {
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
      startOfYear:startOfYear,
      endOfYear:endOfYear,
    };
  } catch (error) {
    console.log(error.message);
  }
};

const customReport = async (fromDate, toDate) => {
  const customReport = await Order.aggregate([
    {
      $match: {
        orderDate: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
        totalRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isReturned", false] },
                  { $eq: ["$isCancelled", false] },
                ],
              },
              "$orderAmount",
              0,
            ],
          },
        },
        cancelledOrdersCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$isCancelled", true] },
                  { $eq: ["$isReturned", true] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalRevenue: 1,
        cancelledOrdersCount: 1,
        totalOrders: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);
  return customReport;
}

// verifyDashboard
const verifyDashboard = async (req, res) => {
  try {
    const { type } = req.query;
    if (type === "daily") {
      const dailyData = await getDailyData();
      const { orders, revenue, cancelledOrder, date } = dailyData;
      res.send({
        orders,
        revenue,
        cancelledOrder,
        type,
        date,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// getiing the monthly yearly weekly daily
const custsomMonthYearWeekDaily = async (data) => {
  try{

    if(data==='Monthly'){
      const {startOfMouth,endOfMouth} = await getMonthlyData();
      const result = await customReport(startOfMouth,endOfMouth);
      return result;
    }else if(data==='Weekly'){
      const {startOfWeek,endOfWeek} = await getWeeklyData();
      const result = await customReport(startOfWeek,endOfWeek);
      return result;
    }else if(data==='Yearly'){
      const {startOfYear,endOfYear} = await getYearlyData();
      const result = await customReport(startOfYear,endOfYear);
      return result;
    }else if(data==='Daily'){

      const result = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
            totalRevenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$isReturned", false] },
                      { $eq: ["$isCancelled", false] },
                    ],
                  },
                  "$orderAmount",
                  0,
                ],
              },
            },
            cancelledOrdersCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$isCancelled", true] },
                      { $eq: ["$isReturned", true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalRevenue: 1,
            cancelledOrdersCount: 1,
            totalOrders: 1,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);
      return result;
    }

  }catch(error){
    console.log(error.message);
  }
}

// custom sales report
const loadCustomSalesReport = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const { From, To, customReport,data } = req.query;

    if (customReport && From && To) {
      const parsedCustomReport = JSON.parse(decodeURIComponent(customReport));
      return res.render("CustomSaleReport", {
        admins: adminData,
        info: { From, To, customReport: parsedCustomReport },
        status:false,
      });
    }

    if(data){
     const result = await custsomMonthYearWeekDaily(data);
      return res.render('CustomSaleReport',{
        admins:adminData,
        info: {customReport:result},
        status:true,
      })
    }

    res.render("CustomSaleReport", {
      admins: adminData,
      status:false
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verify custom report
const verifyCustomSalesReport = async (req, res) => {
  try {
    const { from, to } = req.body;

    const fromDate = new Date(from).setHours(0,0,0,0)
    const toDate = new Date(to).setHours(23,59,59,999)
 

    if (from && to) {

      const result = await customReport(fromDate,toDate);

      res.redirect(
        `/admin/custom-sale-report?From=${from}&To=${to}&customReport=${encodeURIComponent(
          JSON.stringify(result)
        )}`
      );
    } else {
      res.redirect("/admin/custom-sale-report");
    }
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
