# 单一 HTML 文件（single.html）

如果你想把这个项目打包成 **一个单独的 HTML 文件**（方便拷贝/发给别人），可以用下面的命令生成 `single.html`：

环境要求：
- Node.js **>= 18.18.0**（你现在的 Node 18.0.0 会导致 Vite 启动时报错）

```bash
npm install
npm run build:single
```

生成结果：
- 项目根目录会出现 `single.html`
- `dist/` 仍会正常生成（用于调试/对比）

注意：
- 目前项目里的猫/狗图片来自在线的 Unsplash 链接（不是本地资源），所以即使是单一 HTML 文件，离线打开时图片仍需要网络。


  # Music Game Card Lighting

  This is a code bundle for Music Game Card Lighting. The original project is available at https://www.figma.com/design/f7PT799JwfSG9KRWIAuBON/Music-Game-Card-Lighting.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

In case low level npm:
```
nvm install 20
nvm use 20
node -v
npm install
npm run build:single
```