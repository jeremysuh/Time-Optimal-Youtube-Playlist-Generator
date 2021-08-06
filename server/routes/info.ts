import pool from "../db/db";

exports.users = async (req: any, res: any) => {
    const users = await pool.query(`SELECT * FROM users`);
    return res.json(users.rows);
}

exports.playlists = async (req: any, res: any) => {
    const users = await pool.query(`SELECT * FROM playlists`);
    return res.json(users.rows);
}