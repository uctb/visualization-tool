# visualization-tool-UCTB



**可视化界面index.html打开方法：**

在命令行里键入：

```python
// python 2.x
python -m SimpleHTTPServer

// python 3.x
python -m http.server
```

这将会为当前目录在8000端口创建一个服务器，可以在浏览器地址栏里输入以下格式的地址来访问已经创建好的服务器：

```
http://localhost:8000/file path
```



### 0918 update



**更新了几个功能：**

- 右上图点击`more`按钮后可以切换不同图表
  - groundtruth and prediction：新增在图表上可视化标记`bad case`
  - 统计每个区域在全时间片上bad case的个数
  - 统计各个时间片具有bad case的区域个数
- 右下图点击`more`按钮后可以切换不同图表
  - Metrics Rank List：新增MAE、MAPE指标的降序排列
  - Metric Distribution：分别统计各区域RMSE、MAE、MAPE在不同数值区间的个数





