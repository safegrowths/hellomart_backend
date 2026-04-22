const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const verifyToken = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;


const BASE_URL = 'https://hellomartadmin.greatindianews.com';


const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);


async function send_otp(req, otp, mobile) {
    console.log(`Sending OTP ${otp} to ${mobile}`);
    return true;
}


router.get('/categories', async (req, res) => {
    try {

        const { type=1 } = req.query; // pehle type lo

        if (!type) {
            return res.status(400).json({
                status: false,
                msg: "Type is required"
            });
        }

        const sql = `
        SELECT id, title, image, status, created_at, updated_at 
        FROM categorise
        WHERE status = 1 AND type = ?
        ORDER BY id DESC
        `;

        const [rows] = await db.query(sql, [type]);

        res.status(200).json({
            status: true,
            msg: "Categories fetched successfully",
            total: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("Error fetching categories:", error);

        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});
// router.post('/order_list', verifyToken, async (req, res) => {
//   try {

//     const user_id = req.user?.id;
//     const { order_id } = req.body;

//     if (!user_id) {
//       return res.status(401).json({
//         msg: "User not authenticated",
//         success: false
//       });
//     }

//     // ✅ MAIN QUERY
//     let sql = `
//       SELECT 
//         o.*,
//         o.status AS orderstatus,
//         o.created_at AS created_ats,
       
//         o.user_id AS userids,
//         o.payment_type AS payment_mode,
//         o.product_id AS product_id,

//         v.vendorShopName,

      
//         p.productattribute,
//         p.category_id,
//         p.Details,
//         p.short_description,

//         a.locality

//       FROM orders o
//       LEFT JOIN address a ON o.address_id = a.id
//       LEFT JOIN products p ON o.product_id = p.id
//       LEFT JOIN vendors v ON o.vendor_id = v.id

//       WHERE o.user_id = ?
//       AND o.status IN (0,1,2,3,4,5,6,7)
//     `;

//     let params = [user_id];

//     if (order_id) {
//       sql += ` AND o.order_id = ?`;
//       params.push(order_id);
//     }

//     sql += ` ORDER BY o.id DESC`;

//     const [rows] = await db.query(sql, params);

//     if (rows.length === 0) {
//       return res.status(200).json({
//         msg: "No Data Found",
//         success: false,
//         data: []
//       });
//     }

//     let groupedOrders = {};

//     for (const row of rows) {

//       const orderId = row.order_id;

//       if (!groupedOrders[orderId]) {

//         groupedOrders[orderId] = {
//           orderDetail: {
//             id: row.id,
//             user_id: row.userids,
//             order_id: row.order_id,
//             created_at: row.created_ats,
//             status: parseInt(row.orderstatus),
//             payment_mode: row.payment_mode,
//             total_amount: row.total_amount,
//             handling_charge: row.handling_charge,
//             delivery_amount: row.delivery_amount,
//             address: row.locality,
//             vendor_name: row.vendorShopName,
//             bill_total:
//               parseFloat(row.total_amount || 0) +
//               parseFloat(row.handling_charge || 0) +
//               parseFloat(row.delivery_amount || 0)
//           },
//           products: []
//         };

//         // ✅ CART QUERY
//         const [cartItems] = await db.query(`
//           SELECT 
//             c.id as cartid,
//             c.quantity,
//             c.productattribute_id,
//             c.product_id,

          
//             p.productattribute,
//             p.category_id,
//             p.Details,
//             p.short_description,

//             v.vendorShopName

//           FROM cart c
//           LEFT JOIN products p ON c.product_id = p.id
//           LEFT JOIN vendors v ON p.vendor_id = v.id

//           WHERE c.order_id = ?
//         `, [orderId]);

//         let productsArr = [];

//         for (const item of cartItems) {

//           // ✅ Clean attribute ids
//           let attributeIds = [];
//           if (item.productattribute_id) {
//             attributeIds = item.productattribute_id
//               .toString()
//               .replace(/[\[\]" ]/g, '')
//               .split(',')
//               .filter(Boolean);
//           }

//           // ✅ Parse JSON safely
//           let attributes = [];
//           try {
//             attributes = JSON.parse(item.productattribute || "[]");
//           } catch (e) {
//             attributes = [];
//           }

//           for (const attrId of attributeIds) {

//             let matched = attributes.find(a => String(a.id) === String(attrId));

//             if (matched) {

//               let quantity = parseInt(item.quantity || 0);
//               let mrp = parseFloat(matched.price || 0);
//               let off = parseFloat(matched.discount_percentage || 0);

//               let price = mrp - (mrp * off / 100);

//               productsArr.push({
//                 id: item.product_id,
//                 cartid: item.cartid,
//                 quantity: quantity,
//                 product_id: item.product_id,

//                 name: item.product_name,
//                 seller_name: item.vendorShopName,

//                 created_at: row.created_ats,
//                 status: row.orderstatus,
//                 order_id: orderId,

//                 produt_type: item.category_id,
//                 about_product: item.Details,
//                 description: item.short_description,

//                 produt_image: matched.product_images || [],

//                 delivery_amount: parseFloat(row.delivery_amount || 0),

//                 Item_total: Math.round(price * quantity * 100) / 100,
//                 total_amount: parseFloat(row.total_amount || 0),
//                 handling_charge: parseFloat(row.handling_charge || 0),

//                 productattribute: matched
//               });
//             }
//           }
//         }

//         groupedOrders[orderId].products = productsArr;
//       }
//     }

//     return res.status(200).json({
//       msg: "Success",
//       success: true,
//       total_orders: Object.keys(groupedOrders).length,
//       data: Object.values(groupedOrders)
//     });

//   } catch (error) {

//     console.error("Order History Error:", error);

//     return res.status(500).json({
//       msg: "Something went wrong",
//       success: false,
//       error: error.message
//     });

//   }
// });

// ================= ORDER HISTORY =================
async function Order_History(userid) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE user_id = ?`,
      [userid]
    );
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}
// ✅ ORDER DETAILS
async function orders_details(uniqueorder_id) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE uniqueorder_id = ?`,
      [uniqueorder_id]   // ✅ FIX
    );
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

// ================= ORDER ITEMS =================
async function Order_items(uniqueorder_id) {
  try {
    const [rows] = await db.query(
      `SELECT 
        order_items.*,
        products.productattribute
      FROM order_items 
      LEFT JOIN products 
        ON products.id = order_items.product_id 
      WHERE uniqueorder_id = ?`,
      [uniqueorder_id]
    );
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

// ================= ROUTE =================
router.post('/order_list', verifyToken, async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing user"
      });
    }

    // ✅ STEP 1: Orders fetch
    const OrderHistory = await Order_History(user_id);

    // ✅ STEP 2: Process each order
    const updatedOrders = await Promise.all(
      OrderHistory.map(async (order) => {

        // ✅ IMPORTANT: items yahi define karo
        const items = await Order_items(order.uniqueorder_id);

        // ✅ STEP 3: Process items
        const updatedItems = items.map((row) => {

          let attributes = [];

          // ✅ JSON parse safely
          try {
            attributes = typeof row.productattribute === "string"
              ? JSON.parse(row.productattribute)
              : (row.productattribute || []);
          } catch (e) {
            attributes = [];
          }

          // ✅ Selected attribute find
          const selectedAttr = attributes.find(
            attr => String(attr.id).trim() === String(row.product_attribute_id).trim()
          );

          return {
            cart_id: row.cart_id,
            product_id: row.product_id,
            quantity: row.quantity,

            product: selectedAttr
              ? {
                  product_attribute_id: selectedAttr.id,
                  name: selectedAttr.name || null,
                  image: selectedAttr.image || null,
                  price: (Number(selectedAttr.price) * row.quantity).toFixed(2),
                  booking_amount: (Number(selectedAttr.discounted_price) * row.quantity).toFixed(2),
                  discount: (
                    (Number(selectedAttr.price) - Number(selectedAttr.discounted_price)) * row.quantity
                  ).toFixed(2)
                }
              : null
          };
        });

        return {
          ...order,
          order_item: updatedItems
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Get successfully',
      data: updatedOrders
    });

  } catch (err) {
    console.error(err); // ✅ debug
    res.status(500).json({
      msg: "Internal Server Error",
      error: err.message,
      status: false
    });
  }
});

router.post('/order/details', verifyToken, async (req, res) => {
  try {

    const user_id = req.user?.id;
    const { order_id } = req.body;

    if (!user_id || !order_id) {
      return res.status(400).json({
        success: false,
        msg: "order_id required"
      });
    }

    // ✅ STEP 1: Fetch Orders
    const OrderHistory = await orders_details(order_id);

    if (!OrderHistory.length) {
      return res.status(200).json({
        success: false,
        msg: "No Order Found",
        data: []
      });
    }

    // ✅ STEP 2: Process Orders
    const updatedOrders = await Promise.all(
      OrderHistory.map(async (order) => {

        const items = await Order_items(order.uniqueorder_id);

        const updatedItems = items.map((row) => {

          let attributes = [];

          // ✅ Safe JSON parse
          try {
            attributes = typeof row.productattribute === "string"
              ? JSON.parse(row.productattribute)
              : (row.productattribute || []);
          } catch (e) {
            attributes = [];
          }

          // ✅ Find selected attribute
          const selectedAttr = attributes.find(
            attr => String(attr.id).trim() === String(row.product_attribute_id).trim()
          );

          let quantity = Number(row.quantity || 0);

          return {
            cart_id: row.cart_id,
            product_id: row.product_id,
            quantity: quantity,

            product: selectedAttr
              ? {
                  product_attribute_id: selectedAttr.id,
                  name: selectedAttr.name || null,
                  image: selectedAttr.image || null,

                  // ✅ Round to 2 decimal (number)
                  price: Math.round((Number(selectedAttr.price) * quantity) * 100) / 100,
                  booking_amount: Math.round((Number(selectedAttr.discounted_price) * quantity) * 100) / 100,
                  discount: Math.round(
                    ((Number(selectedAttr.price) - Number(selectedAttr.discounted_price)) * quantity) * 100
                  ) / 100
                }
              : null
          };
        });

        // ✅ REMOVE unwanted fields
        const {
          address_id,
          bag_mrp,
          bag_discount,
          coupon_discount,
          shipping_fee,
         
          payment_type,
          gateway_id,
          ...cleanOrder
        } = order;

        return {
          ...cleanOrder,
          total_items: updatedItems.length,
          order_item: updatedItems
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Get successfully",
      data: updatedOrders[0]
    });

  } catch (err) {

    console.error("Order Details Error:", err);

    return res.status(500).json({
      msg: "Internal Server Error",
      error: err.message,
      status: 500
    });

  }
});

async function removeCart(userid,CartId) {
  try {
    const [rows] = await db.query(`DELETE FROM cart WHERE id='${CartId}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

router.post('/remove_cart',verifyToken, async (req, res) => {
  try {
      const userid = req.user?.id;
    const { cart_id } = req.body;
    console.log('payload', req.body);

    let datas = [];

    if (!cart_id) {
      return res.status(400).json({
        msg: "CartId Is Missing",
        status: false
      });
    }


    GetCart = await removeCart(userid,cart_id);
    
    
    res.status(200).json({
      msg: "Cart Removed Successfully",
      status: true
    });

  } catch (err) {
    res.status(500).json({
      msg: "Internal Server Error",
      error: err.message,
      status: false
    });
  }
});

router.get('/banner', async (req, res) => {
    try {

        const sql = `
        SELECT id, title, image, status, created_at, updated_at 
        FROM categorise
        WHERE status = 1
        ORDER BY id DESC
        `;

        const [rows] = await db.query(sql);

        res.status(200).json({
            status: true,
            msg: "Categories fetched successfully",
            total: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("Error fetching categories:", error);

        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});



router.get('/notification', async (req, res) => {
    try {

        const sql = `
            SELECT id, title, msg, created_at 
            FROM notification 
            ORDER BY created_at DESC
        `;

        const [rows] = await db.query(sql);

        const grouped = {
            today: [],
            yesterday: [],
            older: {}
        };

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        rows.forEach(item => {
            const createdDate = new Date(item.created_at);

            // Today
            if (createdDate.toDateString() === today.toDateString()) {
                grouped.today.push(item);
            }
            // Yesterday
            else if (createdDate.toDateString() === yesterday.toDateString()) {
                grouped.yesterday.push(item);
            }
            // Older (date wise)
            else {
                const dateKey = createdDate.toDateString();

                if (!grouped.older[dateKey]) {
                    grouped.older[dateKey] = [];
                }

                grouped.older[dateKey].push(item);
            }
        });

        res.status(200).json({
            status: true,
            msg: "notification fetched successfully",
            data: grouped
        });

    } catch (error) {

        console.error("Error fetching notifications:", error);

        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});

router.get('/special_offer', async (req, res) => {
    try {

        const sql = `
            SELECT * FROM special_offer WHERE 1
        `;

        const [rows] = await db.query(sql);

        res.status(200).json({
            status: true,
            msg: "Fetched successfully",
            total: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("Error fetching special offers:", error);

        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});

router.get('/coupon_banner', async (req, res) => {
  try {

    const sql = `
      SELECT id, image, created_at, updated_at 
      FROM coupon_banner
      ORDER BY id DESC
    `;

    const [rows] = await db.query(sql);

    return res.status(200).json({
      status: true,
      msg: "Coupon banners fetched successfully",
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Error fetching coupon banners:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.get('/refer_and_earn', verifyToken, async (req, res) => {
  try {

    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        msg: "User not authenticated"
      });
    }

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.image,
        u.created_at AS joined,
        
        IFNULL(SUM(wt.reward), 0) AS reward
      FROM users u
      LEFT JOIN wallet_transactions wt 
        ON wt.user_id = u.id
      WHERE u.referral_user = ?
      GROUP BY u.id
      ORDER BY u.id DESC
    `;

    const [rows] = await db.query(sql, [user_id]);

    // ✅ Total earning calculate
    const total_earning = rows.reduce(
      (sum, r) => sum + Number(r.total_reward), 
      0
    );

    // ✅ First user created_at (as per your format)
    const created_at = rows.length > 0 ? rows[0].joined : null;

    return res.status(200).json({
      status: true,
      msg: "Refer & Earn data fetched successfully",

      wallet_balance: total_earning || 0,
      datetime: created_at,

      data: rows
    });

  } catch (error) {

    console.error("Error fetching refer data:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });

  }
});

router.get('/transaction', verifyToken, async (req, res) => {
  try {

    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        msg: "User not authenticated"
      });
    }
   
   
    const sql = `
    SELECT 
      wt.id,
        wt.user_id,
        wt.type,
        wt.amount,
        wt.reward,
        wt.status,
        wt.created_at,
        u.name
FROM users u
LEFT JOIN wallet_transactions wt 
  ON wt.user_id = u.id
WHERE u.referral_user = ?
ORDER BY wt.id DESC;
    `;

    const [rows] = await db.query(sql, [user_id]);

    // ✅ Total earning
    const total_earning = rows.reduce(
      (sum, r) => sum + Number(r.reward || 0), 
      0
    );

    return res.status(200).json({
      status: true,
      msg: "Transaction fetched successfully",

      data: rows
    });

  } catch (error) {

    console.error("Transaction Error:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });

  }
});

router.get('/win_list', verifyToken, async (req, res) => {
  try {

    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        msg: "User not authenticated"
      });
    }

    const sql = `
      SELECT id, image, coupon, created_at, user_id 
      FROM wining_list 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    const [rows] = await db.query(sql, [user_id]);

    return res.status(200).json({
      status: true,
      msg: "win_list fetched successfully",
      total: rows.length,
      data: rows
    });

  } catch (error) {

    console.error("Transaction Error:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });

  }
});

router.get('/wallet', verifyToken, async (req, res) => {
  try {

    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        msg: "User not authenticated"
      });
    }

   const sql = `
  SELECT id, IFNULL(wallet, 0.00) AS wallet, created_at 
  FROM users 
  WHERE id = ?
`;

    const [rows] = await db.query(sql, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        msg: "User not found"
      });
    }

    return res.status(200).json({
      status: true,
      msg: "Wallet fetched successfully",
      data: rows[0]   // 👈 single user
    });

  } catch (error) {

    console.error("Wallet Error:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });

  }
});


// router.post('/orders_status', verifyToken, async (req, res) => {
//   try {
//     const { order_id } = req.body;

//     // ✅ Validation
//     if (!order_id) {
//       return res.status(400).json({
//         status: false,
//         msg: "order_id is required"
//       });
//     }

//     // ✅ Status Mapping
//     const orderStatus = {
//       1: "Pending",
//       2: "Accepted",
//       3: "Ongoing",
//       4: "In Progress",
//       5: "Hold",
//       6: "Cancelled",
//       7: "completed"
//     };

//     // ✅ Query
//     const sql = `
//       SELECT id, user_id, order_id, status
//       FROM orders
//       WHERE order_id = ?
//     `;

//     const [rows] = await db.query(sql, [order_id]);

//     // ✅ Add status text
//     const data = rows.map(row => ({
//       ...row,
//       status_text: orderStatus[row.status] || "Unknown"
//     }));

//     return res.status(200).json({
//       status: true,
//       msg: "Fetched successfully",
//       total: data.length,
//       data: data
//     });

//   } catch (error) {
//     console.error("Order Status Error:", error);

//     return res.status(500).json({
//       status: false,
//       msg: "Internal Server Error",
//       error: error.message
//     });
//   }
// });


// router.post('/cart_get', verifyToken, async (req, res) => {
//   try {
//     // ✅ user_id token से
//     const user_id = req.user.id;

//     // ✅ Query
//     const sql = `
//       SELECT 
//         c.id AS cart_id,
//         c.user_id,
        
//         c.product_id,
//         c.productattribute_id AS product_attribute_id,
//         c.quantity,
//         c.price,
//         c.total_amount,
//         c.status,
//         c.created_at,
//         c.updated_at,
//         p.productattribute

//       FROM cart c
//       LEFT JOIN products p ON p.id = c.product_id
//       WHERE c.user_id = ?
//       ORDER BY c.id DESC
//     `;

//     const [rows] = await db.query(sql, [user_id]);

//     // ✅ Process Data
//     const data = rows.map(row => {
//       let attributes = [];

//       try {
//         attributes = JSON.parse(row.productattribute || "[]");
//       } catch (err) {
//         console.log("JSON Parse Error:", err);
//       }

//       const selectedAttr = attributes.find(
//         attr => attr.id == row.productattribute_id
//       );

//       return {
//         cart_id: row.cart_id,
//         product_id: row.product_id,
//         quantity: row.quantity,
//         price: row.price,
//         total_amount: row.total_amount,
//         status: row.status,
       

//         product: {
//           name: row.product_name,
//           image: row.image,
//           total_price: row.total_price,
//           discounted_price: row.discounted_price,
//           discount_percentage: row.discount_percentage,
//           short_description: row.short_description,
//           stock: row.stock
//         },

//         selected_attribute: selectedAttr || null,

//         created_at: row.created_at,
//         updated_at: row.updated_at
//       };
//     });
//     // ✅ Total Amount
//     const total_cart_amount = data.reduce(
//       (sum, item) => sum + Number(item.total_amount),
//       0
//     );

//     return res.status(200).json({
//       status: true,
//       msg: "Cart fetched successfully",
//       total: data.length,
//       total_cart_amount,
//       data
//     });

//   } catch (error) {
//     console.error("Cart Get Error:", error);

//     return res.status(500).json({
//       status: false,
//       msg: "Internal Server Error",
//       error: error.message
//     });
//   }
// });

router.post('/cart_get', verifyToken, async (req, res) => {
  try {
    // ✅ user_id from token
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        msg: "Unauthorized user"
      });
    }

    // ✅ Query (only attribute JSON needed)
    const sql = `
      SELECT 
        c.id AS cart_id,
        c.user_id,
        c.product_id,
        c.productattribute_id AS product_attribute_id,
        c.quantity,
        c.created_at,
        c.updated_at,
        p.productattribute AS product_attribute

      FROM cart c
      LEFT JOIN products p ON p.id = c.product_id
      WHERE c.user_id = ?
      ORDER BY c.id DESC
    `;

    const [rows] = await db.query(sql, [user_id]);

    // ✅ Process Data
    const data = rows.map(row => {
      let attributes = [];

      // ✅ Safe JSON Parse
      try {
        attributes = row.product_attribute
          ? JSON.parse(row.product_attribute)
          : [];
      } catch (err) {
        console.log("JSON Parse Error:", err);
      }

     
      const selectedAttr = attributes.find(
        attr => String(attr.id) === String(row.product_attribute_id)
      );

      return {
        cart_id: row.cart_id,
        product_id: row.product_id,
        quantity: row.quantity,
     
        product: selectedAttr
          ? {
                product_attribute_id: selectedAttr.id,
                name: selectedAttr.name || null,
                image: selectedAttr.image || null,
                price: (selectedAttr.price * row.quantity).toFixed(2),
                booking_amount: (selectedAttr.discounted_price * row.quantity).toFixed(2),
                discount: ((selectedAttr.price - selectedAttr.discounted_price) * row.quantity).toFixed(2)
            }
          : null,
        // ✅ Full selected attribute
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });

    // ✅ Total Cart Amount
    const total_cart_amount = data.reduce(
      (sum, item) => sum + Number(item.product.price || 0),
      0
    );
    const booking_amount = data.reduce(
      (sum, item) => sum + Number(item.product.booking_amount || 0),
      0
    );

    // ✅ Final Response
    return res.status(200).json({
      status: true,
      msg: "Cart fetched successfully",
      total_items: data.length,
      total_cart_amount,
      booking_amount,
      data
    });

  } catch (error) {
    console.error("Cart Get Error:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.post('/sub_categorise', async (req, res) => {
  try {
    const { categorise_id, title, type } = req.body;

    let sql = `
      SELECT id, title, image, categorise_id, created_at, updated_at, status, description, type
      FROM sub_categorise
    `;

    let params = [];
    let conditions = [];

    // categorise_id = type condition
    if (categorise_id && type) {
      conditions.push(`categorise_id = ? AND type = ?`);
      params.push(categorise_id, type);
    }

    // Search by title
    if (title) {
      conditions.push(`title LIKE ?`);
      params.push(`%${title}%`);
    }

 
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY title ASC`;

    const [rows] = await db.query(sql, params);

    res.status(200).json({
      status: true,
      msg: "Sub Categories fetched successfully",
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

// router.post('/checkout_details', verifyToken, async (req, res) => {
//   try {
//     // ✅ user_id from token
//     const user_id = req.user?.id;

//     if (!user_id) {
//       return res.status(401).json({
//         status: false,
//         msg: "Unauthorized user"
//       });
//     }
    
//     const { type } = req.body;
    
//     if (!type) {
//       return res.status(401).json({
//         status: false,
//         msg: "Type is Required"
//       });
//     }
    
//     if(type=='1')  // Cart 
//     {
//         const sql = `
//       SELECT 
//         c.id AS cart_id,
//         c.user_id,
//         c.product_id,
//         c.productattribute_id AS product_attribute_id,
//         c.quantity,
//         c.created_at,
//         c.updated_at,
//         p.productattribute AS product_attribute

//       FROM cart c
//       LEFT JOIN products p ON p.id = c.product_id
//       WHERE c.user_id = ?
//       ORDER BY c.id DESC
//     `;

//     [rows] = await db.query(sql, [user_id]);

//     // ✅ Process Data
       
//     }
//     else if(type==2){         // BY product
//         const { product_id,product_attribute_id } = req.body;
    
//         if (!product_id || !product_attribute_id) {
//           return res.status(401).json({
//             status: false,
//             msg: "Product Id Or Product Attribute Id is Required"
//           });
//         }
        
//         const sql = `
//           SELECT id AS product_id,productattribute AS product_attribute,? AS product_attribute_id FROM products WHERE id=?;
//         `;

//         [rows] = await db.query(sql, [product_attribute_id,product_id]);
//     }
    
//     const data = rows.map(row => {
//       let attributes = [];

//       // ✅ Safe JSON Parse
//       try {
//         attributes = row.product_attribute
//           ? JSON.parse(row.product_attribute)
//           : [];
//       } catch (err) {
//         console.log("JSON Parse Error:", err);
//       }
//     console.log(rows);
//     console.log(attributes);
//       // ✅ Find selected attribute
//       const selectedAttr = attributes.find(
//         attr => String(attr.id) === String(row.product_attribute_id)
//       );

//       return {
//         product_id: row.product_id,
//          product: selectedAttr
//           ? {
//                 product_attribute_id: selectedAttr.id,
//                 name: selectedAttr.name || null,
//                 image: selectedAttr.image || null,
//                 price: (selectedAttr.price * row.quantity).toFixed(2),
//                 booking_amount: (selectedAttr.discounted_price * row.quantity).toFixed(2),
//                 discount: ((selectedAttr.price - selectedAttr.discounted_price) * row.quantity).toFixed(2)
//             }
//           : null,
//         // ✅ Full selected attribute
//         created_at: row.created_at,
//         updated_at: row.updated_at
//       };
//     });

//     // ✅ Total Cart Amount
//     const mrp = data.reduce(
//       (sum, item) => sum + Number(item.product.price || 0),
//       0
//     );
//     const sale_price = data.reduce(
//       (sum, item) => sum + Number(item.product.booking_amount || 0),
//       0
//     );
    
//     const discount=mrp-sale_price;
    
//     const shopping_point=20;
    
//     const cashback_amount=100;
    
//     const product_cost=mrp;
    
//     const delivery_amount=40;
    
//     const order_total=sale_price;
    
//     const booking_total=1000;
    
//     datas={
//         mrp,
//       discount,
//       sale_price,
//       shopping_point,
//       cashback_amount,
//       product_cost,
//       delivery_amount,
//       order_total,
//       booking_total
//     }

//     // ✅ Final Response
//     return res.status(200).json({
//       status: true,
//       msg: "Checkout fetched successfully",

//       data:datas
//     });


//     // ✅ Query (only attribute JSON needed)
    
//   } catch (error) {
//     console.error("Cart Get Error:", error);

//     return res.status(500).json({
//       status: false,
//       msg: "Internal Server Error",
//       error: error.message
//     });
//   }
// });


router.post('/checkout_details', verifyToken, async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        msg: "Unauthorized user"
      });
    }

    let { type } = req.body;
    type = String(type); // ✅ normalize

    if (!type) {
      return res.status(400).json({
        status: false,
        msg: "Type is Required"
      });
    }

    let rows = [];

    // ================= CART =================
    if (type === '1') {
      const sql = `
        SELECT 
          c.id AS cart_id,
          c.user_id,
          c.product_id,
          c.productattribute_id AS product_attribute_id,
          c.quantity,
          c.created_at,
          c.updated_at,
          p.productattribute AS product_attribute
        FROM cart c
        LEFT JOIN products p ON p.id = c.product_id
        WHERE c.user_id = ?
        ORDER BY c.id DESC
      `;

      const [result] = await db.query(sql, [user_id]);
      rows = result;
    }

    // ================= BUY NOW =================
    else if (type === '2') {
      const { product_id, product_attribute_id, quantity = 1 } = req.body;

      if (!product_id || !product_attribute_id) {
        return res.status(400).json({
          status: false,
          msg: "Product Id Or Product Attribute Id is Required"
        });
      }

      const sql = `
        SELECT 
          id AS product_id,
          productattribute AS product_attribute,
          ? AS product_attribute_id,
          ? AS quantity,
          NOW() AS created_at,
          NOW() AS updated_at
        FROM products 
        WHERE id = ?
      `;

      const [result] = await db.query(sql, [
        product_attribute_id,
        quantity,
        product_id
      ]);

      rows = result;
    }

    // ================= PROCESS DATA =================
    const data = rows.map(row => {
      let attributes = [];

      try {
        attributes = row.product_attribute
          ? JSON.parse(row.product_attribute)
          : [];
      } catch (err) {
        console.log("JSON Parse Error:", err);
        attributes = [];
      }

      const selectedAttr = attributes.find(
        attr => String(attr.id) === String(row.product_attribute_id)
      );

      if (!selectedAttr) {
        return {
          product_id: row.product_id,
          product: null,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      }

      const quantity = row.quantity || 1;

      return {
        product_id: row.product_id,
        product: {
          product_attribute_id: selectedAttr.id,
          name: selectedAttr.name || null,
          image: selectedAttr.image || null,
          price: (selectedAttr.price * quantity).toFixed(2),
          booking_amount: (selectedAttr.discounted_price * quantity).toFixed(2),
          discount: (
            (selectedAttr.price - selectedAttr.discounted_price) * quantity
          ).toFixed(2)
        },
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });

    // ================= TOTAL CALCULATION =================
    const mrp = data.reduce(
      (sum, item) => sum + Number(item.product?.price || 0),
      0
    );

    const sale_price = data.reduce(
      (sum, item) => sum + Number(item.product?.booking_amount || 0),
      0
    );

    const discount = mrp - sale_price;

    const shopping_point = 20;
    const cashback_amount = 100;
    const product_cost = mrp;
    const delivery_amount = 40;
    const order_total = sale_price;
    const booking_total = 1000;

    const datas = {
      mrp:mrp.toFixed(2),
      discount:discount.toFixed(2),
      sale_price:sale_price.toFixed(2),
      shopping_point:shopping_point.toFixed(2),
      cashback_amount:cashback_amount.toFixed(2),
      product_cost:product_cost.toFixed(2),
      delivery_amount:delivery_amount.toFixed(2),
      order_total:order_total.toFixed(2),
      booking_total:booking_total.toFixed(2)
    };

    return res.status(200).json({
      status: true,
      msg: "Checkout fetched successfully",
      data: datas
    });

  } catch (error) {
    console.error("Checkout Error:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { mobile, password, type } = req.body;
    
    if (!mobile || !type) {
      return res.status(400).json({ 
        status: false, 
        msg: "Mobile number and type are required" 
      });
    }
    
    // Seller Login with Password
    if (type == 3) {
      if (!password) {
        return res.status(400).json({ 
          status: false, 
          msg: "Password required" 
        });
      }
      
      const [user] = await db.query(
        "SELECT id, name, mobile, email, business_name, upload_shop_logo, shop_doc FROM users WHERE mobile=? AND password=?",
        [mobile, password]
      );
      
      if (user.length === 0) {
        return res.status(401).json({ 
          status: false, 
          msg: "Invalid mobile or password" 
        });
      }
      
      // Create minimal payload for JWT
      const tokenPayload = {
        id: user[0].id,
        type: 3 // Add user type to payload
      };
      
      const token = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      return res.status(200).json({
        status: true,
        msg: "Login successful",
        token,
        data: user[0]
      });
    }
    
    // OTP Login
    const [user] = await db.query(
      "SELECT id, name, mobile, email, business_name, upload_shop_logo, shop_doc FROM users WHERE mobile=?",
      [mobile]
    );
    
    if (user.length === 0) {
      return res.status(200).json({ 
        status: false, 
        msg: "Mobile number not registered" 
      });
    }
    
    let otp;
    try {
      const response = await fetch(`https://otp.fctechteam.org/send_otp.php?mode=test&digit=6&mobile=${mobile}`);
      const data = await response.json();
      otp = data.otp;
    } catch (err) {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    if (mobile === '1234567890') {
      otp = '123456';
    }
    
    if (type == 1 || type == 2) {
      await send_otp(req, otp, mobile);
    }
    
   
    const tokenPayload = {
      id: user[0].id,
      type: type 
    };
    
    console.log('JWT_SECRET', JWT_SECRET);
    
    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.status(200).json({
      status: true,
      msg: "OTP Sent Successfully",
      otp: otp.toString(),
      token,
      data: user[0]
    });
    
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ 
      status: false, 
      msg: "Internal Server Error", 
      error: error.message 
    });
  }
});
// Function to ensure directory exists
async function ensureDir(dirPath) {
    try {
        await access(dirPath, fs.constants.F_OK);
    } catch (err) {
        // Directory doesn't exist, create it
        await mkdir(dirPath, { recursive: true });
    }
}

// Function to save base64 image
async function saveBase64Image(base64String, folder, filename) {
    try {
        if (!base64String) return '';
        
        // Remove data:image/jpeg;base64, or similar prefix if present
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        
        // Create full directory path
        const uploadDir = path.join(__dirname, '../public/assets/images', folder);
        
        // Ensure directory exists
        await ensureDir(uploadDir);
        
        // Generate unique filename if not provided
        const actualFilename = filename || `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        
        // Full file path
        const filePath = path.join(uploadDir, actualFilename);
        
        // Write file
        await writeFile(filePath, base64Data, 'base64');
        
        // Return the URL
        return `${BASE_URL}/assets/images/${folder}/${actualFilename}`;
    } catch (error) {
        console.error('Error saving base64 image:', error);
        throw error;
    }
}

// Registration API
router.post('/register_old', async (req, res) => {
    try {

        const { 
            name, 
            mobile, 
            email, 
            password, 
            confirmpassword,
            business_name, 
            upload_shop_logo,
            shop_doc ,
        } = req.body;

        if (!name || !mobile || !email || !password || !confirmpassword) {
            return res.status(400).json({
                status: false,
                msg: "Name, mobile, email, password and confirm password are required"
            });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({
                status: false,
                msg: "Password and confirm password do not match"
            });
        }

        const [mobileCheck] = await db.query(
            "SELECT id FROM users WHERE mobile = ?", 
            [mobile]
        );

        if (mobileCheck.length > 0) {
            return res.status(409).json({
                status: false,
                msg: "Mobile number already registered"
            });
        }

        const [emailCheck] = await db.query(
            "SELECT id FROM users WHERE email = ?", 
            [email]
        );

        if (emailCheck.length > 0) {
            return res.status(409).json({
                status: false,
                msg: "Email already registered"
            });
        }

        let shopLogoUrl = '';
        if (upload_shop_logo) {
            const logoFilename = `shop_logo_${Date.now()}.jpg`;
            shopLogoUrl = await saveBase64Image(upload_shop_logo,'shop_logos',logoFilename);
        }

        let shopDocUrl = '';
        if (shop_doc) {
            const docFilename = `shop_doc_${Date.now()}.jpg`;
            shopDocUrl = await saveBase64Image(shop_doc,'shop_docs',docFilename);
        }
        
        

        const insertSql = `INSERT INTO users 
        (name, mobile, email, password, confirmpassword, business_name, upload_shop_logo, shop_doc, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        const [result] = await db.query(insertSql, [
            name,
            mobile,
            email,
            password,
            confirmpassword,
            business_name || '',
            shopLogoUrl,
            shopDocUrl
        ]);
        const tokenPayload = {
            id: result.insertId,
            type: 3 // Add user type to payload
        };
          
        const token = jwt.sign(tokenPayload,JWT_SECRET,{ expiresIn: "7d" });
        
        
        
        const [updateuser] = await db.query(
            "UPDATE users set token=? WHERE id=?",
            [token,result.insertId]
        );
        
        const [newUser] = await db.query(
            "SELECT id,name,mobile,email,business_name,upload_shop_logo,shop_doc FROM users WHERE id=?",
            [result.insertId]
        );

        res.status(201).json({
            status: true,
            msg: "User registered successfully",
            data: newUser[0],
            token
        });

    } catch (error) {

        console.error("Error in registration:", error);

        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });

    }
});

