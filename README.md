# 植物科学速览

一个用于追踪植物科学论文的静态网站原型。

## 功能

- 按领域展示植物科学论文
- 读取 `data/papers.json` 中的每日更新数据
- 支持搜索、排序和领域筛选
- 通过 GitHub Actions 每天自动抓取 Crossref 数据
- 通过 GitHub Pages 发布为公开网站

## 发布

1. 将本项目推送到 GitHub 仓库的 `main` 分支。
2. 打开 GitHub 仓库的 `Settings`。
3. 进入 `Pages`。
4. 将 `Build and deployment` 的 `Source` 设置为 `GitHub Actions`。
5. 打开 `Actions` 页面，手动运行 `Update and publish site`，或等待每天自动运行。

发布后，网站地址通常是：

```text
https://你的GitHub用户名.github.io/仓库名/
```
