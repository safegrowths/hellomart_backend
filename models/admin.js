
const db = require("../db"); // correct path



const all_subcategory_list = async (search, status, limit, offset) => {
    let sql = `
        SELECT sc.id, sc.title, sc.image, sc.categorise_id, sc.status,
               sc.created_at, c.title as category_name
        FROM sub_categorise sc
        LEFT JOIN categorise c ON sc.categorise_id = c.id
        WHERE sc.title LIKE ?
    `;

    let params = [`%${search}%`];

    if (status !== 'all') {
        sql += ` AND sc.status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY sc.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    return rows;
};
const subcategory_count = async (search, status) => {
    let sql = `SELECT COUNT(*) as total FROM sub_categorise WHERE title LIKE ?`;
    let params = [`%${search}%`];

    if (status !== 'all') {
        sql += ` AND status = ?`;
        params.push(status);
    }

    const [[{ total }]] = await db.query(sql, params);
    return total;
};

async function getCount(table, condition = {}, operator = 'AND') {
    try {
        let where = [];
        let values = [];

        for (let key in condition) {

            // 👇 TODAY condition
            if (condition[key] === 'TODAY') {
                where.push(`${key} >= CURDATE() AND ${key} < CURDATE() + INTERVAL 1 DAY`);
            } else {
                where.push(`${key} = ?`);
                values.push(condition[key]);
            }
        }

        const whereClause = where.length ? where.join(` ${operator} `) : '1=1';
        const sql = `SELECT COUNT(*) AS total FROM ${table} WHERE ${whereClause}`;

        console.log(sql, values);

        const [rows] = await db.query(sql, values);
        return rows[0]?.total || 0;

    } catch (err) {
        console.error(err);
        return 0;
    }
}



async function all_banner_list(search,limit,offset) {
    try {
        console.log("hi")
        // const [rows] = await db.query(
        //     "SELECT banner.* FROM banner WHERE banner.name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
        //     [`%${search}%`,limit, offset]
        // );
        const [rows] = await db.query(
            "SELECT * FROM banner;"
        );
        
        return rows;
    } catch (err) {
        throw new Error(err.message);
    }
}


module.exports = {all_banner_list};