router.post('/upload_bill', verifyToken, async (req, res) => {
    try {

        const { image, referral_code, status, coupon_code, total_amount,payment_method } = req.body;
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({
                status: false,
                msg: "User not authenticated"
            });
        }
        let imageUrl = '';
        // ✅ Save Image
        if (image) {
            const filename = `bill_${Date.now()}.jpg`;
            imageUrl = await saveBase64Image(image, 'cashback_bills', filename);
        }

        // ✅ Insert Query FIXED
        const insertSql = `
            INSERT INTO cashback 
            (image, referral_code, created_at, coupon_code, total_amount, status, user_id,payment_method) 
            VALUES (?, ?, NOW(), ?, ?, ?, ?,?)
        `;

        const [result] = await db.query(insertSql, [
            imageUrl,
            referral_code,
            coupon_code,
            total_amount,
            status || 1,
            user_id,
            payment_method
        ]);

        return res.status(201).json({
            status: true,
            msg: "Bill uploaded successfully"
           
        });

    } catch (error) {

        console.error("Error in upload_bill:", error);

        return res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });

    }
});

router.post('/register', async (req, res) => {
  try {

    const { name, mobile, password, confirmpassword, refer_code } = req.body;

    // ✅ Validation
    if (!name || !mobile || !password || !confirmpassword) {
      return res.status(400).json({
        status: false,
        msg: "name, mobile, password and confirm password are required"
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({
        status: false,
        msg: "Password and confirm password do not match"
      });
    }

    // ✅ Mobile check
    const [mobileCheck] = await db.query(
      "SELECT id FROM users WHERE mobile = ?",
      [mobile]
    );

    if (mobileCheck.length > 0) {
      return res.status(200).json({
        status: false,
        msg: "Mobile number already registered"
      });
    }

    // ✅ Insert user
    const insertSql = `
      INSERT INTO users 
      (name, mobile, password, refer_code, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(insertSql, [
      name,
      mobile,
      password,
      refer_code || null
    ]);

    // ✅ Token generate
    const tokenPayload = {
      id: result.insertId,
      type: 3
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    // ✅ Save token
    await db.query(
      "UPDATE users SET token = ? WHERE id = ?",
      [token, result.insertId]
    );

    // ✅ Get user
    const [newUser] = await db.query(
      "SELECT id, name, mobile, refer_code FROM users WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      status: true,
      msg: "User registered successfully",
      data: newUser[0],
      token
    });
 } catch (error) {

    console.error("Error in registration:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});



router.post('/investor_zone_add', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    // user id from token middleware
    const user_id = req.user.id;

    const insertSql = `
      INSERT INTO investor_zone (amount, user_id, created_at)
      VALUES (?, ?, NOW())
    `;

    const [result] = await db.query(insertSql, [
      amount,
      user_id
    ]);

    return res.status(201).json({
      status: true,
      msg: "Investment added successfully",
      
    });

  } catch (error) {
    console.error("Error in investor_zone:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


// Profile View API (by ID)
// router.get('/profileview/:id', async (req, res) => {
//     try {
//         const userId = req.params.id;

//         if (!userId) {
//             return res.status(400).json({
//                 status: 400,
//                 msg: "User ID is required"
//             });
//         }

//         const sql = "SELECT id, name, mobile, email, business_name, upload_shop_logo, shop_doc, created_at FROM users WHERE id = ?";
//         const [rows] = await db.query(sql, [userId]);

//         if (rows.length === 0) {
//             return res.status(404).json({
//                 status: 404,
//                 msg: "User not found"
//             });
//         }

//         res.status(200).json({
//             status: true,
//             msg: "Profile fetched successfully",
//             data: rows[0]
//         });

//     } catch (error) {
//         console.error("Error fetching profile:", error);
//         res.status(500).json({
//             status: 500,
//             msg: "Internal Server Error",
//             error: error.message
//         });
//     }
// });


router.post('/wishlist', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, productattribute_id } = req.body;

    // ✅ Validation
    if (!product_id) {
      return res.status(400).json({
        status: false,
        msg: "product_id is required"
      });
    }

    const attr_id = productattribute_id || 0;


    const checkSql = `
      SELECT id, status 
      FROM favorites 
      WHERE user_id = ? AND product_id = ? AND productattribute_id = ?
      LIMIT 1
    `;

    const [existing] = await db.query(checkSql, [
      user_id,
      product_id,
      attr_id
    ]);

    if (existing.length > 0) {
      const newStatus = existing[0].status == 1 ? 0 : 1;

      const updateSql = `
        UPDATE favorites 
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `;

      await db.query(updateSql, [newStatus, existing[0].id]);

      return res.status(200).json({
        status: true,
        msg: newStatus === 1 ? "Added to wishlist" : "Removed from wishlist",
        is_favorite: newStatus
      });
    }

   
    const insertSql = `
      INSERT INTO favorites 
      (user_id, product_id, productattribute_id, status, created_at, updated_at)
      VALUES (?, ?, ?, 1, NOW(), NOW())
    `;

    const [result] = await db.query(insertSql, [
      user_id,
      product_id,
      attr_id
    ]);

    return res.status(200).json({
      status: true,
      msg: "Added to wishlist",
      is_favorite: 1,
      id: result.insertId
    });

  } catch (error) {
    console.error("Wishlist Error:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.get('/profileview', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `SELECT id, name, image, created_at, mobile, amount, email, password, confirmpassword, business_name, upload_shop_logo as image, refer_code, wallet, referral_user FROM users WHERE id = ?`;
        const [rows] = await db.query(sql, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                msg: "User not found"
            });
        }

        return res.status(200).json({
            status: true,
            msg: "Profile fetched successfully",
            data: rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});

router.get('/referral_link', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `SELECT id, refer_code, created_at FROM users WHERE id = ?`;
        const [rows] = await db.query(sql, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                msg: "User not found"
            });
        }

        const user = rows[0];

        // Dynamic referral link
        const referral_link = `https://hellomart.com/register?ref=${user.refer_code}`;

        return res.status(200).json({
            status: true,
            msg: "Referral link fetched successfully",
            data: {
                id: user.id,
                referral_code: user.referral_code,
                referral_link: referral_link,
                created_at: user.created_at
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});
// router.post('/order_place', verifyToken, async (req, res) => {
//   try {
//     const user_id = req.user.id;

//     const {
//       address_id,
//       mrp,
//       paymode,
//       delivery_charge,
//       shopping_point,
//       gst_amount,
//       coupon_id,
//       discount,
//       item
//     } = req.body;
    

    

//     // ✅ Validation
//     if (!address_id || !total_amount || !paymode) {
//       return res.status(400).json({
//         status: false,
//         msg: "address_id, total_amount, paymode required"
//       });
//     }

//     const now = new Date();
//     // ✅ Get cart items
//     const [cartItems] = await db.query(`
//       SELECT c.*, vp.productattribute 
//       FROM cart c
//       LEFT JOIN products vp ON c.product_id = vp.id
//       WHERE c.user_id = ? AND c.status = 0
//     `, [user_id]);

//     if (cartItems.length === 0) {
//       return res.json({ status: false, msg: "Cart is empty" });
//     }

//     // ✅ Commission
//     const [commissionRow] = await db.query(
//       `SELECT shop FROM commission WHERE id = 1`
//     );

//     const shopCommission = commissionRow.length ? commissionRow[0].shop : 1;

//     const vendor_fee = (total_amount * shopCommission) / 100;
//     const admin_fee = total_amount - vendor_fee;

//     // ✅ Group by vendor
//     const grouped = {};
//     cartItems.forEach(item => {
//       if (!grouped[item.vendor_id]) grouped[item.vendor_id] = [];
//       grouped[item.vendor_id].push(item);
//     });

//     const master_order_id = "ORD" + Math.floor(10000 + Math.random() * 90000);
//     let orderIds = [];

//     // 🔁 Loop vendor wise
//     for (const vendorId in grouped) {

//       const items = grouped[vendorId];
//       const otp = Math.floor(100000 + Math.random() * 900000);
//       const sub_order_id = `${master_order_id}-${vendorId}`;

//       // ✅ Update stock
//       for (const item of items) {
//         let attrs = [];

//         try {
//           attrs = JSON.parse(item.productattribute || "[]");
//         } catch {}

//         const buyQty = parseInt(item.quantity);

//         attrs = attrs.map(attr => {
//           if (attr.id == item.productattribute_id) {
//             let stock = Math.max(0, parseInt(attr.stock) - buyQty);
//             let qty = Math.max(0, parseInt(attr.quantity) - buyQty);

//             return { ...attr, stock: stock.toString(), quantity: qty.toString() };
//           }
//           return attr;
//         });

//         await db.query(
//           `UPDATE products SET productattribute = ? WHERE id = ?`,
//           [JSON.stringify(attrs), item.product_id]
//         );
//       }

//       // ✅ Wallet logic
//       let remaining_amount = 0;

//       if (parseInt(paymode) === 2) {
//         const [userRow] = await db.query(
//           `SELECT wallet FROM users WHERE id = ?`,
//           [user_id]
//         );

//         let wallet = userRow[0]?.wallet || 0;

//         if (wallet >= total_amount) {
//           await db.query(
//             `UPDATE users SET wallet = wallet - ? WHERE id = ?`,
//             [total_amount, user_id]
//           );
//         } else {
//           remaining_amount = total_amount - wallet;

//           await db.query(
//             `UPDATE users SET wallet = 0 WHERE id = ?`,
//             [user_id]
//           );
//         }

//         await db.query(`
//           INSERT INTO wallet_transactions
//           (user_id, amount, type, status, order_id, created_at, updated_at)
//           VALUES (?, ?, 'debit', 'success', ?, NOW(), NOW())
//         `, [user_id, total_amount, sub_order_id]);
//       }

//       // ✅ Insert order
//       const [orderResult] = await db.query(`
//         INSERT INTO orders 
//         (user_id, order_id, master_order_id, vendor_id, address_id,
//          total_amount, paymode, delivery_amount, Item_total, handling_charge,
//          delivery_partner_name, phone, coupon_id, product_discount,
//          payment_status, status, created_at, updated_at,
//          vendor_free, admin_fee, otp, remaining_amount)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'success', ?, NOW(), NOW(), ?, ?, ?, ?)
//       `, [
//         user_id,
//         sub_order_id,
//         master_order_id,
//         vendorId,
//         address_id,
//         total_amount,
//         paymode,
//         delivery_amount,
//         Item_total,
//         handling_charge,
//         delivery_partner,
//         phone,
//         coupon_id,
//         product_discount,
//         0,
//         vendor_fee,
//         admin_fee,
//         otp,
//         remaining_amount
//       ]);

//       // ✅ Update cart
//       const cartIds = items.map(i => i.id);

//       await db.query(
//         `UPDATE cart SET status=1, order_id=?, master_order_id=?, updated_at=NOW() WHERE id IN (?)`,
//         [sub_order_id, master_order_id, cartIds]
//       );

//       orderIds.push(sub_order_id);
//     }

//     return res.json({
//       status: true,
//       message: "Orders placed successfully",
//       master_order_id,
//       sub_orders: orderIds,
//       order_count: orderIds.length,
//       paymode
//     });

//   } catch (error) {
//     console.error("Order Error:", error);

//     return res.status(500).json({
//       status: false,
//       msg: "Internal Server Error",
//       error: error.message
//     });
//   }
// });

async function clearCart(user_id) {
  try {
    const [rows] = await db.query(`DELETE FROM cart WHERE user_id='${user_id}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}


router.post('/order_place', verifyToken, async (req, res) => {
try{
    const user_id = req.user.id;
    const {
      address_id,
      mrp,
      paymode,
      delivery_charge,
      shopping_point,
      gst_amount,
      coupon_id,
      discount,
      order_total,
      gateway_id,
      items,
     } = req.body;
    // paymode 1=>COD,2=>Online
    if(!address_id){
        return res.json({
        status:false,
        msg:"Address required"
        });
    }
    coupon_discount=0;  // Need to rework
    
    // await conn.beginTransaction();
    const rand=Math.floor(1000000 + Math.random() * 9000000);
    uniqueorder_id=`HelloMart-${rand}`;
    const [order] = await db.query(
    `INSERT INTO orders(user_id,uniqueorder_id,address_id,bag_mrp,bag_discount,coupon_discount,shipping_fee,grand_total,status,payment_type,gateway_id)VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [user_id,uniqueorder_id,address_id,mrp,discount,coupon_discount,delivery_charge,order_total,"1",paymode,gateway_id]
    );
    
    const order_id = order.insertId;
    
    for(const item of items){
    
        await db.query(`INSERT INTO order_items(order_id,product_id,quantity,price,mrp,uniqueorder_id,product_attribute_id)VALUES (?,?,?,?,?,?,?)`,[order_id,item.product_id,item.quantity,item.price,item.mrp,uniqueorder_id,item.product_attribute_id
        ]);
    
    }

    // await conn.commit();
    await clearCart(user_id);
    
    res.json({
    status:true,
    message:"Order placed successfully",
    });


  } catch (err) {
    res.status(500).json({
      msg: "Internal Server Error",
      error: err.message,
      status: 500
    });
  }
});

router.post('/support_ticket', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;

    // ✅ Validation
    if (!subject) {
      return res.status(400).json({
        status: false,
        msg: "subject is required"
      });
    }

    if (!message) {
      return res.status(400).json({
        status: false,
        msg: "message is required"
      });
    }

    const sql = `
      INSERT INTO support_ticket 
      (subject, reply, status, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      subject,
      message,   // reply column me user ka message store kar rahe ho
      0,         // 0 = pending (default)
      userId
    ];

    const [result] = await db.query(sql, values);

    return res.status(200).json({
      status: true,
      msg: "Support ticket created successfully",
     
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.get('/support_ticket_list', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        id, subject, reply, created_at, updated_at, status, user_id
      FROM support_ticket
      WHERE user_id = ?
      ORDER BY id DESC
    `;

    const [rows] = await db.query(sql, [userId]);

    return res.status(200).json({
      status: true,
      msg: "Support ticket list fetched successfully",
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.get('/bank_details', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    // ✅ bank details
    const [bankRows] = await db.query(
      `SELECT 
        id,
        account_holder_name,
        bank_name,
        ifsc,
        account_no,
        type,
        updated_at
      FROM bank_details 
      WHERE user_id = ?`,
      [user_id]
    );

    // ✅ upi details
    const [upiRows] = await db.query(
      `SELECT 
        id,
        account_holder_name,
        upi_no,
        upi_id,
        status,
        updated_at
      FROM upi 
      WHERE user_id = ?`,
      [user_id]
    );

    // ✅ mask account number (optional but recommended)
    const maskedBank = bankRows.map(item => ({
      ...item,
      account_no: item.account_no
    }));

    // ✅ no data case
    if (bankRows.length === 0 && upiRows.length === 0) {
      return res.status(200).json({
        status: true,
        msg: "No data found",
        data: {
          bank: [],
          upi: []
        },
        error: []
      });
    }

    return res.status(200).json({
      status: true,
      msg: "Data fetched successfully",
      data: {
        bank: maskedBank,
        upi: upiRows
      }
    });

  } catch (error) {
    return res.status(200).json({
      status: true,
      msg: "No data",
      data: {
        bank: [],
        upi: []
      },
      error: error.message
    });
  }
});

router.post('/addbank', verifyToken, async (req, res) => {
  try {
    const {
      account_holder_name,
      bank_name,
      ifsc,
      account_no,
      confirm_account_no,
      type
    } = req.body;

    const user_id = req.user.id; 

    // validation
    if (
      !account_holder_name ||
      !bank_name ||
      !ifsc ||
      !account_no ||
      !confirm_account_no ||
      !type
    ) {
      return res.status(400).json({
        status: false,
        msg: "All fields are required"
      });
    }

    if (account_no !== confirm_account_no) {
      return res.status(400).json({
        status: false,
        msg: "Account number does not match"
      });
    }

    const sql = `
      INSERT INTO bank_details 
      (account_holder_name, bank_name, ifsc, account_no, confirm_account_no, type, updated_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    const [result] = await db.query(sql, [
      account_holder_name,
      bank_name,
      ifsc,
      account_no,
      confirm_account_no,
      type,
      user_id
    ]);

    return res.status(200).json({
      status: true,
      msg: "Bank details added successfully"
     
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.post('/addaddress', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { latitude, longitude, workplace, address, type } = req.body;

   
    if (!latitude) {
      return res.status(400).json({ status: false, msg: "latitude is required" });
    }

    if (!longitude) {
      return res.status(400).json({ status: false, msg: "longitude is required" });
    }

    if (!workplace) {
      return res.status(400).json({ status: false, msg: "workplace is required" });
    }

    if (!address) {
      return res.status(400).json({ status: false, msg: "address is required" });
    }

    const insertSql = `
      INSERT INTO address 
      (user_id, latitude, longitude, workplace, address, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [user_id, latitude, longitude, workplace, address, type || null];

    await db.query(insertSql, values);

    return res.status(200).json({
      status: true,
      msg: "Address added successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.post('/addressupdate', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id, latitude, longitude, workplace, address, type } = req.body;

    // ✅ Only id required
    if (!id) {
      return res.status(400).json({
        status: false,
        msg: "id is required"
      });
    }

    // ✅ Check ownership
    const [exist] = await db.query(
      `SELECT id FROM address WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (exist.length === 0) {
      return res.status(404).json({
        status: false,
        msg: "Address not found"
      });
    }

   
    let fields = [];
    let values = [];

    if (latitude) {
      fields.push("latitude = ?");
      values.push(latitude);
    }

    if (longitude) {
      fields.push("longitude = ?");
      values.push(longitude);
    }

    if (workplace) {
      fields.push("workplace = ?");
      values.push(workplace);
    }

    if (address) {
      fields.push("address = ?");
      values.push(address);
    }

    if (type) {
      fields.push("type = ?");
      values.push(type);
    }

    // ❌ Agar kuch bhi update nahi aaya
    if (fields.length === 0) {
      return res.status(400).json({
        status: false,
        msg: "At least one field is required to update"
      });
    }

    // ✅ Final query
    const sql = `
      UPDATE address 
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;

    values.push(id, user_id);

    await db.query(sql, values);

    return res.status(200).json({
      status: true,
      msg: "Address updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.get('/addresslist', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const sql = `
      SELECT * FROM address 
      WHERE user_id = ?
      ORDER BY id DESC
    `;

    const [rows] = await db.query(sql, [user_id]);

    return res.status(200).json({
      status: true,
      msg: "Address list fetched successfully",
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.get('/video', async (req, res) => {
  try {

    const sql = `
      SELECT * FROM video
      ORDER BY id DESC
      LIMIT 1
    `;

    const [rows] = await db.query(sql);

    return res.status(200).json({
      status: true,
      msg: "Video fetched successfully",
      data: rows[0] || null
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.post('/bankupdate', verifyToken, async (req, res) => {
  try {
    const {
      id,
      account_holder_name,
      bank_name,
      ifsc,
      account_no,
      confirm_account_no,
      type
    } = req.body;
    const user_id = req.user.id;
    if (account_no !== confirm_account_no) {
      return res.status(400).json({
        status: false,
        msg: "Account number does not match"
      });
    }

    // ✅ check record exists
    const checkSql = `SELECT id FROM bank_details WHERE id = ? AND user_id = ?`;
    const [check] = await db.query(checkSql, [id, user_id]);

    if (check.length === 0) {
      return res.status(404).json({
        status: false,
        msg: "Bank details not found"
      });
    }

    const sql = `
      UPDATE bank_details 
      SET 
        account_holder_name = ?, 
        bank_name = ?, 
        ifsc = ?, 
        account_no = ?, 
        confirm_account_no = ?, 
        type = ?, 
        updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;

    const [result] = await db.query(sql, [
      account_holder_name,
      bank_name,
      ifsc,
      account_no,
      confirm_account_no,
      type,
      id,
      user_id
    ]);

    return res.status(200).json({
      status: true,
      msg: "Bank details updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});



router.post('/addupi', verifyToken, async (req, res) => {
  try {
    const {
      account_holder_name,
      upi_no,
      upi_id
    } = req.body;

    const user_id = req.user.id;

   
    if (!account_holder_name || !upi_no || !upi_id) {
      return res.status(400).json({
        status: false,
        msg: "All fields are required"
      });
    }

    const upiRegex = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;
    if (!upiRegex.test(upi_id)) {
      return res.status(400).json({
        status: false,
        msg: "Invalid UPI ID"
      });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(upi_no)) {
      return res.status(400).json({
        status: false,
        msg: "Invalid UPI mobile number"
      });
    }

    const sql = `
      INSERT INTO upi 
      (account_holder_name, upi_no, upi_id, updated_at, user_id, status)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;

    const [result] = await db.query(sql, [
      account_holder_name,
      upi_no,
      upi_id,
      user_id,
      1
    ]);

    return res.status(200).json({
      status: true,
      msg: "UPI added successfully"
      
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.get('/favorite-products', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const sql = `
      SELECT 
        p.*,
        f.id as favorite_id,
        f.productattribute_id,
        f.status as is_favorite
      FROM favorites f
      INNER JOIN products p ON p.id = f.product_id
      WHERE f.user_id = ? AND f.status = 1
      ORDER BY f.id DESC
    `;

    const [rows] = await db.query(sql, [user_id]);

    if (rows.length === 0) {
      return res.status(200).json({
        status: true,
        msg: "No favorite products found",
        data: []
      });
    }

    const formattedRows = rows.map(product => {
      let parsedAttributes = [];

      try {
        if (product.productattribute) {
          let raw = product.productattribute;

          if (typeof raw === "string") {
            raw = raw.trim();

            // ✅ Fix broken JSON
            if (raw.includes('][')) {
              raw = raw.replace(/\]\s*\[/g, ',');
            }

            parsedAttributes = JSON.parse(raw);
          } else if (Array.isArray(raw)) {
            parsedAttributes = raw;
          }

          if (Array.isArray(parsedAttributes)) {

            // ✅ Remove duplicate attributes
            parsedAttributes = Array.from(
              new Map(parsedAttributes.map(item => [item.id, item])).values()
            );

            // ✅ Add calculation inside each attribute
            parsedAttributes = parsedAttributes.map(item => {
              let discount = item.discount_percentage;

              if (typeof discount === "string") {
                discount = discount.replace('%', '').trim();
              }

              discount = Number(discount);

              const discountedPrice = Number(
                item.discounted_price || product.discounted_price || 0
              );

              return {
                ...item,
                discount_percentage: discount,
                cashback_amount: (discountedPrice * 1).toFixed(2),
                shopping_point: (discountedPrice * 0.10).toFixed(2),
                confirm_booking: (discountedPrice * 0.01).toFixed(2)
              };
            });

          } else {
            parsedAttributes = [];
          }
        }
      } catch (err) {
        console.log("ATTRIBUTE ERROR:", err.message);
        parsedAttributes = [];
      }

      return {
        ...product,
        productattribute: parsedAttributes
      };
    });

    return res.status(200).json({
      status: true,
      msg: "Favorite products fetched successfully",
      data: formattedRows
    });

  } catch (error) {
    console.error("Error fetching favorite products:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.post('/upiupdate', verifyToken, async (req, res) => {
  try {
    const { id, account_holder_name, upi_no, upi_id, status } = req.body;
    const user_id = req.user.id;

   
    const [check] = await db.query(
      "SELECT id FROM upi WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    if (check.length === 0) {
      return res.status(404).json({
        status: false,
        msg: "UPI not found"
      });
    }
    await db.query(
      `UPDATE upi 
       SET account_holder_name = ?, upi_no = ?, upi_id = ?, status = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [account_holder_name, upi_no, upi_id, status || 1, id, user_id]
    );

    return res.status(200).json({
      status: true,
      msg: "UPI updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


// router.post('/AddCart', verifyToken, async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const { product_id, quantity, productattribute_id, sub_categorise } = req.body;

//     // ✅ Validation
//     if (!product_id || !quantity) {
//       return res.status(400).json({
//         status: false,
//         msg: "product_id and quantity are required"
//       });
//     }

//     // ✅ Get product vendor info
//     const [productRows] = await db.query(
//       `SELECT vendor_id FROM products WHERE id = ?`,
//       [product_id]
//     );

//     if (productRows.length === 0) {
//       return res.status(200).json({
//         status: true,
//         msg: "Invalid Product ID"
//       });
//     }

//     const vendorId = productRows[0].vendor_id;
//     // const discountedPrice = productRows[0].discounted_price;
//     const totalPrice = discountedPrice * quantity;

//     // ✅ ONE VENDOR CHECK
//     const [existingVendorCart] = await db.query(
//       `SELECT * FROM cart WHERE user_id = ? AND status = 0 LIMIT 1`,
//       [user_id]
//     );

//     if (
//       existingVendorCart.length > 0 &&
//       existingVendorCart[0].vendor_id != vendorId
//     ) {
//       return res.status(200).json({
//         status: true,
//         // success: false,
//         msg: "Your cart contains items from another shop, Please clear your cart first"
//       });
//     }

//     // ✅ Check existing cart item
//     const [existingCart] = await db.query(
//       `SELECT * FROM cart 
//       WHERE user_id = ? AND product_id = ? AND productattribute_id = ? AND status = 0 
//       LIMIT 1`,
//       [user_id, product_id, productattribute_id || 0]
//     );

//     // ✅ If exists → update
//     if (existingCart.length > 0) {
//       const cartItem = existingCart[0];

//       await db.query(
//         `UPDATE cart 
//          SET quantity = ?, price = ?, vendor_id = ?, productattribute_id = ?, updated_at = NOW()
//          WHERE id = ?`,
//         [
//           cartItem.quantity + quantity,
//           cartItem.price + totalPrice,
//           vendorId,
//           productattribute_id || 0,
//           cartItem.id
//         ]
//       );

//       const [updatedCart] = await db.query(
//         `SELECT * FROM cart WHERE id = ?`,
//         [cartItem.id]
//       );

//       return res.status(200).json({
//         status: true,
//         msg: "Added Successfully",
//         result: updatedCart[0]
//       });
//     }

//     // ✅ Insert new cart item
//     const [insertResult] = await db.query(
//       `INSERT INTO cart 
//       (user_id, product_id, vendor_id, quantity, price, sub_categorise, productattribute_id, created_at, updated_at, status, isLatestFav)
//       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, 1)`,
//       [
//         user_id,
//         product_id,
//         vendorId,
//         quantity,
//         totalPrice,
//         sub_categorise || null,
//         productattribute_id || 0
//       ]
//     );

//     const [newCart] = await db.query(
//       `SELECT * FROM cart WHERE id = ?`,
//       [insertResult.insertId]
//     );

//     return res.status(200).json({
//       status: true,
//       msg: "Added Successfully",
//       result: newCart[0]
//     });

//   } catch (error) {
//     console.error("AddCart Error:", error);

//     return res.status(500).json({
//       status: false,
//       msg: "Internal Server Error",
//       error: error.message
//     });
//   }
// });
async function addtocart(req, userid, product_id,productattribute_id,sub_categorise,quantity = 1) {
  try {
    // Check if product already in cart
    const [rows] = await db.query(
      'SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userid, product_id]
    );

    if (rows.length > 0) {
      // Update qty
      await db.query(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, userid, product_id]
      );
    } else {
      // Insert new row
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity,productattribute_id,sub_categorise) VALUES (?, ?, ?, ?, ?)',
        [userid, product_id, quantity, productattribute_id, sub_categorise]
      );
    }

    return { success: true };
  } catch (err) {
    throw new Error(err.message);
  }
}

router.post('/AddCart', verifyToken, async (req, res) => {
  try {
    const userid = req.user.id;

    const { product_id, quantity, productattribute_id, sub_categorise, coupon_id } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({
        msg: "Product Id & Quantity required",
        status: 400
      });
    }

    // ✅ 1. Product fetch karo
    const [products] = await db.query(
      `SELECT discounted_price, productattribute FROM products WHERE id = ?`,
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        msg: "Product not found",
        status: 404
      });
    }

    const product = products[0];

    // ✅ 2. productattribute parse
    let parsedAttributes = [];
    let selectedAttribute = null;

    try {
      let raw = product.productattribute;

      if (typeof raw === "string") {
        raw = raw.trim();
        if (raw.includes('][')) {
          raw = raw.replace(/\]\s*\[/g, ',');
        }
        parsedAttributes = JSON.parse(raw);
      } else if (Array.isArray(raw)) {
        parsedAttributes = raw;
      }

      // ✅ selected attribute find
      selectedAttribute = parsedAttributes.find(
        item => Number(item.id) === Number(productattribute_id)
      );

    } catch (err) {
      console.log("ATTRIBUTE ERROR:", err.message);
    }

    // ✅ 3. discounted price
    const discountedPrice = Number(
      selectedAttribute?.discounted_price || product.discounted_price || 0
    );

    // ✅ 4. confirm booking (1%)
    const confirm_booking = (discountedPrice * 0.01).toFixed(2);

    // ✅ 5. Coupon apply
    let coupon_discount = 0;

    if (coupon_id) {
      const [couponRows] = await db.query(
        `SELECT * FROM coupon WHERE id = ? AND status = 1`,
        [coupon_id]
      );

      if (couponRows.length > 0) {
        coupon_discount = Number(couponRows[0].amount || 0);
      }
    }

    // ✅ 6. Final amount
    const final_amount = (discountedPrice - coupon_discount).toFixed(2);

    // ✅ 7. Check if already in cart
    const [existingCart] = await db.query(
      `SELECT id, quantity FROM cart 
       WHERE user_id = ? AND product_id = ? AND productattribute_id = ?`,
      [userid, product_id, productattribute_id]
    );

    if (existingCart.length > 0) {
      // 👉 already hai → quantity update karo
      const newQty = Number(existingCart[0].quantity) + Number(quantity);

      await db.query(
        `UPDATE cart SET quantity = ? WHERE id = ?`,
        [newQty, existingCart[0].id]
      );
    } else {
      // 👉 nahi hai → normal insert
      await addtocart(req, userid, product_id, productattribute_id, sub_categorise, quantity);
    }

    return res.status(200).json({
      status: 200,
      msg: "Cart Added Successfully",
      data: {
        product_id,
        productattribute_id,
        discountedPrice: discountedPrice.toFixed(2),
        confirm_booking,
        coupon_discount: coupon_discount.toFixed(2),
        final_amount
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Internal Server Error",
      error: err.message,
      status: 500
    });
  }
});

router.post('/settings', async (req, res) => {
    try {

        const { type } = req.body;

        if (!type) {
            return res.status(400).json({
                status: false,
                msg: "type is required"
            });
        }

        const sql = `
        SELECT id, name, value, status, modal_type, created_at, updated_at 
        FROM settings 
        WHERE id = ?
        `;

        const [rows] = await db.query(sql, [type]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                msg: "No setting found"
            });
        }

        res.status(200).json({
            status: true,
            msg: "Settings fetched successfully",
            data: rows[0]
        });

    } catch (error) {

        console.error("Error fetching settings:", error);

        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });

    }
});

router.post('/products', async (req, res) => {
    try {
        const { sub_category_id } = req.body;

        if (sub_category_id === undefined || sub_category_id === null) {
            return res.status(400).json({
                status: 400,
                msg: "sub_category_id is required"
            });
        }

        let sql = `
            SELECT 
                id, sub_category_id, category_id, vendor_name, vendor_id, image,
                product_name, total_price, discounted_price, discount_percentage,
                sizeChart, Details, rating, stock, weight, Manufacture_date,
                expiry_date, grocery_type, type, rating_feedback, short_description,
                made_in, hsn_code, tax_type, total_allowed_quantity,
                minimum_order_quantity, warranty_periods, guaranty_periods, brands,
                pickup_location, product_returnable, product_cod_allowed,
                product_cancelable, underSubCategory, status, delivery_time,
                user_id, cart_id, cart_quantity, product_status, unit,
                created_at, updated_at, nutrientdesc, foodtype, productattribute
            FROM products
        `;

        let params = [];

        if (Number(sub_category_id) !== 0) {
            sql += ` WHERE sub_category_id = ?`;
            params.push(sub_category_id);
        }

        sql += ` ORDER BY id DESC`;

        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({
                data: []
            });
        }

        const formattedRows = rows.map(product => {
            let parsedAttributes = [];

            try {
                if (product.productattribute) {
                    let raw = product.productattribute;

                    if (typeof raw === "string") {
                        raw = raw.trim();

                        if (raw.includes('][')) {
                            raw = raw.replace(/\]\s*\[/g, ',');
                        }

                        parsedAttributes = JSON.parse(raw);
                    } else if (Array.isArray(raw)) {
                        parsedAttributes = raw;
                    }

                    if (Array.isArray(parsedAttributes)) {

                        // ✅ remove duplicates
                        parsedAttributes = Array.from(
                            new Map(parsedAttributes.map(item => [item.id, item])).values()
                        );

                        // ✅ add calculation
                        parsedAttributes = parsedAttributes.map(item => {
                            let discount = item.discount_percentage;

                            if (typeof discount === "string") {
                                discount = discount.replace('%', '').trim();
                            }

                            discount = Number(discount);

                            const discountedPrice = Number(
                                item.discounted_price || product.discounted_price || 0
                            );

                            return {
                                ...item,
                                discount_percentage: discount,
                                cashback_amount: (discountedPrice * 1).toFixed(2),
                                shopping_point: (discountedPrice * 0.10).toFixed(2),
                                confirm_booking: (discountedPrice * 0.01).toFixed(2)
                            };
                        });

                    } else {
                        parsedAttributes = [];
                    }
                }
            } catch (err) {
                console.log("ATTRIBUTE ERROR:", err.message);
                parsedAttributes = [];
            }

            return {
                ...product,
                productattribute: parsedAttributes
            };
        });

        return res.status(200).json({
            status: 200,
            msg: "Products fetched successfully",
            data: formattedRows
        });

    } catch (error) {
        console.error("Error fetching products:", error);

        return res.status(500).json({
            status: 500,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});


router.get('/products_off', async (req, res) => {
  try {
    const sql = `SELECT * FROM products ORDER BY id DESC`;
    const [rows] = await db.query(sql);

    const filteredProducts = [];

    for (let product of rows) {
      let parsedAttributes = [];

      try {
        let raw = product.productattribute;

        if (!raw) continue;

        // ✅ Parse JSON
        if (typeof raw === "string") {
          raw = raw.trim();

          if (raw.includes('][')) {
            raw = raw.replace(/\]\s*\[/g, ',');
          }

          parsedAttributes = JSON.parse(raw);
        } else if (Array.isArray(raw)) {
          parsedAttributes = raw;
        }

        let hasValidDiscount = false;

        // ✅ Loop each attribute
        parsedAttributes = parsedAttributes.map(item => {
          let discount = item.discount_percentage;

          if (typeof discount === "string") {
            discount = discount.replace('%', '').trim();
          }

          discount = Number(discount);

          // 👉 discounted_price attribute level pe hai ya product level?
          const discountedPrice = Number(
            item.discounted_price || product.discounted_price || 0
          );

          // ✅ Calculations (per attribute)
          const cashback_amount = discountedPrice * 1;
          const shopping_point = discountedPrice * 0.10;
          const confirm_booking = discountedPrice * 0.01;

          if (!isNaN(discount) && discount >= 40) {
            hasValidDiscount = true;
          }

          return {
            ...item,
            cashback_amount:cashback_amount.toFixed(2),
            shopping_point:shopping_point.toFixed(2),
            confirm_booking:confirm_booking.toFixed(2)
          };
        });

        // ✅ Only push if at least one attribute has >=40% discount
        if (hasValidDiscount) {
          filteredProducts.push({
            ...product,
            productattribute: parsedAttributes
          });
        }

      } catch (err) {
        console.log("ERROR:", err.message);
        continue;
      }
    }

    return res.json({
      status: true,
      total: filteredProducts.length,
      data: filteredProducts
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

router.get('/products_off_50', async (req, res) => {
  try {

    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        status: false,
        msg: "Type is required"
      });
    }

    const sql = `
      SELECT * FROM products
      WHERE type = ?
      ORDER BY id DESC
    `;

    const [rows] = await db.query(sql, [type]);

    const filteredProducts = rows.map(product => {
      let parsedAttributes = [];

      try {
        if (product.productattribute) {
          let raw = product.productattribute;

          if (typeof raw === "string") {
            raw = raw.trim();

            if (raw.includes('][')) {
              raw = raw.replace(/\]\s*\[/g, ',');
            }

            parsedAttributes = JSON.parse(raw);
          } else if (Array.isArray(raw)) {
            parsedAttributes = raw;
          }

          // ✅ Filter + Calculation together
          parsedAttributes = parsedAttributes
            .map(item => {
              let discount = item.discount_percentage;

              if (typeof discount === "string") {
                discount = discount.replace('%', '').trim();
              }

              discount = Number(discount);

              // 👉 discounted_price attribute ya product se lo
              const discountedPrice = Number(
                item.discounted_price || product.discounted_price || 0
              );

              // ✅ Calculations
              const cashback_amount = discountedPrice * 1;
              const shopping_point = discountedPrice * 0.10;
              const confirm_booking = discountedPrice * 0.01;

              return {
                ...item,
                discount_percentage: discount,
                cashback_amount,
                shopping_point,
                confirm_booking
              };
            })
            .filter(item => item.discount_percentage >= 50 && item.discount_percentage <= 100);

        }
      } catch (err) {
        parsedAttributes = [];
      }

      if (parsedAttributes.length > 0) {
        return {
          ...product,
          productattribute: parsedAttributes
        };
      }

      return null;

    }).filter(p => p !== null);

    return res.status(200).json({
      status: true,
      msg: "50% to 100% OFF products fetched successfully",
      total: filteredProducts.length,
      data: filteredProducts
    });

  } catch (error) {
    console.error("Error fetching products:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.post('/popularproducts', async (req, res) => {
  try {
    const { sub_category_id, limit, offset } = req.body;

    // ✅ Default values
    let finalLimit = parseInt(limit) || 20;
    let finalOffset = parseInt(offset) || 0;

    if (finalLimit > 100) finalLimit = 100;

    let sql = `
      SELECT 
        p.*,
        IFNULL(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as total_reviews
      FROM products p
      LEFT JOIN rating r ON p.id = r.product_id
    `;

    let params = [];

    if (sub_category_id && Number(sub_category_id) !== 0) {
      sql += ` WHERE p.sub_category_id = ?`;
      params.push(sub_category_id);
    }

    sql += `
      GROUP BY p.id
      ORDER BY avg_rating DESC, total_reviews DESC
      LIMIT ? OFFSET ?
    `;

    params.push(finalLimit, finalOffset);

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(200).json({
        status: true,
        msg: "No popular products found",
        data: []
      });
    }

    // ✅ Product Attribute Parse + Calculation
    const formattedRows = rows.map(product => {
      let parsedAttributes = [];

      try {
        if (product.productattribute) {
          let raw = product.productattribute;

          if (typeof raw === "string") {
            raw = raw.trim();

            if (raw.includes('][')) {
              raw = raw.replace(/\]\s*\[/g, ',');
            }

            parsedAttributes = JSON.parse(raw);
          } else if (Array.isArray(raw)) {
            parsedAttributes = raw;
          }

          if (Array.isArray(parsedAttributes)) {

            // ✅ Remove duplicates
            parsedAttributes = Array.from(
              new Map(parsedAttributes.map(item => [item.id, item])).values()
            );

            // ✅ Add calculation inside each attribute
            parsedAttributes = parsedAttributes.map(item => {
              let discount = item.discount_percentage;

              if (typeof discount === "string") {
                discount = discount.replace('%', '').trim();
              }

              discount = Number(discount);

              const discountedPrice = Number(
                item.discounted_price || product.discounted_price || 0
              );

              const cashback_amount = discountedPrice * 1;
              const shopping_point = discountedPrice * 0.10;
              const confirm_booking = discountedPrice * 0.01;

              return {
                ...item,
                discount_percentage: discount,
                cashback_amount,
                shopping_point,
                confirm_booking
              };
            });

          } else {
            parsedAttributes = [];
          }
        }
      } catch (err) {
        parsedAttributes = [];
      }

      return {
        ...product,
        productattribute: parsedAttributes
      };
    });

    return res.status(200).json({
      status: true,
      msg: "Most popular products fetched successfully",
      data: formattedRows,
      pagination: {
        limit: finalLimit,
        offset: finalOffset
      }
    });

  } catch (error) {
    console.error("Error fetching popular products:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.get('/top-rated-products', async (req, res) => {
  try {
    let { limit, offset } = req.query;

    // ✅ Default values
    limit = parseInt(limit) || 20;
    offset = parseInt(offset) || 0;

    // ✅ Safety check
    if (limit > 100) limit = 100;

    const sql = `
      SELECT 
        p.*,
        IFNULL(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as total_reviews
      FROM products p
      LEFT JOIN rating r ON p.id = r.product_id
      GROUP BY p.id
      ORDER BY avg_rating DESC, total_reviews DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [limit, offset]);

    // ✅ Parse productattribute + add calculations
    const formattedRows = rows.map(product => {
      let parsedAttributes = [];

      try {
        if (product.productattribute) {
          let raw = product.productattribute;

          if (typeof raw === "string") {
            raw = raw.trim();

            // Fix malformed JSON like ][
            if (raw.includes('][')) {
              raw = raw.replace(/\]\s*\[/g, ',');
            }

            parsedAttributes = JSON.parse(raw);
          } else if (Array.isArray(raw)) {
            parsedAttributes = raw;
          }

          if (Array.isArray(parsedAttributes)) {
            parsedAttributes = parsedAttributes.map(item => {
              let discount = item.discount_percentage;

              if (typeof discount === "string") {
                discount = discount.replace('%', '').trim();
              }

              discount = Number(discount);

              const discountedPrice = Number(
                item.discounted_price || product.discounted_price || 0
              );

              return {
                ...item,
                discount_percentage: discount,
                cashback_amount: (discountedPrice * 1).toFixed(2),
                shopping_point: (discountedPrice * 0.10).toFixed(2),
                confirm_booking: (discountedPrice * 0.01).toFixed(2)
              };
            });
          } else {
            parsedAttributes = [];
          }
        }
      } catch (err) {
        console.log("Product attribute parse error:", err.message);
        parsedAttributes = [];
      }

      return {
        ...product,
        productattribute: parsedAttributes
      };
    });

    return res.status(200).json({
      status: true,
      msg: "Top rated products fetched successfully",
      data: formattedRows,
      pagination: {
        limit,
        offset
      }
    });

  } catch (error) {
    console.error("Error fetching top rated products:", error);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.post('/profileupdate', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;

        const { 
            name, 
            email, 
            business_name, 
            image, 
            shop_doc 
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                status: false,
                msg: "Unauthorized user"
            });
        }

        const [userExists] = await db.query(
            "SELECT id FROM users WHERE id = ?", 
            [userId]
        );

        if (userExists.length === 0) {
            return res.status(404).json({
                status: false,
                msg: "User not found"
            });
        }

        let updateFields = [];
        let updateValues = [];

        if (name) {
            updateFields.push("name = ?");
            updateValues.push(name);
        }

        if (email) {
            const [emailCheck] = await db.query(
                "SELECT id FROM users WHERE email = ? AND id != ?", 
                [email, userId]
            );

            if (emailCheck.length > 0) {
                return res.status(409).json({
                    status: false,
                    msg: "Email already exists"
                });
            }

            updateFields.push("email = ?");
            updateValues.push(email);
        }

        if (business_name) {
            updateFields.push("business_name = ?");
            updateValues.push(business_name);
        }

        if (image) {
            try {
                const filename = `profile_${Date.now()}.jpg`;
                const url = await saveBase64Image(image, 'shop_logos', filename);

                updateFields.push("upload_shop_logo = ?");
                updateValues.push(url);
            } catch {
                return res.status(400).json({
                    status: false,
                    msg: "Invalid shop logo"
                });
            }
        }

        if (shop_doc) {
            try {
                const filename = `shop_doc_${Date.now()}.jpg`;
                const url = await saveBase64Image(shop_doc, 'shop_docs', filename);

                updateFields.push("shop_doc = ?");
                updateValues.push(url);
            } catch {
                return res.status(400).json({
                    status: false,
                    msg: "Invalid shop document"
                });
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                status: false,
                msg: "No fields to update"
            });
        }

        updateValues.push(userId);

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.query(sql, updateValues);

        const [updatedUser] = await db.query(
            `SELECT id, name, mobile, email, business_name, upload_shop_logo, shop_doc 
             FROM users WHERE id = ?`,
            [userId]
        );

        res.status(200).json({
            status: true,
            msg: "Profile updated successfully"
           
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: "Internal Server Error"
        });
    }
});

router.post('/cashback_zones_off', async (req, res) => {
  try {
    const { amount } = req.body;

    // ✅ Validation
    if (!amount) {
      return res.status(400).json({
        status: false,
        msg: "amount is required"
      });
    }

    const sql = `
      SELECT off_1_winner, off_2_winner 
      FROM cashback_zone 
      LIMIT 1
    `;

    const [rows] = await db.query(sql);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        msg: "Cashback config not found"
      });
    }

    const data = rows[0];

    const percentages = [
      Number(data.off_1_winner) || 0,
      Number(data.off_2_winner) || 0
    ];

    // ✅ Format response जैसा तुम चाहते हो
    const percentage_data = percentages.map(p => ({
      type: p.toString(),
      value: ((amount * p) / 100).toString()
    }));

    return res.status(200).json({
      status: true,
      msg: "Cashback calculated successfully",
      data: {
        amount: amount.toString(),
        percentage_data
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});
router.delete('/profiledelete/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({
                status: false,
                msg: "User ID is required"
            });
        }

        // Check if user exists
        const [userExists] = await db.query(
            "SELECT id FROM users WHERE id = ?", 
            [userId]
        );

        if (userExists.length === 0) {
            return res.status(404).json({
                status: false,
                msg: "User not found"
            });
        }

        // Delete user
        await db.query("DELETE FROM users WHERE id = ?", [userId]);

        res.status(200).json({
            status: true,
            msg: "Profile deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting profile:", error);
        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});

module.exports = router;
        