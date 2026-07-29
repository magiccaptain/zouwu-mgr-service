-- ATPConfig.branch_id 由 text 改为 int。
-- PG 实测现有值均为纯数字且无前导零，::integer 转换无损。
ALTER TABLE "ATPConfig" ALTER COLUMN "branch_id" TYPE INTEGER USING "branch_id"::integer;
