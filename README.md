# Step by Step Webpack Configuration

## Intro
요즘 Frontend에서 Webpack은 번들링을 하는데 거의 필수적인 툴로 자리잡고 있다. 몇몇 프레임워크에서는 built-in으로 제공하여 `CRA(Create React App)`이나 `Vue-cli`등을 이용하면
별다른 설정없이 Webpack을 이용한 번들링 또한 가능하다. 때문에 Webpack을 이용해서 설정파일(Configuration) 작성이나, Release condition에 따른 분기 또는
최적화에 대해서 잘 모르는 사람이 간혹 보인다. 물론 0(Zero) Configuration 추세가 되면서 설정에 대한 피로도 줄이고자 하는 노력이 커뮤니티에서 일어나고 있긴 하지만,
설정 파일에 대한 이해 없이는 사용하는데 한계가 있다. 이 문서에서는 실제 프로덕션에서도 유연하게 사용할 수 있는 설정파일을 한땀 한땀 만들어 가면서, 필요한 부분에 대해 설명하고자 한다. 

## Step 1
> 사전 준비

설정 파일을 만들기 전에, `package.json` 부터 작성해 보도록 하자. 아래 명령어를 실행해서 `package.json` 파일을 만들자.
```bash
$ npm init
```
기본적인 `package.json` 파일이 만들어지는데, 여기선 대부분 중요하지 않으므로 `script` 부분을 제외하고 삭제하도록 하겠다.
```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```
이제 `webpack`을 설치해 보도록 하자. webpack 4.0부터는 `webpack-cli`가 필요하므로 같이 설치해 주도록 하자.
```bash
$ npm install webpack webpack-cli --save-dev
```
이제 폴더 구조를 간단하게 잡아 보도록 하겠다.
```
 |- configs      // webpack.config는 여기에 정의
 |- node_modules 
 |- src          // 개발 resources는 여기에 정의
    |- css
    |- img
    |- js
    |- index.html
 |- package.json   
```
간략하게 configs에는 빌드와 관련된 설정파일을 모아두고, src에는 번들될 리소스들을 모아두도록 하자. 이제 간단하게 빌드에 필요한 `js/css/image/html` 파일들을 만들어 두도록하자. 
#### src/js/index.js
```js
import '../css/index.css';
const title = 'Webpack Configuration';
const $el = document.getElementById('root');

$el.innerHTML = `<h1>Hello World! ${title}</h1>`;
```
#### src/css/index.css
```css
h1 {
    font-size: 50px;
    color: #6495ed;
}
```
#### src/img/image.png
이미지는 아래 샘플을 사용하도록 하자.
<img src= "https://user-images.githubusercontent.com/10627668/50545189-bb3f9700-0c4e-11e9-9099-e24ba11256bc.png">

#### src/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>Step by Step Webpack Configuration</title>
</head>
<body>
    <div id="root"></div>
    <script src="/js/bundle.js"></script>
</body>
</html>
```
따라서 다음과 같은 구조가 되어야 한다.
```
 |- configs      // webpack.config는 여기에 정의
 |- node_modules 
 |- src          // 개발 resources는 여기에 정의
    |- css
        |- index.jss
    |- img
        |- image.png
    |- js
        |- index.js
    |- index.html
 |- package.json   
