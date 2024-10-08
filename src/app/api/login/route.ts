import { NextResponse } from "next/server";
import { comparePassword } from '../../../lib/auth'
import { Client } from "pg";
import dotenv from "dotenv";
const bcrypt = require("bcrypt");
import jwt from 'jsonwebtoken';

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

client.connect();

// app/api/login/route.js
export async function POST(req: Request) {
    try {

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const { username, password } = await req.json();
        const res = await client.query('SELECT * FROM tbl_users WHERE username = $1', [username]);

        if (res.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://panudet-learnapp.vercel.app',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // ระบุ Methods ที่อนุญาต
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With', // ระบุ Headers ที่อนุญาต
                },
            });
        }

        const user = res.rows[0];
        console.log(user);
        const match = await bcrypt.compare(password, user.password);
        console.log(match);

        if (match != true) {
            return new Response(JSON.stringify({ error: 'Invalid password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        } else {

            // สมมติว่าเราสร้าง JWT สำหรับการล็อกอิน (สามารถใช้ library เช่น jsonwebtoken)
            // Generate JWT token
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // ตัวอย่างนี้จะข้ามขั้นตอนการสร้าง JWT เพื่อความง่าย
            return new Response(JSON.stringify({ message: 'Login successful', user, token }), {
                status: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            });

        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
    }
}