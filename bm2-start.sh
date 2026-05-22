#!/usr/bin/env bash

bm2 start dist/main.js \
--name mgr-service \
--env NODE_ENV=production \
--env PORT=9000 \
--env DATABASE_URL="postgresql://postgres:zhisui123@10.242.0.20:5432/zouwu?schema=public" \
--env FEISHU_MAINTENANCE_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/790cd928-64f5-49e0-8fa5-dbd672d90226



