const pool = require('../config/db'); // 추가된 부분

async function executeQuery(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (err) {
        console.error("Database error:", err);
        throw new Error("Database query failed");
    }
}

async function fn_getPrivateKey(user_address) {
    try {
        const rows = await executeQuery( `SELECT pub_key, seed, pri_key FROM aahWallet WHERE pub_key = ?`, [user_address] );
        if (rows.length === 0) throw new Error('Wallet not found');
        const { pub_key, seed, pri_key } = rows[0];
        // console.log(`fn_decrypt_db(pri_key) : ${fn_decrypt_db(pri_key)}`);
        let pri_addr = pri_key;
        if (pri_key.startsWith("0x")) {
            pri_addr = pri_key.slice(2); // 제일 왼쪽 2글자를 제거    
        }
        // console.log(pri_addr);
        return await fn_decrypt_db(pri_addr); // 복호화된 개인키
    } catch (error) {
        console.error('Failed to get wallet:', error);
    }
}

module.exports = { fn_getPrivateKey };
