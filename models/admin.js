
const db = require("../db"); // correct path




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