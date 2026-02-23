# Contributing

感谢你对本项目的关注！欢迎提交 issue、改进文档或发起 pull request。

贡献流程（简要）：

1. Fork 本仓库
2. 创建功能分支：
   git checkout -b feature/your-feature
3. 在分支上进行更改并编写清晰的提交信息
4. 提交并推送分支：
   git push origin feature/your-feature
5. 打开 Pull Request，描述你的变更并关联 issue（如有）

代码风格与检查：
- 前端使用 Vite + ESLint（项目提供脚本 `npm run lint`），请在提交前运行检查。
- 后端也包含 `npm run lint`（在 `backend` 目录下运行）。

开发者提示：
- 在本地开发请使用 `backend/.env`（或根目录 `.env`，参照 `.env.example`），不要提交真实的凭据。
- 若你的改动包含数据库迁移，请在 PR 描述中包含迁移说明。

非常感谢你的贡献！
