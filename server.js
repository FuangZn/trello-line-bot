const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// โหลดค่าจาก Environment Variables ใน Railway
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const LINE_GROUP_ID = process.env.LINE_GROUP_ID;

app.post("/webhook", async (req, res) => {
    try {
        const { action } = req.body;

        if (action && action.type === "createCard") {
            const cardName = action.data.card.name;
            const listName = action.data.list.name;
            const boardName = action.data.board.name;

            const message = `📌 Trello Update:\n📋 บอร์ด: ${boardName}\n📂 ลิสต์: ${listName}\n📝 การ์ดใหม่: ${cardName}`;

            await sendLineMessage(message);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error handling webhook:", error);
        res.sendStatus(500);
    }
});

async function sendLineMessage(message) {
    try {
        await axios.post(
            "https://api.line.me/v2/bot/message/push",  // เปลี่ยนเป็น push message ไปที่ group
            {
                to: LINE_GROUP_ID,  // ส่งเข้า LINE Group ตามค่า Environment Variable
                messages: [{ type: "text", text: message }]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${LINE_ACCESS_TOKEN}`
                }
            }
        );
    } catch (error) {
        console.error("❌ Error sending message to LINE:", error.response?.data || error.message);
    }
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