```

# Step 2
> 기본적인 webpack 설정 파일 만들기

이제 본격적으로 webpack 설정파일을 만들어 보도록 하자. configs폴더 안에 `webpack.config.js` 이름으로 파일을 만든다.
#### configs/webpack.config.js
```js
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../src/js/index.js'),
    output: {
        path: path.resolve(__dirname, '../dist/js'),
        filename: 'bundle.js'
    }
};
```
가장 기본적인 기능만 포함한 `webpack.config.js` 파일이다. entry는 파일의 진입점이 되는 경로를, output에는 최종적으로 번들링된 파일이 저장 될 경로를 설정한다. 실제 번들링을 해보도록 하자. 그러기 위해 먼저 `package.json`파일을 열고 `script`프로퍼티를 수정하도록하자.
#### package.json
```js
{
    "scripts": {
      "build": "webpack --config ./configs/webpack.config.js"
    },
    ...
}
```
`--config` 옵션을 사용하면 `webpack config`의 경로를 지정할 수 있다.
이제 터미널을 열고 다음 명령어를 실행한다.
```bash
$ npm run build
```
빌드를 실행하면 `dist/js/bundle.js` 파일이 생성된 것을 볼 수 있다.

# Step 3
> 개발 환경(development)과 빌드 환경(production) 분리하기

실제 현업에서는 개발 환경과 빌드 환경을 분리해서 작업한다. 개발 환경은 보통 `dev`, 빌드 환경은 `alpha`, `beta`, `rc`, `release`로 나눌 수 있다. 따라서 개발 환경과 빌드 환경을 나눠놓으면 설정파일을 관리하는데 많은 도움이 된다.

우선 개발 환경과 빌드 환경으로 설정파일을 나눠보도록 하자. 현재 configs폴더에는 `webpack.config.js`파일 하나만 들어있는데 이 파일을 크게 세 가지로 쪼갤 것이다.
```
configs
  |- webpack.config.common.js  // dev, prod 공통으로 사용할 설정
  |- webpack.config.dev.js     // 개발 환경에서만 사용할 설정
  |- webpack.config.prod.js    // 빌드 환경에서만 사용할 설정
```
간략하게 세 파일에 대해 설명하도록 하겠다.
- webpack.config.common.js
이 파일은 dev, prod 둘다 공통으로 사용하는 설정을 모아둔다. 예를 들면, `entry`나 `module(rule/loader, etc..)` 등이 여기에 포함된다.
- webpack.config.dev.js
이 파일은 개발 환경에서만 사용할 설정을 모아둔다. 예를 들면, `webpack-dev-server`, `dev-tool` 등이 있을 수 있다.
- webpack.config.prod.js
이 파일에는 빌드 환경에서만 사용할 설정을 모아둔다. 예를들면, `uglify`, `minify`, `static file fingerprint` 등이 있을 수 있다.

여기 까지 읽은 사람은 어떻게 나눈 것을 합쳐서 적용하는지 의문이 들 것이다. 이 파일들을 적절하게 환경에 따라 합쳐주는건 [webpack-merge](https://github.com/survivejs/webpack-merge)라는 라이브러리를 이용할 것이다. 따라서 webpack-merge를 사용하기 위해 설치하도록 하자.
```bash
$ npm install webpack-merge --save-dev
```
### webpack.config.common.js
먼저 webpack.config.common.js 파일을 작성하도록 하자. common에는 dev와 prod 모두 공통으로 사용하는 규칙들을 정의한다. 여기서는 entry를 정의하고, ES6를 사용하므로 babel을 추가하도록 하자. 실제 프레임워크를 도입한다면, 여기서 react, vue에 대한 loader를 정의한다.

babel을 사용하기 위해 관련된 디펜던시를 설치하자.
```bash
$ npm install @babel/cli @babel/core @babel/preset-env @babel/plugin-transform-runtime babel-loader --save-dev
```
이제 etnry와 rules를 정의한다.
```js
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../src/js/index.js'),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                        ]
                    }
                }
            }
        ]
    }
};
```
### webpack.config.dev.js
여기서는 개발 환경을 정의한다. webpack을 사용하면 보통 `webpack-dev-server`를 많이 사용하므로, 여기서는 개발 서버에 대한 정의를 다루도록 한다. 먼저 개발 서버를 설치하도록 하자.
```bash
$ npm install webpack-dev-server --save-dev
```
css를 js에 import해서 사용핳기 위해서는 몇 가지 로더가 더 loader 필요하다.
```bash
$ npm install style-loader css-lodaer --save-dev
```
`style-loader, css-lodaer` 로더들을 `dev`환경에만 적용하는 이유는, hot loading을 통해 빠른 css적용을 확인하기 위해서이고, 두번째로 빌드 환경에서는 따로 추출하기 때문이다. 이제 `webpack.config.dev.js`파일을 정의하자.

webpack 4.0에 새로 추가된 스펙중에 [mode](https://webpack.js.org/concepts/mode/) 라는 프로퍼티가 있다. 이 프로퍼티는 `development`와 `production` 두 가지를 상수 값으로 받는데, 이전에는 사용자가 주입 해줘야했던 `process.env.NODE_ENV` 변수라던가 `uglify` 같은 옵션들을 자동으로 적용해준다. 여기선 개발 환경이므로 `development`를 사용하도록 하자.
```js
const path = require('path');
const merge = require('webpack-merge');

