#!/bin/bash


dist_dir="/data/services/zhisui_mgr_core"

# build the project
echo "Building the project..."
pnpm build

pm2 stop zhisui_mgr_core

# copy the dist directory to the release directory
echo "Copying the dist directory to the release directory..."
rm -rf $dist_dir
mkdir -p $dist_dir
cp -r ./dist $dist_dir/
cp ./ecosystem.config.js $dist_dir/
cp ./package.json $dist_dir/
cp ./pnpm-lock.yaml $dist_dir/
cp ./.env.product $dist_dir/.env
cp -r ./prisma $dist_dir/
cp -r ./ssl $dist_dir/
cp -r ./bin $dist_dir/

cd $dist_dir  

pnpm install  

pnpm generate

pnpm deploydb

pnpm seed

pm2 restart ecosystem.config.js




