import { NextResponse } from 'next/server';
import { Client } from 'pg';
import dotenv from 'dotenv';
const bcrypt = require("bcrypt");

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});


client.connect();

export async function GET(req: Request, { params }: { params: { id: number } }) {

    try {
        const result = await client.query(`SELECT * FROM tbl_users WHERE id = ${params.id} `,);
        return NextResponse.json(result.rows);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: number } }) {
    try {
        const res = await client.query(`DELETE FROM tbl_users WHERE id =  ${params.id}`);
        if (res.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify(res.rows[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}