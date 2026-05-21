require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Core = require('@alicloud/pop-core');

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || !process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET) {
    console.error('❌ 错误：请先在.env文件中配置AccessKey');
    process.exit(1);
}

const SIGNATURE_SECRET = process.env.API_SECRET || 'your-api-secret-key-change-in-production';
const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

const requestLog = new Map();

function rateLimitCheck(ip) {
    const now = Date.now();
    const record = requestLog.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

    if (now > record.resetAt) {
        record.count = 0;
        record.resetAt = now + RATE_LIMIT_WINDOW;
    }

    record.count++;
    requestLog.set(ip, record);

    return record.count <= RATE_LIMIT_MAX;
}

function verifySignature(openid, timestamp, sign) {
    if (!openid || !timestamp || !sign) return false;

    const now = Date.now();
    if (Math.abs(now - parseInt(timestamp)) > 5 * 60 * 1000) return false;

    const expected = crypto
        .createHash('md5')
        .update(openid + timestamp + SIGNATURE_SECRET)
        .digest('hex');

    return sign === expected;
}

function verifyRequest(req) {
    const { openid, timestamp, sign } = req.body;

    if (!verifySignature(openid, timestamp, sign)) {
        return { valid: false, reason: '签名验证失败' };
    }

    if (!rateLimitCheck(req.ip || req.connection.remoteAddress)) {
        return { valid: false, reason: '请求过于频繁，请稍后重试' };
    }

    return { valid: true };
}

app.post('/api/send-email', async (req, res) => {
    const { toEmail, subject, content, openid, timestamp, sign } = req.body;

    const verify = verifyRequest(req);
    if (!verify.valid) {
        return res.status(403).json({ success: false, message: verify.reason });
    }

    if (!toEmail || !subject || !content) {
        return res.status(400).json({ success: false, message: '请填写所有字段' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
        return res.status(400).json({ success: false, message: '邮箱格式不正确' });
    }

    const client = new Core({
        accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
        endpoint: 'https://dm.aliyuncs.com',
        apiVersion: '2015-11-23'
    });

    const params = {
        RegionId: 'cn-hangzhou',
        AccountName: process.env.SENDER_EMAIL || 'noreply@mail.yourdomain.com',
        ReplyToAddress: false,
        AddressType: 1,
        ToAddress: toEmail,
        Subject: subject,
        HtmlBody: content
    };

    try {
        const response = await client.request('SingleSendMail', params, { method: 'POST' });
        console.log('邮件发送成功:', response);
        res.json({ success: true, message: '邮件发送成功', requestId: response.RequestId });
    } catch (error) {
        console.error('发送失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});