const webpackConfigDev = {
    mode: 'development',

    // output을 여기서 정의하는 이유는 번들된 JS를 따로 하드디스크에 쓰지않고 메모리에 올려쓰기 위해서
    // 새로운 경로를 지정하기 때문이다.
    output: {
        path: path.resolve(__dirname, '../src/'),
        filename: 'bundle.js',
        publicPath: '/js'   // 빌드된 JS가 서빙될 path를 지정한다. html의 JS경로와 맞춰주도록 하자.
    },

    // CSS를 JS안에서 사용하기 위해 두 가지 로더를 추가한다.
    module: {
        rules: [{
            test: /\.css/,
            use: [
                'style-loader',
                'css-loader',
            ]
        }]
    },

    // webpack-dev-server에서 사용할 옵션이다. 이 부분에 대한 설명은 공식문서를 참고하도록 하자.
    devServer: {
        hot: false,
        host: '0.0.0.0',
        disableHostCheck: true,
        port: 3000,
        contentBase: path.resolve(__dirname, '../src'),
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        historyApiFallback: {
            rewrites: [
                { from: /.*/g, to: '/index.html' }
            ]
        }
    },

    // 소스맵을 지정한다.
    devtool: '#eval-source-map'
};

// webpack-merge를 이용하여 두가지 설정파일을 조합한다.
module.exports = merge(require('./webpack.config.common'), webpackConfigDev);
```
작성이 되었다면 `package.json` 파일에서 `script` 명령어를 수정하도록 하자.
```js
{
  "scripts": {
    "dev": "webpack-dev-server --config ./configs/webpack.config.dev.js" // 수정된 부분
  },
  ...
}
```
이제 터미널에 다음과 같이 입력한 후 http://localhost:3000/ 로 접속해보자.
```bash
$ npm run dev
```
아래와 같은 화면이 보인다면 성공한 것이다.
<img src="https://user-images.githubusercontent.com/10627668/50545508-458cf880-0c59-11e9-9f8a-35621a59d4e0.png">

파일을 수정하면 자동으로 화면이 업데이트 되는 것을 볼 수 있을 것이다. 약간 더 수정을 거치면 HMR(Hot Module Replacement)도 사용할 수 있으니 시간이 된다면 도전해 보도록 하자.

### webpack.config.prod.js
 `npm run dev` 명령어를 통해 로컬서버를 띄우고 개발이 어느정도 완료됬다면 이제 빌드를 할 차례이다. 실제 서빙되는 리소스들에는 번들된 javascript 파일은 물론이고, html, css, image들도 모두 포함되어야 한다. 따라서 배포되는 dist 폴더에는 다음과 같은 구조로 파일이 빌드되도록 할 것이다.
 ```
 dist
   |- css
   |- img
   |- js
   |- index.html
 ```
먼저 작성하기에 앞서 JS/CSS 캐싱 정책에 대해 간락하게 설명하도록 하겠다. 보통 서버 자원의 효율성을 높이기 의해서 static resources(js/css/image 등)들은 한번 받아오면, 브라우저에 캐시를 해서 같은 자원에 대해서는 다시 받아오지 않도록 한다. 보통 `max-age` Header를 이용해서 해당 시간 이내에 파일이 같다면 받아오지 않도록 하는데, 새로운 버전을 배포한다거나 급하게 수정할 일이 생기게 된다면 서버에서 새로 받아와야 한다(이런 경우를 대비해서 html은 캐싱하지 않음). 브라우저는 html에서 요청하는 파일명이 바뀌면 새로운 파일로 인식하게 되는데, 이 로직에 착안하여 파일을 요청할 때 쿼리스트링을 붙이거나, 파일명을 바꾸는 정책을 사용한다.
```
bundle.{fingerprint}.js
bundle.{fingerprint}.css
``` 
여기서는 파일명을 바꾸는 로직도 함께 적용해 보도록 하겠다. 여기서 이를 위해서 몇가지 webpack plugin을 사용한다.
- clean-webpack-plugin: 이전에 빌드된 파일을 제거하여 clean build를 하기위해 사용한다.
- html-webpack-plugin: `fingerprint`를 붙여주기 위해서는 동적으로 JS/CSS 경로를 지정해줘야한다. 동적으로 파일명 path를 붙여주기 위해 사용한다.
- copy-webpack-plugin: 이미지나 기타파일을 복사하기 위해 사용한다.
- mini-css-extract-plugin: css를 추출하기 위해 사용한다.

```bash
$ npm install clean-webpack-plugin html-webpack-plugin copy-webpack-plugin mini-css-extract-plugin --save-dev
```
동적으로 html의 file명을 만들기 위해서는 템플릿을 사용해야 하는데, 여기서는 [EJS](https://ejs.co/)를 사용할 것이다.
#### src/index.ejs
index.html을 index.ejs 파일로 변경하고 다음과 같이 `<%= {something} %>`을 사용해서 새로운 JS/CSS를 치환한다.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>Step by Step Webpack Configuration</title>
    <link rel="stylesheet" href="<%= htmlWebpackPlugin.options.staticResources.css %>" />
</head>
<body>
    <div id="root"></div>
    <script src="<%= htmlWebpackPlugin.options.staticResources.js %>"></script>
</body>
</html>
```

