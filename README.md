# Subzify

轻量级订阅管理与到期提醒服务。自托管、单用户，支持多币种换算、分类管理，以及 Bark / Telegram 到期推送。

## 功能

- 订阅管理：金额、币种、计费周期、到期日、自动续订
- 分类管理
- 多币种 → CNY 汇率自动换算与缓存
- 到期提醒：可配置提前天数及每日推送时间
- 推送通道：Bark、Telegram Bot
- 单用户密码登录（iron-session）

## 技术栈

Next.js 16 (App Router) · React 19 · Prisma 7 + better-sqlite3 · Tailwind CSS 4 · shadcn/ui + Base UI · node-cron

## 使用 Docker 部署（推荐）

镜像已由 GitHub Actions 自动构建并推送到 GHCR。

```bash
mkdir -p data
# 如果有旧的 SQLite 数据库，放到 ./data/subzify.db
docker compose up -d
```

默认端口为 `8300`，访问 `http://<host>:8300`。

`docker-compose.yml` 示例：

```yaml
services:
  subzify:
    image: ghcr.io/qi1eat9fat/subzify:latest
    container_name: subzify
    ports:
      - "8300:8300"
    environment:
      - IRON_SESSION_SECRET=<至少 32 字符的随机串>
      - DATABASE_URL=file:/app/data/subzify.db
      - TZ=Asia/Shanghai
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

生成 session secret：

```bash
openssl rand -base64 48
```

## 本地开发

```bash
npm install
npx prisma migrate dev
npm run dev
```

访问 `http://localhost:3000`。首次访问会进入初始化页面设置管理密码。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `IRON_SESSION_SECRET` | 会话加密密钥，至少 32 字符 |
| `DATABASE_URL` | SQLite 数据库路径，如 `file:/app/data/subzify.db` |
| `TZ` | 容器时区，推送调度按此时区执行 |

Bark / Telegram 的 Token 与 Key 在 Web UI 的「系统设置」中配置，存储于数据库。

## 数据持久化

所有数据位于挂载卷中的 SQLite 文件（默认 `./data/subzify.db`）。
