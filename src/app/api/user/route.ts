import { NextResponse } from 'next/server';
import { Client } from 'pg';
import dotenv from 'dotenv';
const bcrypt = require("bcrypt");

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

client.connect();

export async function GET() {
    try {
        const result = await client.query('SELECT * FROM tbl_users');
        return NextResponse.json(result.rows);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { firstname, lastname, username, password } = await req.json();
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const res = await client.query('INSERT INTO tbl_users (firstname, lastname, username, password) VALUES ($1, $2, $3, $4) RETURNING *', [firstname, lastname, username, hashedPassword]);
        return NextResponse.json(res.rows);
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json'},
        });
    }
}
//-------------------------------------------------------------------------------------
export async function PUT(req: Request) {
    try {
        const { firstname, lastname, id, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const res = await client.query('UPDATE tbl_users SET firstname = $1, lastname = $2, password = $3 WHERE id = $4 RETURNING *', [firstname, lastname, hashedPassword, id]);
        if(res.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        });
    }
}
//-------------------------------------------------------------------------------------
export async function DELETE(req: Request) {
    try {
        const {id} = await req.json();
        const res = await client.query('DELETE FROM tbl_users WHERE id = $1 RETURNING *', [id]);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        });
    }
}