이제 `webpack.config.prod.js` 파일을 작성해 보도록 하자. 
```js
const path = require('path');
const merge = require('webpack-merge');

// Webpack Plugins.
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const webpackConfigCommon = require('./webpack.config.common');

// Fingerprint를 이용하여 JS/CSS file명 생성.
// 여기서는 timestamp 값을 이용한다.
const fingerprint = +new Date();
const jsFilename = `bundle.${fingerprint}.js`;
const cssFilename = `bundle.${fingerprint}.css`;

const webpackConfigProd = {
    mode: 'production',  // production mode를 사용하면 자동으로 uglify와 minify가 된다.
    output: {
        filename: jsFilename,
        path: path.resolve(__dirname, '../dist/js/') // JS file path를 지정한다.
    },
    // style-loader가 제가된 것을 볼 수 있다.
    // CSS 추출을 위해서 MiniCssExtractPlugin.loader를 사용한다.
    module: {
        rules: [{
            test: /\.css/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
            ]
        }]
    },
    plugins: [
        // Clean build를 위해 dist 폴더의 내용을 지운다.
        new CleanWebpackPlugin(['../dist'], {
            root: __dirname,
            allowExternal: true
        }),
        // ejs 템플릿의 JS/CSS 파일명을 치환한다.
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            filename: '../index.html',
            inject: false,
            staticResources: {
                js: `js/${jsFilename}`,
                css: `css/${cssFilename}`
            }
        }),
        // 이미지 파일을 복사한다.
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '../src/img'),
                to: path.join(__dirname, '../dist/img')
            },
        ]),
        // CSS file을 dist폴더로 추출한다.
        new MiniCssExtractPlugin({
            filename: `../css/${cssFilename}`,
        })
    ]
};

module.exports = merge(webpackConfigCommon, webpackConfigProd);
```
이제 `package.json`파일의 `script`를 수정해 보도록하자.
#### package.json
```js
{
    "scripts": {
    "dev": "webpack-dev-server --config ./configs/webpack.config.dev.js",
    "build": "webpack --config ./configs/webpack.config.prod.js"
  },
  ...
}
```
이제 다음 명령어를 실행해서 빌드해보도록 하자.
```bash
$ npm run build
```
`dist` 폴더에 이쁘게 번들되어 저장되는 것을 볼 수 있다. 이제 서버에서는 이 파일들을 그대로 경로에 맞춰서 배포해주기만 하면 된다.

