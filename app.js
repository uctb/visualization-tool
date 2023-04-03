const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件目录
// app.use(express.static('public'));
// app.use(express.static('dist'));

app.use(express.static(path.join(__dirname, 'public')));

// 将index.html作为首页
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 将 MIME 类型设置为 JavaScript
app.get('/dist/bundle.js', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'dist', 'bundle.js'));
});


// 启动服务器
app.listen(3000, () => {
    console.log('App is running on port 3000');
});
