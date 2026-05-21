
## 安装

```bash
git clone https://github.com/opscolin/demo-code.git
cd demo-code/nodejs/demo-mail-push
```

## 安装server依赖

npm install

##  安装client依赖

```bash
cd frontend
npm install 
```


##  然后进入 demo-mail-push 目录启动

```bash
cd ..
#确认是在 demo-mail-push 根目录
pwd

# 启动服务
npm run dev
```


## 测试

1、命令行验证

```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"toEmail":"xxxx@126.com","subject":"【21法则微习惯】Tx用户建议","content":"测试内容"}'
```

2、网页验证

浏览器打开  localhost:3000
