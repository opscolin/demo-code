require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 创建 Nodemailer 传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true', // 465端口为true，587端口为false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 验证 SMTP 连接
transporter.verify((error, success) => {
  if (error) console.error('❌ SMTP 连接失败:', error.message);
  else console.log('✅ SMTP 服务已就绪');
});

// 📥 邮件发送 API
app.post('/api/send', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: '收件人(to)和主题(subject)为必填项' });
  }

  const mailOptions = {
    from: `"邮件演示系统" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: '邮件发送成功', messageId: info.messageId });
  } catch (error) {
    console.error('发送失败:', error);
    res.status(500).json({ error: '邮件发送失败', details: error.message });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 服务运行中: http://localhost:${PORT}`);
});