#### webpack.config.dev.js
EJS로 템플릿이 변경되었으므로 dev환경도 조금 수정을 해주어야 사용할 수 있다. 개발 환경에서는 `src` 폴더에 `index.html`을 만들 필요가 있는데 이때 `html-webpack-harddisk-plugin`를 사용하면 조금 더 쉽게 `html`파일을 만들 수 있다.
```bash
$ npm install html-webpack-harddisk-plugin --save-dev
```
그리고 다음과 같이 수정해주도록 하자.
```js
const path = require('path');
const merge = require('webpack-merge');

/* 추가된 부분 시작 */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
/* 추가된 부분 끝 */

const webpackConfigDev = {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, '../src/'),
        filename: 'bundle.js',
        publicPath: '/js'
    },
    module: {
        rules: [{
            test: /\.css/,
            use: [
                'style-loader',
                'css-loader',
            ]
        }]
    },
    /* 추가된 부분 시작 */
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            filename: 'index.html',
            inject: false,
            alwaysWriteToDisk: true,
            staticResources: {
                js: '/js/bundle.js'
            }
        }),
        new HtmlWebpackHarddiskPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    /* 추가된 부분 끝 */
    devServer: {
        hot: false,
        host: '0.0.0.0',
        disableHostCheck: true,
        port: 3000,
        contentBase: path.resolve(__dirname, '../src'),
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        historyApiFallback: {
            rewrites: [
                { from: /.*/g, to: '/index.html' }
            ]
        }
    },

    devtool: '#eval-source-map'
};

module.exports = merge(require('./webpack.config.common'), webpackConfigDev);
```
이제 `npm run dev` 명령어를 실행하면 이쁘게 `index.html`파일이 생성되고, 개발 서버가 실행되는 모습을 볼 수 있다.

# Step 4
> 빌드 환경에 따라 분기하기

이전에 빌드 환경에는 `alpha`, `beta`, `rc`, `release`가 있다고 하였다. 그럼 빌드 4가지 빌드환경에 따라 동작을 다르게 하려면 어떻게 해야 할까? 바로 `process.env`, 즉 **환경 변수**를 이용하면 쉽게 분기가 가능하다.

환경 변수를 주입하는 방법에는 여러가지가 있는데 보통 [cross-env](https://github.com/kentcdodds/cross-env)를 많이 사용한다.
```bash
$ npm install cross-env --save-dev
```
사용법은 간단하다. npm으로 설치한 후에 명령어를 실행할 때 붙여주기만 하면 된다. 이제 `cross-env`를 사용하여 환경변수를 주입해 보도록 하자. `package.json`파일을 다음과 같이 수정한다.
#### package.json
```json
{
    "scripts": {
    "dev": "webpack-dev-server --config ./configs/webpack.config.dev.js",
    "build:alpha": "cross-env PHASE=alpha webpack --config ./configs/webpack.config.prod.js",
    "build:beta": "cross-env PHASE=beta webpack --config ./configs/webpack.config.prod.js",
    "build:rc": "cross-env PHASE=rc webpack --config ./configs/webpack.config.prod.js",
    "build:release": "cross-env PHASE=release webpack --config ./configs/webpack.config.prod.js"
  },
}
```
이제 `webpack.config.prod.js`에서 어떻게 주입되는지 확인하기 위해 로그를 찍어보도록 하자.
#### webpack.config.prod.js
```js
...
const fingerprint = +new Date();
const jsFilename = `bundle.${fingerprint}.js`;
const cssFilename = `bundle.${fingerprint}.css`;

console.log('[PHASE]', process.env.PHASE); // phase 를 출력해보자
...
```
빌드 명령어에 따라 다음과 같이 출력되는 것을 볼 수 있다.
```
$ npm run build:alpha    -> [PHASE] alpha
$ npm run build:beta     -> [PHASE] beta
$ npm run build:rc       -> [PHASE] rc
$ npm run build:release  -> [PHASE] release
```
이제 이 환경변수를 이용하여 적절하게 설정을 분기하면 된다. 한가지 예를 들어보자. 보통 `alpha` 환경에서는 디버깅을 위해 소스를 `uglify`하지 않는 경우도 있다. 따라서 `alpha` 환경에서만 `mode`를 `development`로 적용하여 빌드하고 싶다면, 다음과 같이 수정하도록 하자.
```js
const webpackConfigProd = {
    mode: process.env.PHASE === 'alpha' ? 'development' : 'production',
    output: {
        filename: jsFilename,
        path: path.resolve(__dirname, '../dist/js/')
    },
    ...
```

# 마치며
여기까지 잘 따라왔다면 앞으로 `CRA`, `Vue-cli` 없이도 쉽게 Webpack의 개발 환경을 구축할 수 있을 것이라 생각한다. 한번 작성해두면 보일러플레이트 처럼 여러 프로젝트에서 입맛에 맞게 추가/수정 할 수 있으므로, 다음 단계로 나만의 Webpack Configuration을 만들어 보는 것을 추천한다.
