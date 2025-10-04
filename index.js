import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

import 'dotenv/config';

// inisialisasi express
const app = express();
const ai = new GoogleGenAI({});

// inisialisasi middleware

app.use(cors());
// app.use(multer());
app.use(express.json());
app.use(express.static('public'));

// inisialisasi endpoint
// HTTP Method: GET, POST, PUT, PATCH, DELETE 
// .get() -> utamanya untuk mengambil data atau seacrh
// .post() -> utamanya untuk menaruh (post) data baru ke dalam server
// .put() -> utamanya untuk menimpa data yang sudah ada di dalam server
// .patch() -> utamanya untuk menambal data yang sudah ada di dalam server
// .delete() -> utamanya untuk menghapus data yang ada d idalam server

app.post(
    '/chat', // http://localhost:[PORT]/chat
    async (req, res) => {
        const { body } = req;
        const { conversation } = body;

        // guard clause -- satpam
        if (!conversation || !Array.isArray(conversation)) {
            res.status(400).json({
                message: "Percakapan harus valid!",
                data: null,
                success: false
            });
            return;
        }

        //  guard clause #2 -- satpam ketat!
        const conversationIsValid = conversation.every((message) => {
            // kondisi pertama -- massage harus truthy
            if (!message) return false;

            // kondisi kedua -- message harus berupa obj, namun bukan array
            if (typeof message !== 'object' || Array.isArray(message)) return false;

            // kondisi ketiga -- message harus berisi hanya role dan text
            const keys = Object.keys(message);
            const keyLengthIsValid = keys.length === 2;
            const keyContainValidName = keys.every(key => ['role', 'text'].includes(key));

            if (!keyLengthIsValid || !keyContainValidName) return false;

            // kondisi keempat
            // -- role harus berupa 'user' | 'model'
            // -- text harus berupa string

            const { role, text } = message
            const roleIsValid = ['user', 'model'].includes(role);
            const textIsValid = typeof text === 'string';

            if (!roleIsValid || !textIsValid) return false;

            return true;
        });


        if (!conversationIsValid) {
            res.status(400).json({
                message: "Percakapan harus valid!",
                data: null,
                success: false
            });
            return;
        }


        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        })); 

        //
        try {
            // 3rd party API -- Google API
            const aiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents
            });
            
            res.status(200).json({
                success: true,
                data: aiResponse.text,
                message: "Berhasil ditanggapi oleh Google Gemini Flash!"
            });
        } catch (e) { 
            console.log(e);
            res.status(500).json({
                success: false,
                data: null,
                message: e.message || "ada masalah di server nih!"
            })
        }
    }
);

app.listen(3000, () => {
    console.log("Port Berjalan 3000")
});