const path = require('path');

module.exports = {
    entry: ['./public/js/js', './public/js/draw', './public/js/anomaly_detection', './public/js/line_final', './public/js/map', './public/js/myfun'],
    mode: "development",
    experiments: {
        topLevelAwait: true,
        outputModule: true
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2', // 设置输出代码为CommonJS格式
        module: true,
    },
    target: 'web',
    module: {
        rules: [
            // 处理 .js 文件，包括转换 ES6 语法和加载依赖
            {
                test: /\.js$/, // test属性表示需要应用Babel-loader的文件类型
                exclude: /node_modules/, //exclude属性表示排除哪些文件夹
                // use属性表示使用哪个loader，并且可以配置选项。
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }

};
