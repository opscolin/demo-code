## 安装使用

```bash
git clone https://github.com/opscolin/demo-code.git

cd demo-code/nodejs/demo-nodemailer

# 安装
npm install 

# 启动
node server.js
```


## 命令行curl测试模板

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "目标邮箱@example.com",
    "subject": "Node.js Nodemailer 测试",
    "text": "这是一封来自 curl 命令的测试邮件。",
    "html": "<h3>Hello</h3><p>支持 HTML 格式 <b>粗体</b></p>"
  }'
```


## 基于自带的web页面启动

浏览器打开 localhost:3000 （默认端口是3000， 具体看你启动的时候动态创建的地址）
