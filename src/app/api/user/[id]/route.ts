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

export async function PUT(req: Request, {params} : {params : {id: number}}) {
    try {
        const { firstname, lastname, username, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const res = await client.query(`UPDATE tbl_users SET (firstname, lastname, username, password) = ('${firstname}', '${lastname}', '${username}', '${hashedPassword}') WHERE id = ${params.id} RETURNING *`);
        if(res.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({error}), {
            status: 500,
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        });
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