const moment = require('moment');

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function my_upcoming_matches(req, userid,gameid) {
  try {
      sql=`SELECT matches.*,series.name AS seriesname,match_type.slug AS matchtype,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,
t1.name AS hometeam_name,t2.name AS visitorteam_name,t1.image AS hometeam_image,t2.image AS visitorteam_image,t1.slug AS hometeam_short_name,t2.slug AS visitorteam_short_name,CONCAT('MEGA ₹ ','4.5 lakh') AS megaContest FROM my_matches 
LEFT JOIN matches ON matches.id=my_matches.match_id
LEFT JOIN series ON series.id=matches.series_id
LEFT JOIN match_type ON match_type.id=matches.matchtype_id
LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id
LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id
WHERE my_matches.userid=${userid} AND matches.game_id=${gameid} AND matches.start_date > NOW() AND matches.status=1`;
    
console.log("=====================================My upcoming Matches===========================================================");
console.log(sql)
console.log("=====================================My upcoming Matches===========================================================");
const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function upcoming_matches(req, gameid) {
  try {
    const [rows] = await req.db.query(`SELECT matches.*,CASE WHEN series.name IS NULL THEN matches.round ELSE series.name END AS seriesname,match_type.slug AS matchtype,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,
t1.name AS hometeam_name,t2.name AS visitorteam_name,t1.image AS hometeam_image,t2.image AS visitorteam_image,t1.slug AS hometeam_short_name,t2.slug AS visitorteam_short_name,CONCAT('MEGA ₹ ','4.5 lakh') AS megaContest FROM matches 
LEFT JOIN series ON series.id=matches.series_id
LEFT JOIN match_type ON match_type.id=matches.matchtype_id
LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id
LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id
WHERE matches.game_id='${gameid}' AND matches.start_date > NOW() AND matches.status=1 AND EXISTS(SELECT players_by_series.*,players.name AS playername,players.image AS player_image,designation.id AS designation_id,designation.short_term AS designation_name,teams.name AS teamname,teams.slug AS teamshortname,players.sportsmonk_pid,match_player.is_playing AS playigstatus FROM players_by_series LEFT JOIN players ON players.id=players_by_series.pid LEFT JOIN designation ON designation.id=players.designationid LEFT JOIN teams ON teams.id=players_by_series.teamid LEFT JOIN match_player ON match_player.playerid=players_by_series.pid WHERE players_by_series.third_party_season_id=matches.third_party_season_id AND players_by_series.teamid IN (JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')),JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]'))) AND players.gameid='${gameid}' AND match_player.matchid=matches.id) ORDER BY start_date ASC`);


    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function my_live_matches(req, userid,gameid) {
  try {
    const [rows] = await req.db.query(`SELECT matches.*,CASE WHEN series.name IS NULL THEN matches.round ELSE series.name END AS seriesname,match_type.slug AS matchtype,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,
t1.name AS hometeam_name,t2.name AS visitorteam_name,t1.image AS hometeam_image,t2.image AS visitorteam_image,t1.slug AS hometeam_short_name,t2.slug AS visitorteam_short_name,CONCAT('MEGA ₹ ','4.5 lakh') AS megaContest  FROM my_matches 
LEFT JOIN matches ON matches.id=my_matches.match_id
LEFT JOIN series ON series.id=matches.series_id
LEFT JOIN match_type ON match_type.id=matches.matchtype_id
LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id
LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id
WHERE my_matches.userid=${userid} AND matches.game_id=${gameid} AND matches.start_date < NOW() AND matches.status=2`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function my_complete_matches(req, userid,gameid) {
  try {
    const [rows] = await req.db.query(`SELECT matches.*,CASE WHEN series.name IS NULL THEN matches.round ELSE series.name END AS seriesname,match_type.slug AS matchtype,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,
t1.name AS hometeam_name,t2.name AS visitorteam_name,t1.image AS hometeam_image,t2.image AS visitorteam_image,t1.slug AS hometeam_short_name,t2.slug AS visitorteam_short_name,CONCAT('MEGA ₹ ','4.5 lakh') AS megaContest FROM my_matches 
LEFT JOIN matches ON matches.id=my_matches.match_id
LEFT JOIN series ON series.id=matches.series_id
LEFT JOIN match_type ON match_type.id=matches.matchtype_id
LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id
LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id
WHERE my_matches.userid=${userid} AND matches.game_id=${gameid} AND matches.start_date < NOW() AND matches.status=3 ORDER BY start_date DESC`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function send_otp(req,otp,mobile) {
  try {
    const [rows] = await req.db.query(`UPDATE users SET otp='${otp}' WHERE mobile='${mobile}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function verify_otp(req,otp,mobile) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM users WHERE otp='${otp}' && mobile='${mobile}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function exist_user(req, identifier) {
  try {
    const [rows] = await req.db.query(
      `SELECT * FROM users WHERE status='1' AND roleid='2' AND (mobile = ? OR email = ?)`,
      [identifier, identifier]
    );
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function exist_doctor(req,mobile) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM users WHERE roleid='3' && mobile='${mobile}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function career_image(req, name, dob, pdfPath, postname,mobile) {
  try {
    const sql = `
      INSERT INTO career (name, dob, pdf, postname, status, created_at,mobile)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, dob, pdfPath, postname, 1, new Date(), mobile];
    const [result] = await req.db.query(sql, values);
    return result.insertId;
  } catch (err) {
    console.error("DB Insert Error:", err);
    throw new Error('Database Error: ' + err.message);
  }
}


async function exist_cupon(req,cupon) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM user_details WHERE Invitation_code='${cupon}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function exist_mobile(req,mobile) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM users WHERE mobile='${mobile}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_profile(req,userid) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM users WHERE id='${userid}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_slot(req,doctor_id) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM slots WHERE doctor_id='${doctor_id}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_bank(req, userid) {
  try {
    const query = `
      SELECT 
        id, 
        account_no, 
        holder_name, 
        ifsc_code, 
        branch_name 
      FROM users 
      WHERE id = ?`;
    const [rows] = await req.db.query(query, [userid]);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_profilee(req,id) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM users WHERE id='${id}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function update_profile(req,userid,email,name,Qualification,Exp,fees,specialties,about,gender,age,proofImageUrl,profession,sub_specialties,problem_check) {
  try {
    if(name)
    {
        console.log(`UPDATE users SET name='${name}' WHERE id='${userid}'`);
        const [rows] = await req.db.query(`UPDATE users SET name='${name}' WHERE id='${userid}'`);
    }
    if(sub_specialties)
    {
        console.log(`UPDATE users SET sub_specialties='${sub_specialties}' WHERE id='${userid}'`);
        const [rows] = await req.db.query(`UPDATE users SET sub_specialties='${sub_specialties}' WHERE id='${userid}'`);
    }
	if(problem_check)
    {
        console.log(`UPDATE users SET problem_check='${problem_check}' WHERE id='${userid}'`);
        const [rows] = await req.db.query(`UPDATE users SET problem_check='${problem_check}' WHERE id='${userid}'`);
    }  
	if(age)
    {
        console.log(`UPDATE users SET age='${age}' WHERE id='${userid}'`);
        const [rows] = await req.db.query(`UPDATE users SET age='${age}' WHERE id='${userid}'`);
    }  
    if(email)
    {
        const [rows] = await req.db.query(`UPDATE users SET email='${email}' WHERE id='${userid}'`);
    }
    if(gender)
    {
        const [rows] = await req.db.query(`UPDATE users SET gender='${gender}' WHERE id='${userid}'`);
    }
    if(Qualification)
    {
        const [rows] = await req.db.query(`UPDATE users SET Qualification='${Qualification}' WHERE id='${userid}'`);
    }
    if(Exp)
    {
        const [rows] = await req.db.query(`UPDATE users SET Exp='${Exp}' WHERE id='${userid}'`);
    }
    if(fees)
    {
        const [rows] = await req.db.query(`UPDATE users SET fees='${fees}' WHERE id='${userid}'`);
    }
    if(specialties)
    {
        const [rows] = await req.db.query(`UPDATE users SET specialties='${specialties}' WHERE id='${userid}'`);
    }
    if(about)
    {
        const [rows] = await req.db.query(`UPDATE users SET about='${about}' WHERE id='${userid}'`);
    }
    if(profession)
    {
        const [rows] = await req.db.query(`UPDATE users SET profession='${profession}' WHERE id='${userid}'`);
    }
    if(proofImageUrl)
    {
        const [rows] = await req.db.query(`UPDATE users SET image='${proofImageUrl}' WHERE id='${userid}'`);
    }
    
  } catch (err) {
    throw new Error(err.message);
  }
}

async function update_profile_bank(req,doctor_id,account_no,holder_name,branch_name,ifsc_code) {
  try {
    if(account_no)
    {
        console.log(`UPDATE users SET account_no='${account_no}' WHERE id='${doctor_id}'`);
        const [rows] = await req.db.query(`UPDATE users SET account_no='${account_no}' WHERE id='${doctor_id}'`);
    }
    if(holder_name)
    {
        console.log(`UPDATE users SET holder_name='${holder_name}' WHERE id='${doctor_id}'`);
        const [rows] = await req.db.query(`UPDATE users SET holder_name='${holder_name}' WHERE id='${doctor_id}'`);
    }
    if(ifsc_code)
    {
        const [rows] = await req.db.query(`UPDATE users SET ifsc_code='${ifsc_code}' WHERE id='${doctor_id}'`);
    }
    if(branch_name)
    {
        const [rows] = await req.db.query(`UPDATE users SET branch_name='${branch_name}' WHERE id='${doctor_id}'`);
    }
    
  } catch (err) {
    throw new Error(err.message);
  }
}
// async function update_profile_bank(req, doctor_id, account_no, holder_name, branch_name, ifsc_code) {
//     try {
//         // Check if record exists
//         const [existing] = await req.db.query(`SELECT * FROM bank_details WHERE doctor_id = ?`, [doctor_id]);

//         if (existing.length === 0) {
//             // INSERT new record if not exists
//             await req.db.query(
//                 `INSERT INTO bank_details (doctor_id, account_no, holder_name, branch_name, ifsc_code)
//                 VALUES (?, ?, ?, ?, ?)`,
//                 [doctor_id, account_no, holder_name, branch_name, ifsc_code]
//             );
//             return { success: true, message: "Record inserted successfully" };
//         } else {
//             // UPDATE existing record
//             const fieldsToUpdate = [];
//             const values = [];

//             if (account_no) {
//                 fieldsToUpdate.push(`account_no = ?`);
//                 values.push(account_no);
//             }
//             if (holder_name) {
//                 fieldsToUpdate.push(`holder_name = ?`);
//                 values.push(holder_name);
//             }
//             if (branch_name) {
//                 fieldsToUpdate.push(`branch_name = ?`);
//                 values.push(branch_name);
//             }
//             if (ifsc_code) {
//                 fieldsToUpdate.push(`ifsc_code = ?`);
//                 values.push(ifsc_code);
//             }

//             if (fieldsToUpdate.length > 0) {
//                 const query = `UPDATE bank_details SET ${fieldsToUpdate.join(", ")} WHERE doctor_id = ?`;
//                 values.push(doctor_id);

//                 await req.db.query(query, values);
//                 return { success: true, message: "Record updated successfully" };
//             } else {
//                 return { success: false, message: "No fields provided for update" };
//             }
//         }
//     } catch (err) {
//         throw new Error(err.message);
//     }
// }

async function update_doc_status(req,userid,status) {
  try {
    if(status)
    {
        console.log(`UPDATE users SET status='${status}' WHERE id='${userid}'`);
        const [rows] = await req.db.query(`UPDATE users SET status='${status}' WHERE id='${userid}'`);
    }
    
  } catch (err) {
    throw new Error(err.message);
  }
}

async function appointmentt_date(req, doc_id, appointment_date,appointmentid) {
  try {
    if (appointment_date) {
      const sql = `UPDATE appointment SET appointment_date = ? ,status = 5 WHERE doc_id = ? and id =?`;
      const params = [appointment_date, doc_id ,appointmentid];

      console.log('SQL Query:', sql);
      console.log('Parameters:', params);

      const [rows] = await req.db.query(sql, params);
      return rows;
    } else {
      throw new Error("Status is required to update the appointment.");
    }
  } catch (err) {
    console.error('Error in appointmentt_date:', err.message);
    throw new Error(err.message);
  }
}

async function appointment_status(req, doc_id, status,appointmentid) {
  try {
    if (status) {
      const sql = `UPDATE appointment SET status = ? WHERE doc_id = ? and id =?`;
      const params = [status, doc_id ,appointmentid];

      console.log('SQL Query:', sql);
      console.log('Parameters:', params);

      const [rows] = await req.db.query(sql, params);
      return rows;
    } else {
      throw new Error("Status is required to update the appointment.");
    }
  } catch (err) {
    console.error('Error in appointment_status:', err.message);
    throw new Error(err.message);
  }
}

async function appointment_status_user(req, user_id, status,appointmentid) {
  try {
    if (status) {
      const sql = `UPDATE appointment SET status = ? WHERE user_id = ? and id =?`;
      const params = [status, user_id ,appointmentid];

      console.log('SQL Query:', sql);
      console.log('Parameters:', params);

      const [rows] = await req.db.query(sql, params);
      return rows;
    } else {
      throw new Error("Status is required to update the appointment.");
    }
  } catch (err) {
    console.error('Error in appointment_status_user:', err.message);
    throw new Error(err.message);
  }
}

async function signup_transactions(req,userid) {
  try {
      sql=`INSERT INTO transactions(userid, amount, type, sub_type, status) VALUES ('${userid}',(SELECT value FROM settings WHERE name='Signup Bonus' && status='1'),(SELECT id FROM transaction_type WHERE name='others'),(SELECT id FROM transaction_type WHERE name='Signup Bonus'),'1')`;
      console.log(sql)
        const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function referal_transactions(req,userid,refered_by) {
  try {
      if(refered_by!='0')
      {
      sql=`INSERT INTO transactions(userid, amount, type, sub_type, status) VALUES ('${userid}',(SELECT value FROM settings WHERE name='Invitation Bonus' && status='1'),(SELECT id FROM transaction_type WHERE name='others'),(SELECT id FROM transaction_type WHERE name='Invitation Bonus'),'1')`;
      console.log("=====================================Invitation Bonus Insert====================================================")
      console.log(sql)
      console.log("=====================================Invitation Bonus Insert====================================================")
        const [rows] = await req.db.query(sql);
        
        sql4=`INSERT INTO transactions(userid, amount, type, sub_type, status) VALUES ('${refered_by}',(SELECT value FROM settings WHERE name='Referel Bonus' && status='1'),(SELECT id FROM transaction_type WHERE name='others'),(SELECT id FROM transaction_type WHERE name='Referal Bonus'),'1')`;
         
        console.log("=====================================Referal Bonus Insert====================================================")
      console.log(sql4)
      console.log("=====================================Referal Bonus Insert====================================================")
        const [rows4] = await req.db.query(sql4);
        
        sql2=`UPDATE user_details SET wallet=wallet+(SELECT value FROM settings WHERE name='Invitation Bonus' && status='1'),bonus_wallet=bonus_wallet+(SELECT value FROM settings WHERE name='Invitation Bonus' && status='1') WHERE user_id='${userid}'`;
      console.log("=====================================Invitation Bonus Update====================================================")
      console.log(sql2)
      console.log("=====================================Invitation Bonus Update====================================================")
      const [rows2] = await req.db.query(sql2);
      
      sql3=`UPDATE user_details SET wallet=wallet+(SELECT value FROM settings WHERE name='Referel Bonus' && status='1'),bonus_wallet=bonus_wallet+(SELECT value FROM settings WHERE name='Referel Bonus' && status='1') WHERE user_id='${refered_by}'`;
      console.log("=====================================Referal Bonus Update====================================================")
      console.log(sql3)
      console.log("=====================================Referal Bonus Update====================================================")
        const [rows3] = await req.db.query(sql3);
    return rows2;
      }
      else
      {
          return 1;
      }
  } catch (err) {
    throw new Error(err.message);
  }
}

async function update_profile_image(req, userid, proof_id, medical_degree) {
  try {
    console.log(`UPDATE users SET proof_id=?,documentstatus=1, medical_degree=? WHERE id=?`);
    const [rows] = await req.db.query('UPDATE users SET proof_id=?, documentstatus=1,medical_degree=? WHERE id=?', [proof_id, medical_degree, userid]);
  } catch (err) {
    throw new Error(err.message);
  }
}


async function update_users_dac(req,userid,type,doc_number,doc_images) {
    try {
   
        const update_doc= await req.db.query(`INSERT INTO doc_verification(userid, type, document_number, doc_image) VALUES ('${userid}','${type}','${doc_number}','${doc_images}')`);
        
        const update_docs= await req.db.query(`UPDATE users SET is_verify='1' WHERE id='${userid}'`);
    
  } catch (err) {
    throw new Error(err.message);
  }
}

async function min_amount(req) {
  try {
    const [rows] = await req.db.query(`SELECT value FROM settings WHERE name='Min Amount' && status='1'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function add_wallet(req,userid,amount) {
  try {
      sql=`UPDATE users SET wallet=wallet+${amount} WHERE id='${userid}'`;
      console.log(sql)
        const [rows] = await req.db.query(sql);
        
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_transaction_type(req) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM transaction_type WHERE status='1'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_experts(req, therapy_id) {
  try {
    const query = `
      SELECT experts.*, users.name, users.image 
      FROM experts 
      INNER JOIN users ON experts.doctor_id = users.id
      WHERE experts.therapy_id = ?`;
    const [rows] = await req.db.query(query, [therapy_id]);
    return rows;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
}
async function all_experts(req) {
  try {
    const query = `
      SELECT experts.*, users.name, users.image 
      FROM experts 
      INNER JOIN users ON experts.doctor_id = users.id
      WHERE 1`; // Fetch all records

    const [rows] = await req.db.query(query); // Execute query
    return rows;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
}

async function all_therapies(req) {
  try {
    // Properly formatted SQL query
    const query = "SELECT * FROM `therapies`"; // Use double quotes for JavaScript string and backticks for SQL

    // Execute the query
    const [rows] = await req.db.query(query);
    
    // Return the fetched rows
    return rows;
  } catch (err) {
    // Handle errors gracefully
    throw new Error(`Database query failed: ${err.message}`);
  }
}
async function all_news(req) {
  try {
    // Properly formatted SQL query
    const query = "SELECT * FROM `reviews`"; // Use double quotes for JavaScript string and backticks for SQL

    // Execute the query
    const [rows] = await req.db.query(query);
    
    // Return the fetched rows
    return rows;
  } catch (err) {
    // Handle errors gracefully
    throw new Error(`Database query failed: ${err.message}`);
  }
}
async function all_banners(req) {
  try {
    // Properly formatted SQL query
    const query = "SELECT * FROM `banners`"; // Use double quotes for JavaScript string and backticks for SQL

    // Execute the query
    const [rows] = await req.db.query(query);
    
    // Return the fetched rows
    return rows;
  } catch (err) {
    // Handle errors gracefully
    throw new Error(`Database query failed: ${err.message}`);
  }
}
async function wellbeingservices(req) {
  try {
    // Properly formatted SQL query
    const query = "SELECT * FROM `wellbeing_services`"; // Use double quotes for JavaScript string and backticks for SQL

    // Execute the query
    const [rows] = await req.db.query(query);
    
    // Return the fetched rows
    return rows;
  } catch (err) {
    // Handle errors gracefully
    throw new Error(`Database query failed: ${err.message}`);
  }
}
async function all_offer(req) {
  try {
    // Properly formatted SQL query
    const query = "SELECT * FROM `offer`"; // Use double quotes for JavaScript string and backticks for SQL

    // Execute the query
    const [rows] = await req.db.query(query);
    
    // Return the fetched rows
    return rows;
  } catch (err) {
    // Handle errors gracefully
    throw new Error(`Database query failed: ${err.message}`);
  }
}
async function prescription_list(req, appointment_id) {
  try {
    const query = "SELECT prescription_doctor.*, users.Qualification, users.name AS docName, users.image, users.reg_number AS regNo FROM prescription_doctor JOIN users ON users.id = prescription_doctor.doctor_id WHERE prescription_doctor.appointment_id = ?";
    const [rows] = await req.db.query(query, [appointment_id]);
    return rows;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
}

async function all_pricing(req) {
  try {
    // Properly formatted SQL query
    const query = "SELECT * FROM `pricing`"; // Use double quotes for JavaScript string and backticks for SQL

    // Execute the query
    const [rows] = await req.db.query(query);
    
    // Return the fetched rows
    return rows;
  } catch (err) {
    // Handle errors gracefully
    throw new Error(`Database query failed: ${err.message}`);
  }
}




async function get_transaction(req,userid) {
  try {
    const [rows] = await req.db.query(`SELECT transactions.*,matches.name AS matchname,transaction_type.name AS transaction_type,tp.symbols,tp.name AS transaction_subtype FROM transactions LEFT JOIN matches ON matches.id=transactions.match_id LEFT JOIN transaction_type ON transaction_type.id=transactions.type LEFT JOIN transaction_type tp ON tp.id=transactions.sub_type WHERE userid='${userid}' AND transactions.status='1' ORDER BY CAST(transactions.updated_at AS DATETIME) DESC`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_games(req) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM games WHERE status='1'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function match_status(req) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM match_status WHERE status='1'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function contest_list(req,matchid,gameid,userid) {
  try {
    const [rows] = await req.db.query(`SELECT contests.*,contest_details.prize_pool,contest_details.entry_fee,contest_details.total_spot,contest_details.entry_limit AS entry_count,
            CASE
                WHEN contest_details.success_type='1' THEN 'Guranteed'
                WHEN contest_details.success_type='2' THEN 'Flexible'
                ELSE ''
            END AS contest_success_type,
            JSON_UNQUOTE(JSON_EXTRACT(contest_winnings.winning_details, '$[0].prize')) AS first_prize,
            CASE
                WHEN contest_details.entry_limit=1 THEN 'Single'
                ELSE CONCAT('Upto ',contest_details.entry_limit)
            END AS entry_limit,(contest_details.total_spot-(SELECT count(*) FROM my_contest WHERE my_match_id IN(SELECT id FROM my_matches WHERE match_id='${matchid}') AND contest_id = contests.id)) AS left_spot,(SELECT count(*) FROM my_contest WHERE my_match_id IN(SELECT id FROM my_matches WHERE match_id='${matchid}') AND contest_id = contests.id AND my_contest.user_id='${userid}') AS my_joined_count,contest_details.entry_limit AS entry
            
            FROM contests LEFT JOIN contest_details ON contest_details.contest_id=contests.id LEFT JOIN contest_winnings ON contest_winnings.contest_id=contests.id WHERE game_id='${gameid}' AND (contests.match_id = '${matchid}' OR contests.match_id IS NULL) AND contests.status=1`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function mycontest_list(req,userid,gameid,matchid) {
  try {
            
        query=`SELECT my_contest.*,contests.name,contests.type,contest_details.entry_fee,contest_details.total_spot,contest_details.entry_limit AS entry_count,contest_details.prize_pool,
                CASE 
                    WHEN contest_details.success_type='1' THEN 'Guranteed' 
                    WHEN contest_details.success_type='2' THEN 'Flexible' 
                    ELSE 'None'
                END AS contest_success_type,
                JSON_UNQUOTE(JSON_EXTRACT(contest_winnings.winning_details, '$[0].prize')) AS first_prize, 
                CASE 
                    WHEN contest_details.entry_limit=1 THEN 'Single' 
                    ELSE CONCAT('Upto ',contest_details.entry_limit) 
                END AS entry_limit,
                (contest_details.total_spot-(SELECT count(*) FROM my_contest WHERE my_match_id IN(SELECT id FROM my_matches WHERE match_id='${matchid}') AND contest_id = contests.id)) AS left_spot,
                count(*) AS num_of_joined_team,GROUP_CONCAT(team_name SEPARATOR ', ') AS team_names,GROUP_CONCAT(my_contest.my_teamid SEPARATOR ',') AS my_team_id,matches.status AS matchstatus 
                FROM my_contest 
                LEFT JOIN my_matches ON my_matches.id=my_contest.my_match_id 
                LEFT JOIN contests ON contests.id=my_contest.contest_id 
                LEFT JOIN contest_details ON contest_details.contest_id=contests.id
                LEFT JOIN contest_winnings ON contest_winnings.contest_id=contests.id 
                LEFT JOIN my_team ON my_team.id=my_contest.my_teamid 
                LEFT JOIN matches ON matches.id=my_matches.match_id 
                WHERE user_id='${userid}' AND my_matches.match_id='${matchid}' AND my_contest.gameid='${gameid}' GROUP BY my_contest.contest_id`;
    console.log(query);
    const [rows] = await req.db.query(query);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function contest_winning(req,contestid,matchid,userid) {
  try {
      query=`SELECT contests.*,contest_details.prize_pool,contest_details.entry_fee,contest_details.total_spot,contest_details.entry_limit AS entry,
            CASE
                WHEN contest_details.success_type='1' THEN 'Guranteed'
                WHEN contest_details.success_type='2' THEN 'Flexible'
                ELSE ''
            END AS contest_success_type,contest_winnings.winning_details,
            CASE
                WHEN contest_details.entry_limit=1 THEN 'Single'
                ELSE CONCAT('Upto ',contest_details.entry_limit)
            END AS entry_limit,(contest_details.total_spot-(SELECT count(*) FROM my_contest WHERE my_match_id IN(SELECT id FROM my_matches WHERE match_id='${matchid}') AND contest_id = contests.id)) AS left_spot,(SELECT count(*) FROM my_contest WHERE my_match_id IN(SELECT id FROM my_matches WHERE match_id='${matchid}') AND contest_id = contests.id AND my_contest.user_id='${userid}') AS my_joined_count
            FROM contests 
            LEFT JOIN contest_details ON contest_details.contest_id=contests.id 
            LEFT JOIN contest_winnings ON contest_winnings.contest_id=contests.id WHERE contest_winnings.contest_id='${contestid}' AND contests.status=1`;
    const [rows] = await req.db.query(query);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function match_details_byid(req,matchid) {
  try {
    const [rows] = await req.db.query(`SELECT matches.*,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,t1.slug AS hometeam_name,t2.slug AS visitorteam_name FROM matches LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id
LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id WHERE matches.id='${matchid}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function contest_filter(req) {
  try {
    const [rows] = await req.db.query(`SELECT *  FROM contest_filter WHERE Status=1`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_banner(req,type) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM banners WHERE status='1' AND type='${type}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function withdraw_wallet(req,userid,amount) {
  try {
      sql=`UPDATE user_details SET wallet=wallet-${amount},winning_wallet=winning_wallet-${amount} WHERE user_id='${userid}'`;
      console.log(sql)
        const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_withdraw_amount(req,userid,amount) {
  try {
      sql=`SELECT * FROM user_details WHERE winning_wallet>=${amount} AND  user_id='${userid}'`;
      console.log(sql)
        const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function min_withdrawal_amount(req) {
  try {
    const [rows] = await req.db.query(`SELECT value FROM settings WHERE name='Min Withdrawal Amount' && status='1'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function contestFilterWiseData(req,filtertype,filter_value,gameid,matchid) {
  try {
        sql=`SELECT contests.*,contest_details.prize_pool,contest_details.entry_fee,contest_details.total_spot,
            CASE
                WHEN contest_details.success_type='1' THEN 'Guranteed'
                WHEN contest_details.success_type='2' THEN 'Flexible'
                ELSE ''
            END AS contest_success_type,
            JSON_UNQUOTE(JSON_EXTRACT(contest_winnings.winning_details, '$[0].prize')) AS first_prize,
            CASE
                WHEN contest_details.entry_limit=1 THEN 'Single'
                ELSE CONCAT('Upto ',contest_details.entry_limit)
            END AS entry_limit
            FROM contests LEFT JOIN contest_details ON contest_details.contest_id=contests.id LEFT JOIN contest_winnings ON contest_winnings.contest_id=contests.id WHERE game_id='${gameid}' AND (contests.match_id = '${matchid}' OR contests.match_id IS NULL) AND contests.status=1 AND contest_details.total_spot ${filter_value}`;
            console.log(sql)
        const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_players_bySeries(req,season_id,teamid1,teamid2,gameid,matchid) {
  try {
      // AND match_player.matchid='${matchid}'
      url=`SELECT players_by_series.*,players.name AS playername,players.image AS player_image,designation.id AS designation_id,designation.short_term AS designation_name,teams.name AS teamname,teams.slug AS teamshortname,players.sportsmonk_pid,match_player.is_playing AS playigstatus,'15.00' AS c_by,'20.22' AS vc_by FROM players_by_series LEFT JOIN players ON players.id=players_by_series.pid LEFT JOIN designation ON designation.id=players.designationid LEFT JOIN teams ON teams.id=players_by_series.teamid LEFT JOIN match_player ON match_player.playerid=players_by_series.pid WHERE players_by_series.third_party_season_id='${season_id}' AND players_by_series.teamid IN(${teamid1},${teamid2}) AND players.gameid='${gameid}' AND match_player.matchid='${matchid}' `;
      console.log(url)
    const [rows] = await req.db.query(url);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function my_date_wiserefreals(req,userid,date) {
  try {
      var sql=`WITH RECURSIVE UserHierarchy AS (
    -- Base case: select users added by user with id 1
    SELECT *
    FROM users
    WHERE added_by = '${userid}'
    UNION ALL
    -- Recursive case: select users added by users found in the previous level
    SELECT u.*
    FROM users u
    INNER JOIN UserHierarchy uh ON u.added_by = uh.id
)
SELECT * FROM UserHierarchy`;
      console.log('=======================================Direct_subordinate=================================================')
      console.log(sql)
      console.log('=======================================Direct_subordinate=================================================')
    const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function direct_subordinate(req,userid,date) {
  try {
      var sql=`SELECT JSON_ARRAYAGG( JSON_OBJECT(
          'NoOfRegister', (SELECT count(*) AS counts From users WHERE added_by='${userid}' AND DATE(created_at)='${date}'),
          'DepositeNumber', (SELECT COUNT(id) AS counts FROM transactions WHERE userid IN (SELECT id FROM users  WHERE added_by='${userid}') AND DATE(created_at)='${date}' AND type='1'),
          'DepositeAmount',(SELECT SUM(amount) AS amount FROM transactions WHERE userid IN (SELECT id FROM users  WHERE added_by='${userid}') AND DATE(created_at)='${date}'  AND type='1'),
          'FirstDepositeCount',(SELECT COUNT(*) FROM (SELECT id FROM transactions WHERE userid IN (SELECT id FROM users WHERE added_by = '${userid}') AND DATE(created_at) = '${date}' AND type = '1' GROUP BY userid ORDER BY MIN(created_at)) AS first_row_per_userid)) ) AS json_result FROM users`;
      console.log('=======================================Direct_subordinate=================================================')
      console.log(sql)
      console.log('=======================================Direct_subordinate=================================================')
    const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function team_subordinate(req,userid,date) {
  try {
      var sql=`WITH RECURSIVE user_hierarchy AS (SELECT * FROM users WHERE added_by = '${userid}' UNION ALL SELECT u.* FROM users u INNER JOIN user_hierarchy uh ON u.added_by = uh.id ) SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'NoOfRegister', (SELECT COUNT(*) FROM users WHERE id IN (SELECT id FROM user_hierarchy WHERE added_by != '${userid}' AND DATE(created_at) = '${date}')),
        'DepositeNumber', (SELECT COUNT(amount) FROM transactions WHERE userid IN (SELECT id FROM user_hierarchy WHERE added_by != '${userid}') AND DATE(created_at) = '${date}' AND type = '1' ),
        'DepositeAmount', (SELECT SUM(amount) FROM transactions WHERE userid IN (SELECT id FROM user_hierarchy WHERE added_by != '${userid}') AND DATE(created_at) = '${date}' AND type = '1' ),
        'FirstDepositeCount', (SELECT COUNT(*) FROM ( SELECT id FROM transactions WHERE userid IN (SELECT id FROM user_hierarchy WHERE added_by != '${userid}' ) AND DATE(created_at) = '${date}' AND type = '1' GROUP BY userid ORDER BY MIN(created_at) ) AS first_row_per_userid ) ) ) AS json_result FROM users;`;
      console.log('=======================================team_subordinate=================================================')
      console.log(sql)
      console.log('=======================================team_subordinate=================================================')
    const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function my_refreals(req, therapy_id) {
    try {
        let sql;
        const params = [];

        // Handle '1' as a special case
        if (therapy_id === '1') {
            sql = `
                SELECT 
                    id, 
                    name, 
                    image,
					sub_specialties,
                    updated_at, 
                    Exp AS experience, 
                    specialties AS profession, 
                    therapy_id, 
                    status, 
                    profession,
                    fees 
                FROM users 
                WHERE roleid = 3`;
        } else {
           
            sql = `
                SELECT 
                    id, 
                    name, 
                    image,
					sub_specialties,
                    updated_at, 
                    Exp AS experience, 
                    specialties AS profession, 
                    therapy_id, 
                    status, 
                    profession,
                    fees 
                FROM users 
                WHERE roleid = 3 AND therapy_id = ?`;
            params.push(therapy_id);
        }

        console.log('=======================================Direct_subordinate=================================================');
        console.log('SQL Query:', sql);
        console.log('Parameters:', params);
        console.log('=======================================Direct_subordinate=================================================');

        // Execute the query with parameters to prevent SQL injection
        const [rows] = await req.db.query(sql, params);
        return rows;
    } catch (err) {
        console.error('Error executing query:', err.message);
        throw new Error('Failed to fetch referrals');
    }
}
async function get_appointment(req, doc_id) {
  try {
    const sql = `
      SELECT 
        a.*, 
        p.age AS patient_age, 
        p.image AS patient_image, 
        p.gender AS patient_gender, 
        d.fees AS doctor_fees, 
        c.meeting
      FROM appointment a
      JOIN users AS p ON p.id = a.user_id
      JOIN users AS d ON d.id = a.doc_id
      LEFT JOIN consultation c ON c.appointment_id = a.id
      WHERE a.status IN (0, 1, 2, 5, 6, 7)
        AND a.doc_id = ?
      ORDER BY a.id DESC
      LIMIT 1
    `;

    const params = [doc_id];

    console.log("Fetching appointment for doc_id:", doc_id);

    const [rows] = await req.db.query(sql, params);
    return rows;

  } catch (err) {
    console.error("Error executing query:", err.message);
    throw new Error("Failed to fetch appointments");
  }
}

async function get_week_day(req, doc_id) {
  try {
    // Step 1: Get today and next 2 dates in 'YYYY-MM-DD' format
    const today = new Date();
    const formatDate = (date) =>
      date.toISOString().split("T")[0]; // returns 'YYYY-MM-DD'

    const dates = [
      formatDate(today),
      formatDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)),
      formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000))
    ];

    const sql = `
      SELECT id, doctor_id, week_day 
      FROM slots 
      WHERE doctor_id = ? AND week_day IN (?, ?, ?)
    `;
    const params = [doc_id, ...dates];

    console.log('=======================================Dates Filter=================================================');
    console.log('SQL Query:', sql);
    console.log('Parameters:', params);
    console.log('======================================================================================================');

    const [rows] = await req.db.query(sql, params);
    return rows;
  } catch (err) {
    console.error('Error executing query:', err.message);
    throw new Error('Failed to fetch slots');
  }
}



async function users_appointment(req, user_id) {
    try {
        // Define the SQL query with a parameter placeholder
        const sql = `SELECT appointment.*, meeting.token, meeting.channelname, doctor.image AS doctor_image, doctor.name AS doctor_name, doctor.mobile AS doctor_mobile, doctor.gender AS doctor_gender, doctor.fees AS doctor_fees FROM appointment JOIN users AS patient ON patient.id = appointment.user_id JOIN users AS doctor ON doctor.id = appointment.doc_id LEFT JOIN meeting ON meeting.appointment_id = appointment.id WHERE appointment.user_id =  ? ORDER BY appointment.id DESC `;

        // Parameters for the query
        const params = [user_id];

        // Log the query and parameters for debugging
        console.log('=======================================Direct_subordinate=================================================');
        console.log('SQL Query:', sql);
        console.log('Parameters:', params);
        console.log('=======================================Direct_subordinate=================================================');

        // Execute the query using the database connection from the request object
        const [rows] = await req.db.query(sql, params);
        return rows;
    } catch (err) {
        // Log the error and throw an appropriate error message
        console.error('Error executing query:', err.message);
        throw new Error('Failed to fetch appointments');
    }
}
async function doctor_details(req, doctor_id) {
    try {
        // Proper SQL query with placeholder
        const sql = `SELECT 
            id, name, email, dob, age, image, status, reg_number, reg_year, proof_id, 
            medical_degree, Qualification, gender, Exp, medical_council, specialties, 
            about, fees, medical_council_name, therapy_id, documentstatus, account_no, 
            holder_name, ifsc_code, branch_name, profession, sessions, city, 
            sub_specialties, problem_check 
            FROM users 
            WHERE id = ?`;

        const params = [doctor_id];

        console.log('=======================================Doctor Details=================================================');
        console.log('SQL Query:', sql);
        console.log('Parameters:', params);
        console.log('==========================================================================================');

        const [rows] = await req.db.query(sql, params);
        return rows;
    } catch (err) {
        console.error('Error executing query:', err.message);
        throw new Error('Failed to fetch doctor details');
    }
}

async function filterbystatus(req, status, doc_id) {
    try {
        // Initialize the base SQL query
        let sql = `SELECT 
                        appointment.*, 
                        patient.age AS patient_age, 
                        patient.image AS patient_image, 
                        patient.gender AS patient_gender, 
                        doctor.fees AS doctor_fees 
                   FROM appointment 
                   JOIN users AS patient ON patient.id = appointment.user_id 
                   JOIN users AS doctor ON doctor.id = appointment.doc_id 
                   WHERE appointment.doc_id = ?`;

        // Array to store query parameters
        const params = [doc_id];

        // Append the condition for status if it is provided
        if (status !== 5 && status !== 5) {
            sql += ` AND appointment.status = ?`;
            params.push(status);
        }

        // Log the query and parameters for debugging
        console.log('=======================================Direct_subordinate=================================================');
        console.log('SQL Query:', sql);
        console.log('Parameters:', params);
        console.log('=======================================Direct_subordinate=================================================');

        // Execute the query using the database connection from the request object
        const [rows] = await req.db.query(sql, params);

        // Handle empty results
        if (rows.length === 0) {
            console.log('No appointments found for the given criteria.');
            return [];
        }

        // Return the rows from the query
        return rows;
    } catch (err) {
        // Log the error and throw an appropriate error message
        console.error('Error executing query:', err.message);
        throw new Error('Failed to fetch appointments');
    }
}


async function my_slots_users(req, doctor_id) {
  try {
    const sql = `
      SELECT id, doctor_id, week_day, date, status, updated_at, slots 
      FROM slots 
      WHERE doctor_id = ? 
      ORDER BY date ASC`;

    const [rows] = await req.db.query(sql, [doctor_id]);

    const formattedSlots = rows.map(row => {
      let parsedSlots = [];

      try {
        parsedSlots = row.slots ? JSON.parse(row.slots) : [];
      } catch (err) {
        console.error(`Invalid JSON for row ID ${row.id}:`, err.message);
      }

      return {
        date: row.week_day,
        slots: parsedSlots.map(slot => ({
          type: slot.title || slot.type || "",  // title preferred
          start_time: slot.start_time,
          end_time: slot.end_time,
          duration: slot.duration
        }))
      };
    });

    return formattedSlots;
  } catch (err) {
    console.error('Error executing query:', err);
    throw new Error('Failed to fetch slots');
  }
}

function formatTime(date) {
  const hrs = date.getHours().toString().padStart(2, '0');
  return `${hrs}`;
}

async function my_slots(req, doctor_id) {
  try {
    const sql = `
      SELECT 
        slots.*, 
        users.name AS doctor_name, 
        users.mobile AS doctor_mobile
      FROM 
        slots
      INNER JOIN 
        users ON users.id = slots.doctor_id
      WHERE 
        slots.doctor_id = ?`;

    const [rows] = await req.db.query(sql, [doctor_id]);

    const result = [];

    for (const row of rows) {
      let parsedSlots = [];

      try {
        parsedSlots = JSON.parse(row.slots); // Parse JSON string
      } catch (e) {
        console.error("Invalid JSON in slots field:", row.slots);
        continue; // skip this row
      }

      const generatedSlots = [];

      for (const slot of parsedSlots) {
        let [startH, startM] = slot.start_time.split(":").map(Number);
        let [endH, endM] = slot.end_time.split(":").map(Number);

        let start = new Date();
        start.setHours(startH, startM, 0, 0);
        let end = new Date();
        end.setHours(endH, endM, 0, 0);

        const duration = parseInt(slot.duration);

        while (start < end) {
          const from = formatTime(start);
          const next = new Date(start.getTime() + duration * 60000);
          const to = formatTime(next);

          if (next > end) break;

          generatedSlots.push({
            type_id: slot.type_id,
            title: slot.title,
            time: `${from} - ${to}`
          });

          start = next;
        }
      }

      // Attach generated slots to each row
      result.push({
        ...row,
        expanded_slots: generatedSlots
      });
    }

    return result;
  } catch (err) {
    console.error('Error fetching slots:', err.message);
    throw new Error('Failed to fetch slots');
  }
}


function getDaysInMonth(year, month, weekdays) {
    const result = [];

    // Map of week day names to numbers
    const daysMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };

    // Normalize input weekdays to an array of numbers
    const dayNumbers = weekdays.map(day => daysMap[day.toLowerCase()]);

    const date = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
    while (date.getMonth() === month - 1) {
        if (dayNumbers.includes(date.getDay())) {
            result.push(new Date(date)); // Add matching days to the result
        }
        date.setDate(date.getDate() + 1); // Move to the next day
    }
    return result;
}

// Example usage
const req = {
    db: {
        query: async (sql, params) => {
            // Mock DB query
            return [
                [
                    { id: 1, doctor_id: 1, week_day: 'Monday', slot_time: '10:00 AM', doctor_name: 'Dr. Smith', doctor_mobile: '1234567890' },
                    { id: 2, doctor_id: 1, week_day: 'Wednesday', slot_time: '2:00 PM', doctor_name: 'Dr. Smith', doctor_mobile: '1234567890' },
                ],
            ];
        },
    },
};
const doctor_id = 1;
const userInputYear = 2025;
const userInputMonth = 1;

my_slots(req, doctor_id, userInputYear, userInputMonth)
    .then(slots => {
        console.log('Fetched slots:', JSON.stringify(slots, null, 2));
    })
    .catch(error => {
        console.error('Error fetching slots:', error);
    });


// Function to insert prescription into DB
async function prescription(req, id, pratient_name, age, gender, time, pratient_id, doctor_id, appointment_id, status, slots_id, symptoms, medicines, note) {
  try {
    const created_at = new Date();

    const insertQuery = `
      INSERT INTO prescription_doctor 
      (id, pratient_name, age, gender, time, pratient_id, doctor_id, appointment_id, status, slots_id, created_at, symptoms, medicines, note) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await req.db.query(insertQuery, [
      id,
      pratient_name,
      age,
      gender,
      time,
      pratient_id,
      doctor_id,
      appointment_id,
      status,
      slots_id,
      created_at,
      symptoms,
      medicines,
      note
    ]);

    return { success: true, message: "Prescription added successfully." };
  } catch (err) {
    console.error("Error during prescription:", err.message);
    throw new Error("Failed to add prescription.");
  }
}



async function my_tear_wise_subordinatedata(req,userid,date,tear,search) {
  try {
        if(!date)
        {
            if(search)
            {
                var sql=`WITH RECURSIVE UserHierarchy AS (
                SELECT *, 1 as level
                FROM users
                WHERE added_by = '${userid}' AND username LIKE '%${search}%'
                UNION ALL
                -- Recursive case: select users added by users found in the previous level
                SELECT u.*, uh.level + 1
                FROM users u
                INNER JOIN UserHierarchy uh ON u.added_by = uh.id
                WHERE uh.level < ${tear}
            )
            SELECT UserHierarchy.*, COALESCE(SUM(t.amount), 0) AS deposit_amount,COALESCE(SUM(b.amount), 0) AS bet_amount,COALESCE(SUM(com.amount), 0) AS commission_amount FROM UserHierarchy LEFT JOIN transactions t ON t.userid = UserHierarchy.id AND t.type = (SELECT id FROM transaction_type WHERE name='Deposit') LEFT JOIN transactions b ON b.userid = UserHierarchy.id AND b.type = (SELECT id FROM transaction_type WHERE name='Contest') LEFT JOIN transactions com ON com.userid = UserHierarchy.id AND com.type = (SELECT id FROM transaction_type WHERE name='Commisson') GROUP BY UserHierarchy.id, UserHierarchy.level;`;
            }
            else{
                var sql=`WITH RECURSIVE UserHierarchy AS (
                SELECT *, 1 as level
                FROM users
                WHERE added_by = '${userid}'
                UNION ALL
                -- Recursive case: select users added by users found in the previous level
                SELECT u.*, uh.level + 1
                FROM users u
                INNER JOIN UserHierarchy uh ON u.added_by = uh.id
                WHERE uh.level < ${tear}
            )
            SELECT UserHierarchy.*, COALESCE(SUM(t.amount), 0) AS deposit_amount,COALESCE(SUM(b.amount), 0) AS bet_amount,COALESCE(SUM(com.amount), 0) AS commission_amount FROM UserHierarchy LEFT JOIN transactions t ON t.userid = UserHierarchy.id AND t.type = (SELECT id FROM transaction_type WHERE name='Deposit') LEFT JOIN transactions b ON b.userid = UserHierarchy.id AND b.type = (SELECT id FROM transaction_type WHERE name='Contest') LEFT JOIN transactions com ON com.userid = UserHierarchy.id AND com.type = (SELECT id FROM transaction_type WHERE name='Commisson') GROUP BY UserHierarchy.id, UserHierarchy.level;`;
            }
        }
        else{
            if(search)
            {
                var sql=`WITH RECURSIVE UserHierarchy AS (
                SELECT *, 1 as level
                FROM users
                WHERE added_by = '${userid}' AND username LIKE '%${search}%' AND DATE(created_at)='${date}'
                UNION ALL
                -- Recursive case: select users added by users found in the previous level
                SELECT u.*, uh.level + 1
                FROM users u
                INNER JOIN UserHierarchy uh ON u.added_by = uh.id
                WHERE uh.level < ${tear}
            )
            SELECT UserHierarchy.*, COALESCE(SUM(t.amount), 0) AS deposit_amount,COALESCE(SUM(b.amount), 0) AS bet_amount,COALESCE(SUM(com.amount), 0) AS commission_amount FROM UserHierarchy LEFT JOIN transactions t ON t.userid = UserHierarchy.id AND t.type = (SELECT id FROM transaction_type WHERE name='Deposit') LEFT JOIN transactions b ON b.userid = UserHierarchy.id AND b.type = (SELECT id FROM transaction_type WHERE name='Contest') LEFT JOIN transactions com ON com.userid = UserHierarchy.id AND com.type = (SELECT id FROM transaction_type WHERE name='Commisson') GROUP BY UserHierarchy.id, UserHierarchy.level;`;
            }
            else{
                var sql=`WITH RECURSIVE UserHierarchy AS (
                SELECT *, 1 as level
                FROM users
                WHERE added_by = '${userid}' AND DATE(created_at)='${date}'
                UNION ALL
                -- Recursive case: select users added by users found in the previous level
                SELECT u.*, uh.level + 1
                FROM users u
                INNER JOIN UserHierarchy uh ON u.added_by = uh.id
                WHERE uh.level < ${tear}
            )
            SELECT UserHierarchy.*, COALESCE(SUM(t.amount), 0) AS deposit_amount,COALESCE(SUM(b.amount), 0) AS bet_amount,COALESCE(SUM(com.amount), 0) AS commission_amount FROM UserHierarchy LEFT JOIN transactions t ON t.userid = UserHierarchy.id AND t.type = (SELECT id FROM transaction_type WHERE name='Deposit') LEFT JOIN transactions b ON b.userid = UserHierarchy.id AND b.type = (SELECT id FROM transaction_type WHERE name='Contest') LEFT JOIN transactions com ON com.userid = UserHierarchy.id AND com.type = (SELECT id FROM transaction_type WHERE name='Commisson') GROUP BY UserHierarchy.id, UserHierarchy.level;`;
            }
            
        }
      console.log('=======================================team_subordinate=================================================')
      console.log(sql)
      console.log('=======================================team_subordinate=================================================')
    const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function my_tear_wise_default_data(req,userid,date,tear) {
  try {
        if(!date)
        {
            var sql=`WITH RECURSIVE UserHierarchy AS (
                SELECT *, 1 as level
                FROM users
                WHERE added_by = '${userid}'
                UNION ALL
                -- Recursive case: select users added by users found in the previous level
                SELECT u.*, uh.level + 1
                FROM users u
                INNER JOIN UserHierarchy uh ON u.added_by = uh.id
                WHERE uh.level < ${tear}
            ),
            FirstDeposit AS (
                SELECT 
                    t.userid, 
                    t.amount,
                    ROW_NUMBER() OVER (PARTITION BY t.userid ORDER BY t.id ASC) as rn
                FROM transactions t
                WHERE t.type = (SELECT id FROM transaction_type WHERE name='Deposit')
            ),
            TotalDeposit AS (
                SELECT 
                    userid, 
                    SUM(amount) AS total_deposit_amount
                FROM transactions
                WHERE type = (SELECT id FROM transaction_type WHERE name='Deposit')
                GROUP BY userid
            )
            SELECT 
                COALESCE(SUM(fd.amount), 0) AS first_deposit_amount,
                COALESCE(count(fd.amount), 0) AS first_deposit_count,
                COALESCE(SUM(td.total_deposit_amount), 0) AS total_deposit_amount,
                COALESCE(count(b.amount), 0) AS number_of_better,
                COALESCE(sum(b.amount), 0) AS total_bet
            FROM UserHierarchy
            LEFT JOIN FirstDeposit fd ON fd.userid = UserHierarchy.id AND fd.rn = 1
            LEFT JOIN TotalDeposit td ON td.userid = UserHierarchy.id
            LEFT JOIN transactions b ON b.userid = UserHierarchy.id AND b.type = (SELECT id FROM transaction_type WHERE name='Contest')`;
        }
        else{
            var sql=`WITH RECURSIVE UserHierarchy AS (
                SELECT *, 1 as level
                FROM users
                WHERE added_by = '${userid}' AND DATE(created_at)='${date}'
                UNION ALL
                -- Recursive case: select users added by users found in the previous level
                SELECT u.*, uh.level + 1
                FROM users u
                INNER JOIN UserHierarchy uh ON u.added_by = uh.id
                WHERE uh.level < ${tear}
            ),
            FirstDeposit AS (
                SELECT 
                    t.userid, 
                    t.amount,
                    ROW_NUMBER() OVER (PARTITION BY t.userid ORDER BY t.id ASC) as rn
                FROM transactions t
                WHERE t.type = (SELECT id FROM transaction_type WHERE name='Deposit')
            ),
            TotalDeposit AS (
                SELECT 
                    userid, 
                    SUM(amount) AS total_deposit_amount
                FROM transactions
                WHERE type = (SELECT id FROM transaction_type WHERE name='Deposit')
                GROUP BY userid
            )
            SELECT 
                COALESCE(SUM(fd.amount), 0) AS first_deposit_amount,
                COALESCE(count(fd.amount), 0) AS first_deposit_count,
                COALESCE(SUM(td.total_deposit_amount), 0) AS total_deposit_amount,
                COALESCE(count(b.amount), 0) AS number_of_better,
                COALESCE(sum(b.amount), 0) AS total_bet
            FROM UserHierarchy
            LEFT JOIN FirstDeposit fd ON fd.userid = UserHierarchy.id AND fd.rn = 1
            LEFT JOIN TotalDeposit td ON td.userid = UserHierarchy.id
            LEFT JOIN transactions b ON b.userid = UserHierarchy.id AND b.type = (SELECT id FROM transaction_type WHERE name='Contest')`;
        }
      console.log('=======================================team_subordinate=================================================')
      console.log(sql)
      console.log('=======================================team_subordinate=================================================')
    const [rows] = await req.db.query(sql);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function update_payin_status(req,userid,transactionid,utr,status) {
  try {
   
        sql=`UPDATE transactions SET utr='${utr}',status='${status}' WHERE userid='${userid}' AND transaction_id='${transactionid}'`;
        const [rows] = await req.db.query(sql);
        
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_settings(req, name) {
    try {
        const sql = `SELECT id, name, value FROM settings WHERE name = ?`;
        const [rows] = await req.db.query(sql, [name]); // Parameterized query
        return rows;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function how_to_play(req,gameid) {
  try {
   
        sql=`SELECT * FROM how_to_play WHERE gameid='${gameid}'`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_notifications(req,type,userid,count_type) {
  try {
        if(type=='1')
        {
            sql=`SELECT n.*,CASE
        WHEN nv.userid IS NOT NULL THEN '1'
        ELSE '0'
        END AS is_viewed FROM  notifications n LEFT JOIN  (SELECT DISTINCT notification_id, userid FROM notification_viewed WHERE userid = '${userid}') nv ON  nv.notification_id = n.id WHERE  n.userid IN (${userid}, 0) GROUP BY  n.id`;
        }
        if(type=='2')
        {
            sql=`SELECT n.*,CASE
        WHEN nv.userid IS NOT NULL THEN '1'
        ELSE '0'
        END AS is_viewed FROM  notifications n LEFT JOIN  (SELECT DISTINCT notification_id, userid FROM notification_viewed WHERE userid = '${userid}') nv ON  nv.notification_id = n.id WHERE  n.userid IN (${userid}, 0) AND n.type='${type}' GROUP BY  n.id `;
        }
        if(count_type=='3')
        {
            sql=`SELECT * FROM (SELECT n.*,CASE
        WHEN nv.userid IS NOT NULL THEN '1'
        ELSE '0'
        END AS is_viewed FROM  notifications n LEFT JOIN  (SELECT DISTINCT notification_id, userid FROM notification_viewed WHERE userid = '${userid}') nv ON  nv.notification_id = n.id WHERE  n.userid IN (${userid}, 0) AND n.type='${type}' GROUP BY  n.id ) AS subquery WHERE is_viewed = '0'`;
        }
        console.log('====================================================')
        console.log(sql)
        console.log('====================================================')
        
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function reg(req, name, mobile, email = '', dob = '', gender = '', city = '',country_id = '') {
  try {
    // Check if the mobile number or email is already registered
    const checkSql = `SELECT * FROM users WHERE mobile = ? OR email = ?`;
    const [existingUser] = await req.db.query(checkSql, [mobile, email]);

    if (existingUser.length > 0) {
      return { success: false, message: "Mobile or email is already registered." };
    }

    const sql = `INSERT INTO users (name, mobile, email, dob, gender, city, status, otp, roleid,country_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    
    const [result] = await req.db.query(sql, [
      name,
      mobile,
      email,
      dob,
      gender,
      city,
      1,     // status
      '1111',// otp default
      2,      // roleid
	  country_id	
    ]);

    return {
      success: true,
      message: "User registered successfully.",
      insertId: result.insertId,
    };
  } catch (err) {
    throw new Error(err.message);
  }
}


async function reg_doctor(req, name, mobile,email, reg_number, reg_year, medical_council_name, gender,problem_check) {
  try {
    const checkSql = `SELECT * FROM users WHERE mobile = ?`;
    const [existingUser] = await req.db.query(checkSql, [mobile]);

    if (existingUser.length > 0) {
      return { success: false, message: "Mobile number is already registered." };
    }
    const otp = "1111"; // Ideally, generate this dynamically
    const status = 1; // Active status, adapt based on your system

    // SQL query to insert a new user
    const sql = `
      INSERT INTO users (name, mobile, email, otp, status, reg_number, reg_year, medical_council_name, roleid, documentstatus,gender,problem_check) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `;
    const values = [name, mobile, email, otp, status, reg_number, reg_year, medical_council_name, 3, 0,gender,problem_check];
     console.log(sql);

    // Execute the insert query
    const [result] = await req.db.query(sql, values);

    return { success: true, message: "Registered successfully.", insertId: result.insertId };
  } catch (err) {
    console.error("Error in reg_doctor:", err.message);
    return { success: false, message: "An error occurred during registration." };
  }
}


async function appointment(
  req,
  user_id,
  doc_id,
  name,
  email,
  mobile,
  experts_id,
  wmobile,
  appointment_date,
  selectslottype,
  slots_id,
  week_day,
  description,
  date,
  wallet,
  gender,
  age,
  duration
) {
  try {
    const updated_at = new Date();
    const walletAmount = parseFloat(wallet) || 0;

    // 1. ✅ Fetch user wallet balance
    const [userResult] = await req.db.query(`SELECT wallet FROM users WHERE id = ?`, [user_id]);
    if (!userResult || userResult.length === 0) {
      return { success: false, message: "User not found." };
    }

    const currentWallet = parseFloat(userResult[0].wallet);
    if (currentWallet < walletAmount) {
      return { success: false, message: "Insufficient wallet balance." };
    }

    // 2. ✅ Generate appointment_id: cleaned name + 3 random digits
    const cleanedName = name.replace(/\s+/g, '').toLowerCase(); // remove spaces and lowercase
    const randomDigits = Math.floor(100 + Math.random() * 900); // random 3-digit number
    const appointment_id = `${cleanedName}${randomDigits}`;

    // 3. ✅ Insert appointment
    const insertQuery = `
      INSERT INTO appointment 
      (user_id, doc_id, name, email, mobile, experts_id, status_meeting, updated_at,
       slots_id, week_day, description, date, status, gender, age, selectslottype, duration,
       appointment_date, wmobile, appointment_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await req.db.query(insertQuery, [
      user_id,
      doc_id,
      name,
      email,
      mobile,
      experts_id,
      0, // status_meeting
      updated_at,
      slots_id,
      week_day,
      description,
      date,
      0, // status
      gender,
      age,
      selectslottype,
      duration,
      appointment_date,
      wmobile,
      appointment_id
    ]);

    // 4. ✅ Deduct wallet amount
    const updateQuery = `UPDATE users SET wallet = wallet - ? WHERE id = ?`;
    await req.db.query(updateQuery, [walletAmount, user_id]);

    return { success: true, message: "Appointment booked successfully.", appointment_id };
  } catch (err) {
    console.error("Error during appointment:", err);
    throw new Error("Failed to create appointment or update wallet.");
  }
}


////////////////////////////////////////////////////////////////////  ye sahi hai   ////////////////////////////////////////////////////////////////////////////////////


// async function appointment(
//   req,
//   user_id,
//   doc_id,
//   name,
//   email,
//   mobile,
//   experts_id,
//   slots_id,
//   week_day,
//   description,
//   date,
//   gender,
//   age,
//   wallet
// ) {
//   const connection = await req.db.getConnection();

//   try {
//     // Start transaction
//     await connection.beginTransaction();

//     // Fetch user details (sessions and wallet)
//     const userQuery = `SELECT sessions, wallet FROM users WHERE id = ?`;
//     const [user] = await connection.query(userQuery, [user_id]);

//     if (!user || user.length === 0) {
//       throw new Error("User not found.");
//     }

//     const { sessions, wallet: userWallet } = user[0];

//     // Check sessions first
//     if (sessions === null || sessions <= 0) {
//       // If sessions are zero, check wallet balance
//       if (userWallet === null || userWallet < wallet) {
//         return { success: false, message: "Insufficient wallet balance and no active sessions." };
//       }

//       // Deduct wallet balance
//       const newWalletBalance = userWallet - wallet;
//       const updateWalletQuery = `UPDATE users SET wallet = ? WHERE id = ?`;
//       await connection.query(updateWalletQuery, [newWalletBalance, user_id]);
//     } else {
//       // Deduct sessions if available
//       const updateSessionsQuery = `UPDATE users SET sessions = sessions - 1 WHERE id = ?`;
      
//     }

//     // Insert appointment into the database
//     const insertQuery = `
//       INSERT INTO appointment 
//       (user_id, doc_id, name, email, mobile, experts_id, status, updated_at, slots_id, week_day, description, date, status_meeting, gender, age) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const updated_at = new Date();
//     await connection.query(insertQuery, [
//       user_id,
//       doc_id,
//       name,
//       email,
//       mobile,
//       experts_id,
//       0, // status
//       updated_at,
//       slots_id,
//       week_day,
//       description,
//       date,
//       0, // status_meeting
//       gender,
//       age,
//     ]);

//     // Commit transaction
//     await connection.commit();

//     return { success: true, message: "Appointment created successfully." };
//   } catch (err) {
//     // Rollback transaction on error
//     await connection.rollback();
//     console.error("Error during appointment creation:", err.message);
//     throw new Error("Failed to create appointment or update wallet.");
//   } finally {
//     connection.release();
//   }
// }




/////////////////////////////////////////////////////////////////////////////
async function consultationn(req, doctor_id, user_id, appointment_id, meeting) {
    try {
        const updated_at = new Date(); // Get the current timestamp
        const update_doc= await req.db.query(`INSERT INTO consultation (doctor_id, user_id, appointment_id, meeting, status, updated_at) VALUES ('${doctor_id}','${user_id}','${appointment_id}','${meeting}','0','${updated_at}')`);
        
        const update_docs= await req.db.query(`UPDATE appointment SET status='2',status_meeting='1' WHERE id='${appointment_id}'`);
    
  } catch (err) {
    throw new Error(err.message);
  }
}

async function slot(req, doctor_id, week_day, date) {
  try {
    const updated_at = new Date(); // Current timestamp
    const sql = `
      INSERT INTO slots(doctor_id, week_day, date, status, updated_at) 
      VALUES (?, ?, ?, '1', ?)`;
    console.log(sql); // Debugging query structure
    const [rows] = await req.db.query(sql, [doctor_id, week_day, date, updated_at]);
    return rows;
  } catch (err) {
    throw new Error(`Database insertion failed: ${err.message}`);
  }
}


async function wellbeing(req,name, email, mobile,description) {
  try {
    const updated_at = new Date(); // Get the current timestamp in ISO format
    const sql = `
      INSERT INTO wellbeing(name, email, mobile, status, updated_at,description) 
      VALUES (?, ?, ?, '1', ?,description)`;
    console.log(sql); // Debugging query structure (exclude in production)
    const [rows] = await req.db.query(sql, [ name, email, mobile, updated_at,description]);
    return rows;
  } catch (err) {
    throw new Error(`Database insertion failed: ${err.message}`);
  }
}

async function supporttt(req, name, mobile, msg,doctor_id) {
  try {
    const updated_at = new Date(); 
    const sql = `
      INSERT INTO support(name, mobile, msg,doctor_id, status, updated_at) 
      VALUES (?, ?, ?, ?,'1', ?)`;
    console.log(sql); // Debugging query structure (exclude in production)
    
    // Execute the query with the appropriate parameters
    const [rows] = await req.db.query(sql, [name, mobile, msg,doctor_id, updated_at]);
    return rows;
  } catch (err) {
    throw new Error(`Database insertion failed: ${err.message}`);
  }
}

async function doc_profilee(req,mobile) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM users WHERE mobile='${mobile}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function create_slot(req, doctor_id, week_day, date, slots) {
  try {
    const updated_at = new Date(); // Current timestamp
    const slots_json = JSON.stringify(slots); // Convert slots array to JSON string

    const sql = `
      INSERT INTO slots (doctor_id, week_day, date, status, updated_at, slots)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [rows] = await req.db.query(sql, [
      doctor_id,
      week_day,
      date,
      '1',
      updated_at,
      slots_json
    ]);

    return rows;
  } catch (err) {
    throw new Error(`Database insertion failed: ${err.message}`);
  }
}



async function get_bank_details(req,userid){
  try {
   
        sql=`SELECT users_bank_details.*,users.mobile,users.email FROM users_bank_details LEFT JOIN users ON users.id=users_bank_details.userid WHERE users_bank_details.userid='${userid}'`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function create_team(req,userid,matchid,gameid){
  try {
   
        sql=`INSERT INTO my_team (match_id, userid,gameid ,team_name)SELECT '${matchid}', '${userid}','${gameid}', CONCAT('T', '', counts + 1)FROM (SELECT count(*) AS counts FROM my_team WHERE match_id = '${matchid}' AND userid = '${userid}') AS temp;`;
        console.log("##################################################################################################3")
        console.log(sql)
        console.log("##################################################################################################3")
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function save_player_myteam(req,userid,matchid,myteamid,playerid,is_captain,is_vice_captain,sportsmonk_pid,designation_name,originalteamid){
  try {
   
        sql=`INSERT INTO my_team_player(matchid, my_teamid, playerid,is_captain,is_vice_captain,sportsmonk_pid,designation_name,teamid) VALUES ('${matchid}','${myteamid}','${playerid}','${is_captain}','${is_vice_captain}','${sportsmonk_pid}','${designation_name}','${originalteamid}')`;
        console.log("=============================================================================================")
        console.log(sql)
        console.log("=============================================================================================")
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_my_team(req,userid,matchid,gameid,contestid){
  try {
        sql=`SELECT my_team.*,SUM(my_team_player.total_point) AS all_point,captain.name AS captain_name,captain.image AS captain_image,vice_captain.name AS vice_captain_name,vice_captain.image AS vice_captain_image,SUM(CASE WHEN my_team_player.designation_name = 'AR' THEN 1 ELSE 0 END) AS AR,SUM(CASE WHEN my_team_player.designation_name = 'BAT' THEN 1 ELSE 0 END) AS BAT,SUM(CASE WHEN my_team_player.designation_name = 'BOWL' THEN 1 ELSE 0 END) AS BOWL,SUM(CASE WHEN my_team_player.designation_name = 'WK' THEN 1 ELSE 0 END) AS WK,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,t1.slug AS hometeam_name,t2.slug AS visitorteam_name, 
            SUM(CASE WHEN my_team_player.teamid = JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) THEN 1 ELSE 0 END) AS home_team_player_count,SUM(CASE WHEN my_team_player.teamid = JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) THEN 1 ELSE 0 END) AS visitor_team_player_count,matches.status AS matchstatus,(SELECT CASE WHEN COUNT(id)>'0' THEN '1' ELSE '0' END AS joined_status FROM my_contest WHERE contest_id='${contestid}' AND my_teamid=my_team.id) AS joined_status
            FROM my_team 
            LEFT JOIN my_team_player ON my_team_player.my_teamid = my_team.id 
            LEFT JOIN players AS captain ON captain.id = (SELECT playerid FROM my_team_player WHERE my_team_player.my_teamid = my_team.id AND my_team_player.is_captain = 1 LIMIT 1) 
            LEFT JOIN players AS vice_captain ON vice_captain.id = (SELECT playerid FROM my_team_player WHERE my_team_player.my_teamid = my_team.id AND my_team_player.is_vice_captain = 1 LIMIT 1) 
            LEFT JOIN matches ON matches.id=my_team.match_id 
            LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id 
            LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id 
            LEFT JOIN players ON players.id=my_team_player.playerid
            WHERE my_team.match_id = '${matchid}' AND my_team.userid = '${userid}' AND my_team.gameid='${gameid}' GROUP BY my_team.id`;
            console.log("===============================================================");
        console.log(sql)
        console.log("===============================================================");

        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}





async function getplayer_by_teamid(req,teamid,matchid){
  try {
        sql=`SELECT my_team_player.*,players.name AS player_name,players.image AS player_image,teams.slug AS teamname,'22' AS sel_by,'39' AS c_by,'55' AS vc_by FROM my_team_player LEFT JOIN players ON players.id=my_team_player.playerid LEFT JOIN teams ON teams.id=my_team_player.teamid WHERE my_team_player.my_teamid='${teamid}' AND my_team_player.matchid ='${matchid}'`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}



async function insert_my_matches(req,userid,matchid,gameid){
  try {
        sql=`INSERT INTO my_matches(match_id, userid,gameid) VALUES ('${matchid}','${userid}','${gameid}')`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function getmy_matches(req,userid,matchid,gameid){
  try {
        sql=`SELECT * FROM my_matches WHERE userid='${userid}' AND match_id='${matchid}' AND gameid='${gameid}'`;
        console.log("##################################################Get My Match################################################3")
        console.log(sql)
        console.log("##################################################Get My Match################################################3")
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function join_contest(req,userid,matchid,contestid,teamid,gameid){
  try {
        sql=`INSERT INTO my_contest(my_match_id, user_id, contest_id, my_teamid,gameid) VALUES ('${matchid}','${userid}','${contestid}','${teamid}','${gameid}')`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function check_user_wallet(req,userid,amount){
  try {
        sql=`SELECT * FROM user_details WHERE user_id='${userid}' AND (winning_wallet+unutiliesed_wallet)>=${amount}`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_c_vc_byteamid(req,myteamid){
  try {
        sql=`SELECT my_team.*,SUM(my_team_player.total_point) AS all_point,captain.name AS captain_name,captain.image AS captain_image,vice_captain.name AS vice_captain_name,vice_captain.image AS vice_captain_image,matches.status AS matchstatus FROM my_team LEFT JOIN my_team_player ON my_team_player.my_teamid = my_team.id LEFT JOIN players AS captain ON captain.id = (SELECT playerid FROM my_team_player WHERE my_team_player.my_teamid = my_team.id AND my_team_player.is_captain = 1 LIMIT 1) LEFT JOIN players AS vice_captain ON vice_captain.id = (SELECT playerid FROM my_team_player WHERE my_team_player.my_teamid = my_team.id AND my_team_player.is_vice_captain = 1 LIMIT 1) LEFT JOIN matches ON matches.id=my_team.match_id WHERE my_teamid IN(${myteamid}) GROUP BY my_team.id`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function update_player_my_team(req,userid,myteamid,id,playerid,is_captain,is_vice_captain,sportsmonk_pid,designation_name,originalteamid){
  try {
        sql=`UPDATE my_team_player SET playerid='${playerid}',sportsmonk_pid='${sportsmonk_pid}',designation_name='${designation_name}',is_captain='${is_captain}',is_vice_captain='${is_vice_captain}',teamid='${originalteamid}' WHERE id='${id}'`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_scoreboard(req,matchid){
  try {
        sql=`SELECT * FROM matches WHERE id='${matchid}'`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function get_match_player(req,matchid){
  try {
        sql=`SELECT players.*,match_player.teamid FROM match_player LEFT JOIN players ON players.id=match_player.playerid WHERE matchid='${matchid}' AND is_playing='1'`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function get_winning_in_match(req,matchid,userid){
  try {
        sql=`SELECT COALESCE(SUM(transactions.amount), 0) AS total_winnings,COUNT(DISTINCT  contest_id) AS total_contest FROM transactions WHERE userid='${userid}' AND match_id='${matchid}' AND sub_type =(SELECT id FROM transaction_type WHERE UPPER(name)='Contest winning')`;
        console.log("##################################Get Joined Team Query###########################################################3");
        console.log(sql);
        console.log("##################################Get Joined Team Query###########################################################3");
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_joined_team(req,myteamid){
  try {
        sql=`SELECT my_team.*,SUM(my_team_player.total_point) AS all_point,CAST((RANK() OVER (ORDER BY SUM(my_team_player.total_point) DESC)) AS CHAR) AS ranks,users.username AS username,matches.status AS matchstatus FROM my_team LEFT JOIN my_team_player ON my_team_player.my_teamid = my_team.id LEFT JOIN matches ON matches.id=my_team.match_id LEFT JOIN users ON users.id=my_team.userid WHERE my_teamid IN(${myteamid}) GROUP BY my_team.id`;
        console.log("##################################Get Joined Team Query###########################################################3");
        console.log(sql);
        console.log("##################################Get Joined Team Query###########################################################3");
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}


async function get_leaderboard(req,matchid,contestid){
  try {
  
        sql=`WITH RankedTeams AS (
            SELECT my_team.*,SUM(my_team_player.total_point) AS all_point,RANK() OVER (ORDER BY SUM(my_team_player.total_point) DESC) AS ranks,users.username AS username,users.image AS userimage,matches.status AS matchstatus FROM my_team 
            LEFT JOIN my_team_player ON my_team_player.my_teamid = my_team.id
            LEFT JOIN users ON users.id = my_team.userid
            LEFT JOIN matches ON matches.id = my_team.match_id
            WHERE my_team.id IN (SELECT my_teamid FROM my_contest WHERE contest_id = '${contestid}') AND my_team.match_id = '${matchid}' GROUP BY my_team.id),
        RankCounts AS (SELECT ranks,COUNT(*) AS rank_count FROM RankedTeams GROUP BY ranks),
        RankedPrizes AS (
            SELECT RankedTeams.ranks,CASE
            WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[0].rank')) AS UNSIGNED) = RankedTeams.ranks THEN JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[0].prize'))
            WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[1].rank')) AS UNSIGNED) = RankedTeams.ranks THEN JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[1].prize'))
            WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[2].rank')) AS UNSIGNED) = RankedTeams.ranks THEN JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[2].prize'))
            WHEN JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].rank')) REGEXP '^[0-9]+-[0-9]+$' AND CAST(SUBSTRING_INDEX(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].rank')), '-', 1) AS UNSIGNED) <= RankedTeams.ranks AND CAST(SUBSTRING_INDEX(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].rank')), '-', -1) AS UNSIGNED) >= RankedTeams.ranks THEN JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].prize')) ELSE NULL END AS prize,
        CASE 
            WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[0].rank')) AS UNSIGNED) = RankedTeams.ranks THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[0].winnig_p')) AS UNSIGNED)
            WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[1].rank')) AS UNSIGNED) = RankedTeams.ranks THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[1].winnig_p')) AS UNSIGNED)
            WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[2].rank')) AS UNSIGNED) = RankedTeams.ranks THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[2].winnig_p')) AS UNSIGNED)
            WHEN JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].rank')) REGEXP '^[0-9]+-[0-9]+$' AND CAST(SUBSTRING_INDEX(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].rank')), '-', 1) AS UNSIGNED) <= RankedTeams.ranks AND CAST(SUBSTRING_INDEX(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].rank')), '-', -1) AS UNSIGNED) >= RankedTeams.ranks THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(winning_details, '$[3].winnig_p')) AS UNSIGNED) ELSE NULL END AS winnig_p FROM RankedTeams CROSS JOIN (SELECT winning_details FROM contest_winnings WHERE contest_id = '${contestid}') AS contest_winnings),
            CurrentPrizePool AS (SELECT ((SELECT count(*) FROM my_contest WHERE my_match_id IN(SELECT id FROM my_matches WHERE match_id='${matchid}') AND contest_id = '${contestid}') * entry_fee) AS current_prize_pool FROM contest_details WHERE contest_id = '${contestid}')
            SELECT RankedTeams.*,CAST(CASE WHEN RankedPrizes.prize IS NOT NULL THEN '1' ELSE '0' END AS UNSIGNED) AS winning_zone,CONCAT("You won ₹", CAST((CurrentPrizePool.current_prize_pool * RankedPrizes.winnig_p / 100) / RankCounts.rank_count AS CHAR)) AS winning_note,(CurrentPrizePool.current_prize_pool * RankedPrizes.winnig_p / 100) / RankCounts.rank_count AS winp FROM RankedTeams
            LEFT JOIN RankedPrizes ON RankedPrizes.ranks = RankedTeams.ranks
            LEFT JOIN RankCounts ON RankCounts.ranks = RankedTeams.ranks
            LEFT JOIN CurrentPrizePool ON 1=1 GROUP BY RankedTeams.id`;
console.log("##################################Get leaderboard Query###########################################################3");
        console.log(sql)
console.log("##################################Get leaderboard Query###########################################################3")
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}




async function get_teamstate(req,matchid,userid,gameid){
  try {
        sql=`SELECT my_team.*,SUM(my_team_player.total_point) AS all_point,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,t1.slug AS hometeam_name,t2.slug AS visitorteam_name FROM my_team LEFT JOIN my_team_player ON my_team_player.my_teamid = my_team.id LEFT JOIN matches ON matches.id=my_team.match_id LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id 
            LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id  WHERE match_id='${matchid}' AND userid='${userid}' AND gameid='${gameid}' GROUP BY my_team.id`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_playing_eleven(req,matchid){
  try {
        sql=`SELECT match_player.*,players.name AS playername,players.image AS playerimage,teams.slug AS teamname,designation.short_term AS designation_name,'22' AS sel_by,'39' AS c_by,'55' AS vc_by FROM match_player LEFT JOIN players ON players.id=match_player.playerid LEFT JOIN teams ON teams.id=match_player.teamid LEFT JOIN designation ON designation.id=players.designationid WHERE matchid='${matchid}' AND is_playing='1'`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function team_data_byid(req,userid,matchid,gameid,teamid){
  try {
        sql=`SELECT my_team.*,SUM(my_team_player.total_point) AS all_point,captain.name AS captain_name,captain.image AS captain_image,vice_captain.name AS vice_captain_name,vice_captain.image AS vice_captain_image,SUM(CASE WHEN my_team_player.designation_name = 'AR' THEN 1 ELSE 0 END) AS AR,SUM(CASE WHEN my_team_player.designation_name = 'BAT' THEN 1 ELSE 0 END) AS BAT,SUM(CASE WHEN my_team_player.designation_name = 'BOWL' THEN 1 ELSE 0 END) AS BOWL,SUM(CASE WHEN my_team_player.designation_name = 'WK' THEN 1 ELSE 0 END) AS WK,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,t1.slug AS hometeam_name,t2.slug AS visitorteam_name, 
            SUM(CASE WHEN my_team_player.teamid = JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) THEN 1 ELSE 0 END) AS home_team_player_count,SUM(CASE WHEN my_team_player.teamid = JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) THEN 1 ELSE 0 END) AS visitor_team_player_count
            FROM my_team 
            LEFT JOIN my_team_player ON my_team_player.my_teamid = my_team.id 
            LEFT JOIN players AS captain ON captain.id = (SELECT playerid FROM my_team_player WHERE my_team_player.my_teamid = my_team.id AND my_team_player.is_captain = 1 LIMIT 1) 
            LEFT JOIN players AS vice_captain ON vice_captain.id = (SELECT playerid FROM my_team_player WHERE my_team_player.my_teamid = my_team.id AND my_team_player.is_vice_captain = 1 LIMIT 1) 
            LEFT JOIN matches ON matches.id=my_team.match_id 
            LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id 
            LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id 
            LEFT JOIN players ON players.id=my_team_player.playerid
            WHERE my_team.match_id = '${matchid}' AND my_team.userid = '${userid}' AND my_team.gameid='${gameid}' AND my_team.id='${teamid}' GROUP BY my_team.id`;
        console.log(sql)
        const [rows] = await req.db.query(sql);
        return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_app_version(req,type) {
  try {
    const [rows] = await req.db.query(`SELECT * FROM versions WHERE status='1' `);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function get_player_info_by_match(req,playerid,matchid,gameid) {
  try {
const [rows] = await req.db.query(`SELECT match_player.*,players.name AS playername,players.image AS playerimage,players_by_series.credit_points,'98.02' AS             selected_by,(COALESCE(match_player.wicket,0) * COALESCE(pd.wicket_taken, 0))AS wickets_p,(COALESCE(match_player.single_double_run, 0) * COALESCE(pd.every_run, 0)) AS single_run,(COALESCE(match_player.sixes, 0) * COALESCE(pd.six, 0)) AS six_p,(COALESCE(match_player.fours, 0) * COALESCE(pd.boundary, 0)) AS fours_p FROM match_player 
        LEFT JOIN players ON players.id=match_player.playerid 
        LEFT JOIN players_by_series ON players_by_series.third_party_season_id=match_player.third_party_season_id AND match_player.playerid=players_by_series.pid
        JOIN (SELECT JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.every_run')) AS every_run,JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.boundary')) AS boundary,JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.six')) AS six,JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.wicket_taken')) AS wicket_taken FROM point_distribution_rule WHERE match_type = 'ODI' ) AS pd ON 1 = 1
        WHERE playerid='${playerid}' AND matchid='${matchid}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function get_player_info_by_series(req,playerid,matchid,gameid) {
  try {
    const [rows] = await req.db.query(`SELECT match_player.*,players.name AS playername,players.image AS playerimage,players_by_series.credit_points,'98.02' AS             selected_by,(COALESCE(match_player.wicket,0) * COALESCE(pd.wicket_taken, 0))AS wickets_p,(COALESCE(match_player.single_double_run, 0) * COALESCE(pd.every_run, 0)) AS single_run,(COALESCE(match_player.sixes, 0) * COALESCE(pd.six, 0)) AS six_p,(COALESCE(match_player.fours, 0) * COALESCE(pd.boundary, 0)) AS fours_p FROM match_player 
        LEFT JOIN players ON players.id=match_player.playerid 
        LEFT JOIN players_by_series ON players_by_series.third_party_season_id=match_player.third_party_season_id AND match_player.playerid=players_by_series.pid
        JOIN (SELECT JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.every_run')) AS every_run,JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.boundary')) AS boundary,JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.six')) AS six,JSON_UNQUOTE(JSON_EXTRACT(rule, '$.general.wicket_taken')) AS wicket_taken FROM point_distribution_rule WHERE match_type = 'ODI' ) AS pd ON 1 = 1
        WHERE playerid='${playerid}' AND matchid='${matchid}'`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function get_joined_team_contest(req,matchid,userid) {
  try {
    
        query1=`SELECT 
            (SELECT COUNT(*) FROM my_team WHERE match_id = '${matchid}' AND userid = '${userid}') AS total_joined_team,
            (SELECT COUNT(DISTINCT contest_id) FROM my_contest WHERE user_id = '${userid}' AND my_match_id = (SELECT id FROM my_matches WHERE match_id = '${matchid}' AND userid = '${userid}')) AS total_joined_contest`;
      console.log(query1);
      
    const [rows] = await req.db.query(query1);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function last_ten_complete_matches(req, userid,gameid) {
  try {
    const [rows] = await req.db.query(`SELECT matches.*,CASE WHEN series.name IS NULL THEN matches.round ELSE series.name END AS seriesname,match_type.slug AS matchtype,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) AS home_teamid,
JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) AS visitorteam_id,
t1.name AS hometeam_name,t2.name AS visitorteam_name,t1.image AS hometeam_image,t2.image AS visitorteam_image,t1.slug AS hometeam_short_name,t2.slug AS visitorteam_short_name,CONCAT('MEGA ₹ ','4.5 lakh') AS megaContest FROM my_matches 
LEFT JOIN matches ON matches.id=my_matches.match_id
LEFT JOIN series ON series.id=matches.series_id
LEFT JOIN match_type ON match_type.id=matches.matchtype_id
LEFT JOIN teams t1 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[0]')) = t1.id
LEFT JOIN teams t2 ON JSON_UNQUOTE(JSON_EXTRACT(matches.team_id, '$[1]')) = t2.id
WHERE matches.game_id=${gameid} AND matches.start_date < NOW() AND matches.status=3 ORDER BY start_date DESC LIMIT 10`);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  my_upcoming_matches,send_otp,verify_otp,exist_user,exist_doctor,exist_mobile,get_profile,get_profilee,get_slot,get_bank,update_profile,doc_profilee,update_profile_bank,update_doc_status,appointment_status,appointment_status_user,appointmentt_date,get_week_day,update_profile_image,update_users_dac,min_amount,add_wallet,get_transaction_type,get_transaction,get_games,prescription_list,prescription,my_live_matches,my_complete_matches,match_status,contest_list,mycontest_list,upcoming_matches,doctor_details,contest_winning,consultationn,match_details_byid,wellbeingservices,contest_filter,all_therapies,get_banner,withdraw_wallet,get_withdraw_amount,min_withdrawal_amount,contestFilterWiseData,get_players_bySeries,my_date_wiserefreals,direct_subordinate,team_subordinate,my_refreals,get_appointment,users_appointment,career_image,my_slots,my_slots_users,filterbystatus,my_tear_wise_subordinatedata,exist_cupon,generateRandomString,signup_transactions,referal_transactions,update_payin_status,get_settings,how_to_play,get_notifications,reg,reg_doctor,my_tear_wise_default_data,appointment,slot,get_bank_details,wellbeing,supporttt,create_slot,get_experts,all_experts,all_news,all_banners,all_pricing,create_team,save_player_myteam,get_my_team,getplayer_by_teamid,insert_my_matches,getmy_matches,join_contest,check_user_wallet,get_c_vc_byteamid,update_player_my_team,get_scoreboard,get_match_player,get_joined_team,get_leaderboard,get_teamstate,get_playing_eleven,all_offer,team_data_byid,get_app_version,get_player_info_by_series,get_player_info_by_match,get_winning_in_match,get_joined_team_contest,last_ten_complete_matches
};