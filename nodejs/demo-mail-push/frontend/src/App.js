import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [formData, setFormData] = useState({
        toEmail: '',
        subject: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({});

        if (!formData.toEmail || !formData.subject || !formData.content) {
            setMessage({ type: 'error', text: '请填写所有字段' });
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.toEmail)) {
            setMessage({ type: 'error', text: '请输入有效的邮箱地址' });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/send-email', formData);
            if (response.data.success) {
                setMessage({ type: 'success', text: '邮件发送成功！' });
                setFormData({ toEmail: '', subject: '', content: '' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '发送失败：' + (error.response?.data?.message || '网络错误') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <h1>📧 阿里云邮件推送Demo</h1>
                
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>收件人邮箱：</label>
                        <input
                            type="email"
                            name="toEmail"
                            value={formData.toEmail}
                            onChange={handleChange}
                            placeholder="example@domain.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>邮件主题：</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="请输入邮件主题"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>邮件内容：</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="请输入邮件内容（支持HTML）"
                            rows="10"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? '发送中...' : '发送邮件'}
                    </button>
                </form>

                <div className="info">
                    <h3>📌 注意事项：</h3>
                    <ul>
                        <li>仅支持发送已订阅用户邮件，禁止发送垃圾邮件</li>
                        <li>需要先在阿里云控制台配置发信域名和地址</li>
                        <li>AccessKey请妥善保管，建议使用环境变量</li>
                        <li>单用户接口频率限制：100次/秒</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default App;
