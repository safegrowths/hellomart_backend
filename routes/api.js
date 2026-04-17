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

        const sql = `
        SELECT id, title, image, status, created_at, updated_at 
        FROM categorise
        WHERE status = 1
        ORDER BY id DESC
        `;

        const [rows] = await db.query(sql);

        res.status(200).json({
            status: 200,
            msg: "Categories fetched successfully",
            total: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("Error fetching categories:", error);

        res.status(500).json({
            status: 500,
            msg: "Internal Server Error",
            error: error.message
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
            status: 200,
            msg: "Categories fetched successfully",
            total: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("Error fetching categories:", error);

        res.status(500).json({
            status: 500,
            msg: "Internal Server Error",
            error: error.message
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
            status: 200,
            msg: "Categories fetched successfully",
            total: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("Error fetching categories:", error);

        res.status(500).json({
            status: 500,
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
      status: 200,
      msg: "Coupon banners fetched successfully",
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Error fetching coupon banners:", error);

    return res.status(500).json({
      status: 500,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.post('/sub_categorise', async (req, res) => {
    try {

        const { categorise_id, title } = req.body;

        let sql = `SELECT * FROM sub_categorise WHERE 1=1`;
        let params = [];

        // Filter by category id (optional)
        if (categorise_id) {
            sql += ` AND categorise_id = ?`;
            params.push(categorise_id);
        }

        // Search by title (optional)
        if (title) {
            sql += ` AND title LIKE ?`;
            params.push(`%${title}%`);
        }

        // Order
        sql += ` ORDER BY title ASC`;

        const [rows] = await db.query(sql, params);

        res.status(200).json({
            status: 200,
            msg: "Sub Categories fetched successfully",
            total: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("Error fetching categories:", error);

        res.status(500).json({
            status: 500,
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
        status: 400, 
        msg: "Mobile number and type are required" 
      });
    }
    
    // Seller Login with Password
    if (type == 3) {
      if (!password) {
        return res.status(400).json({ 
          status: 400, 
          msg: "Password required" 
        });
      }
      
      const [user] = await db.query(
        "SELECT id, name, mobile, email, business_name, upload_shop_logo, shop_doc FROM users WHERE mobile=? AND password=?",
        [mobile, password]
      );
      
      if (user.length === 0) {
        return res.status(401).json({ 
          status: 401, 
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
        status: 200,
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
      return res.status(404).json({ 
        status: 404, 
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
      status: 200,
      msg: "OTP Sent Successfully",
      otp: otp.toString(),
      token,
      data: user[0]
    });
    
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ 
      status: 500, 
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
router.post('/register', async (req, res) => {
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
                status: 400,
                msg: "Name, mobile, email, password and confirm password are required"
            });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({
                status: 400,
                msg: "Password and confirm password do not match"
            });
        }

        const [mobileCheck] = await db.query(
            "SELECT id FROM users WHERE mobile = ?", 
            [mobile]
        );

        if (mobileCheck.length > 0) {
            return res.status(409).json({
                status: 409,
                msg: "Mobile number already registered"
            });
        }

        const [emailCheck] = await db.query(
            "SELECT id FROM users WHERE email = ?", 
            [email]
        );

        if (emailCheck.length > 0) {
            return res.status(409).json({
                status: 409,
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
            "SELECT id,name,mobile,email,business_name,upload_shop_logo,shop_doc,token FROM users WHERE id=?",
            [result.insertId]
        );

        res.status(201).json({
            status: 201,
            msg: "User registered successfully",
            data: newUser[0],
            token
        });

    } catch (error) {

        console.error("Error in registration:", error);

        res.status(500).json({
            status: 500,
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
//             status: 200,
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
        status: 400,
        msg: "product_id is required"
      });
    }

    const attr_id = productattribute_id || 0;

    // ✅ Check existing record
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

    // ✅ If exists → toggle
    if (existing.length > 0) {
      const newStatus = existing[0].status == 1 ? 0 : 1;

      const updateSql = `
        UPDATE favorites 
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `;

      await db.query(updateSql, [newStatus, existing[0].id]);

      return res.status(200).json({
        status: 200,
        msg: newStatus === 1 ? "Added to wishlist" : "Removed from wishlist",
        is_favorite: newStatus
      });
    }

    // ✅ First time → insert with status = 1
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
      status: 200,
      msg: "Added to wishlist",
      is_favorite: 1,
      id: result.insertId
    });

  } catch (error) {
    console.error("Wishlist Error:", error);

    return res.status(500).json({
      status: 500,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.get('/profileview', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await db.query(sql, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 404,
                msg: "User not found"
            });
        }

        return res.status(200).json({
            status: 200,
            msg: "Profile fetched successfully",
            data: rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: "Internal Server Error",
            error: error.message
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
        status: 400,
        msg: "subject is required"
      });
    }

    if (!message) {
      return res.status(400).json({
        status: 400,
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
      status: 200,
      msg: "Support ticket created successfully",
     
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
      status: 200,
      msg: "Support ticket list fetched successfully",
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
        status: 200,
        msg: "No data found",
        data: {
          bank: [],
          upi: []
        },
        error: []
      });
    }

    return res.status(200).json({
      status: 200,
      msg: "Data fetched successfully",
      data: {
        bank: maskedBank,
        upi: upiRows
      }
    });

  } catch (error) {
    return res.status(200).json({
      status: 200,
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
        status: 400,
        msg: "All fields are required"
      });
    }

    if (account_no !== confirm_account_no) {
      return res.status(400).json({
        status: 400,
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
      status: 200,
      msg: "Bank details added successfully"
     
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
      return res.status(400).json({ status: 400, msg: "latitude is required" });
    }

    if (!longitude) {
      return res.status(400).json({ status: 400, msg: "longitude is required" });
    }

    if (!workplace) {
      return res.status(400).json({ status: 400, msg: "workplace is required" });
    }

    if (!address) {
      return res.status(400).json({ status: 400, msg: "address is required" });
    }

    const insertSql = `
      INSERT INTO address 
      (user_id, latitude, longitude, workplace, address, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [user_id, latitude, longitude, workplace, address, type || null];

    await db.query(insertSql, values);

    return res.status(200).json({
      status: 200,
      msg: "Address added successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
        status: 400,
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
        status: 404,
        msg: "Address not found"
      });
    }

    // ✅ Dynamic fields build
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
        status: 400,
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
      status: 200,
      msg: "Address updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
      status: 200,
      msg: "Address list fetched successfully",
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
      status: 200,
      msg: "Video fetched successfully",
      data: rows[0] || null
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
        status: 400,
        msg: "Account number does not match"
      });
    }

    // ✅ check record exists
    const checkSql = `SELECT id FROM bank_details WHERE id = ? AND user_id = ?`;
    const [check] = await db.query(checkSql, [id, user_id]);

    if (check.length === 0) {
      return res.status(404).json({
        status: 404,
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
      status: 200,
      msg: "Bank details updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
        status: 400,
        msg: "All fields are required"
      });
    }

    const upiRegex = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;
    if (!upiRegex.test(upi_id)) {
      return res.status(400).json({
        status: 400,
        msg: "Invalid UPI ID"
      });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(upi_no)) {
      return res.status(400).json({
        status: 400,
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
      status: 200,
      msg: "UPI added successfully"
      
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
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
        status: 200,
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

            if (raw.includes('][')) {
              raw = raw.replace(/\]\s*\[/g, ',');
            }

            parsedAttributes = JSON.parse(raw);
          } else if (Array.isArray(raw)) {
            parsedAttributes = raw;
          }

          if (Array.isArray(parsedAttributes)) {
            parsedAttributes = Array.from(
              new Map(parsedAttributes.map(item => [item.id, item])).values()
            );
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
      status: 200,
      msg: "Favorite products fetched successfully",
      data: formattedRows
    });

  } catch (error) {
    console.error("Error fetching favorite products:", error);

    return res.status(500).json({
      status: 500,
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
        status: 404,
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
      status: 200,
      msg: "UPI updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});


router.post('/AddCart', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity, productattribute_id, sub_categorise } = req.body;

    // ✅ Validation
    if (!product_id || !quantity) {
      return res.status(400).json({
        status: 400,
        msg: "product_id and quantity are required"
      });
    }

    // ✅ Get product vendor info
    const [productRows] = await db.query(
      `SELECT vendor_id, discounted_price FROM products WHERE id = ?`,
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(200).json({
        status: 200,
        msg: "Invalid Product ID"
      });
    }

    const vendorId = productRows[0].vendor_id;
    const discountedPrice = productRows[0].discounted_price;
    const totalPrice = discountedPrice * quantity;

    // ✅ ONE VENDOR CHECK
    const [existingVendorCart] = await db.query(
      `SELECT * FROM cart WHERE user_id = ? AND status = 0 LIMIT 1`,
      [user_id]
    );

    if (
      existingVendorCart.length > 0 &&
      existingVendorCart[0].vendor_id != vendorId
    ) {
      return res.status(200).json({
        status: 200,
        success: false,
        msg: "Your cart contains items from another shop, Please clear your cart first"
      });
    }

    // ✅ Check existing cart item
    const [existingCart] = await db.query(
      `SELECT * FROM cart 
       WHERE user_id = ? AND product_id = ? AND productattribute_id = ? AND status = 0 
       LIMIT 1`,
      [user_id, product_id, productattribute_id || 0]
    );

    // ✅ If exists → update
    if (existingCart.length > 0) {
      const cartItem = existingCart[0];

      await db.query(
        `UPDATE cart 
         SET quantity = ?, price = ?, vendor_id = ?, productattribute_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          cartItem.quantity + quantity,
          cartItem.price + totalPrice,
          vendorId,
          productattribute_id || 0,
          cartItem.id
        ]
      );

      const [updatedCart] = await db.query(
        `SELECT * FROM cart WHERE id = ?`,
        [cartItem.id]
      );

      return res.status(200).json({
        status: 200,
        success: true,
        msg: "Added Successfully",
        result: updatedCart[0]
      });
    }

    // ✅ Insert new cart item
    const [insertResult] = await db.query(
      `INSERT INTO cart 
      (user_id, product_id, vendor_id, quantity, price, sub_categorise, productattribute_id, created_at, updated_at, status, isLatestFav)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, 1)`,
      [
        user_id,
        product_id,
        vendorId,
        quantity,
        totalPrice,
        sub_categorise || null,
        productattribute_id || 0
      ]
    );

    const [newCart] = await db.query(
      `SELECT * FROM cart WHERE id = ?`,
      [insertResult.insertId]
    );

    return res.status(200).json({
      status: 200,
      success: true,
      msg: "Added Successfully",
      result: newCart[0]
    });

  } catch (error) {
    console.error("AddCart Error:", error);

    return res.status(500).json({
      status: 500,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});



router.post('/settings', async (req, res) => {
    try {

        const { type } = req.body;

        if (!type) {
            return res.status(400).json({
                status: 400,
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
                status: 404,
                msg: "No setting found"
            });
        }

        res.status(200).json({
            status: 200,
            msg: "Settings fetched successfully",
            data: rows[0]
        });

    } catch (error) {

        console.error("Error fetching settings:", error);

        res.status(500).json({
            status: 500,
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
                // status: 404,
                // msg: "No products found",
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

                        // Agar multiple array aise aa rahe ho: [..][..]
                        if (raw.includes('][')) {
                            raw = raw.replace(/\]\s*\[/g, ',');
                        }

                        parsedAttributes = JSON.parse(raw);
                    } else if (Array.isArray(raw)) {
                        parsedAttributes = raw;
                    }

                    // duplicate remove by id
                    if (Array.isArray(parsedAttributes)) {
                        parsedAttributes = Array.from(
                            new Map(
                                parsedAttributes.map(item => [item.id, item])
                            ).values()
                        );
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

router.post('/popularproducts', async (req, res) => {
  try {
    const { sub_category_id, limit, offset } = req.body;

    // ✅ Default values
    let finalLimit = parseInt(limit) || 20;
    let finalOffset = parseInt(offset) || 0;

    // ✅ Safety
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

    // ✅ Optional filter
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
        status: 200,
        msg: "No popular products found",
        data: []
      });
    }

    // ✅ Product Attribute Parse
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
            parsedAttributes = Array.from(
              new Map(parsedAttributes.map(item => [item.id, item])).values()
            );
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
      status: 200,
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
      status: 500,
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

    return res.status(200).json({
      status: 200,
      msg: "Top rated products fetched successfully",
      data: rows,
      pagination: {
        limit,
        offset
      }
    });

  } catch (error) {
    console.error("Error fetching top rated products:", error);

    return res.status(500).json({
      status: 500,
      msg: "Internal Server Error",
      error: error.message
    });
  }
});

router.put('/profileupdate/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { 
            name, 
            email, 
            business_name, 
            upload_shop_logo, 
            shop_doc 
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: 400,
                msg: "User ID is required"
            });
        }


        const [userExists] = await db.query(
            "SELECT id FROM users WHERE id = ?", 
            [userId]
        );

        if (userExists.length === 0) {
            return res.status(404).json({
                status: 404,
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
            // Check if email already exists for another user
            const [emailCheck] = await db.query(
                "SELECT id FROM users WHERE email = ? AND id != ?", 
                [email, userId]
            );
            if (emailCheck.length > 0) {
                return res.status(409).json({
                    status: 409,
                    msg: "Email already registered to another user"
                });
            }
            updateFields.push("email = ?");
            updateValues.push(email);
        }
        if (business_name) {
            updateFields.push("business_name = ?");
            updateValues.push(business_name);
        }
        if (upload_shop_logo) {
            // Handle new logo upload
            try {
                const logoFilename = `shop_logo_${Date.now()}.jpg`;
                const logoUrl = await saveBase64Image(upload_shop_logo, 'shop_logos', logoFilename);
                updateFields.push("upload_shop_logo = ?");
                updateValues.push(logoUrl);
            } catch (logoError) {
                return res.status(400).json({
                    status: 400,
                    msg: "Invalid shop logo format"
                });
            }
        }
        if (shop_doc) {
            // Handle new document upload
            try {
                const docFilename = `shop_doc_${Date.now()}.jpg`;
                const docUrl = await saveBase64Image(shop_doc, 'shop_docs', docFilename);
                updateFields.push("shop_doc = ?");
                updateValues.push(docUrl);
            } catch (docError) {
                return res.status(400).json({
                    status: 400,
                    msg: "Invalid shop document format"
                });
            }
        }

        // If no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({
                status: 400,
                msg: "No fields to update"
            });
        }

        // Add user ID to values array
        updateValues.push(userId);

        // Execute update query
        const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.query(updateSql, updateValues);

        // Fetch updated user data
        const [updatedUser] = await db.query(
            "SELECT id, name, mobile, email, business_name, upload_shop_logo, shop_doc, created_at FROM users WHERE id = ?",
            [userId]
        );

        res.status(200).json({
            status: 200,
            msg: "Profile updated successfully",
            data: updatedUser[0]
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            status: 500,
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
                status: 400,
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
                status: 404,
                msg: "User not found"
            });
        }

        // Delete user
        await db.query("DELETE FROM users WHERE id = ?", [userId]);

        res.status(200).json({
            status: 200,
            msg: "Profile deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting profile:", error);
        res.status(500).json({
            status: 500,
            msg: "Internal Server Error",
            error: error.message
        });
    }
});

module.exports = router;