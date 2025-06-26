
DROP TABLE IF EXISTS click_records CASCADE;

-- 创建点击记录表
CREATE TABLE IF NOT EXISTS click_records (
  id BIGINT PRIMARY KEY DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_ip TEXT,
  click_count BIGINT DEFAULT 0
);

-- 创建更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_click_records_updated_at 
    BEFORE UPDATE ON click_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 创建原子递增函数
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS BIGINT AS $$
DECLARE
    new_count BIGINT;
BEGIN
    -- 使用原子操作递增计数器
    INSERT INTO click_records (id, click_count) 
    VALUES (1, 1)
    ON CONFLICT (id) 
    DO UPDATE SET 
        click_count = click_records.click_count + 1,
        updated_at = NOW()
    RETURNING click_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- 插入初始记录
INSERT INTO click_records (id, click_count) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;

-- 启用行级安全策略（RLS）
ALTER TABLE click_records ENABLE ROW LEVEL SECURITY;

-- 创建策略允许所有用户读取和更新
CREATE POLICY "Enable read access for all users" ON click_records
    FOR SELECT USING (true);

CREATE POLICY "Enable update access for all users" ON click_records
    FOR UPDATE USING (true);

CREATE POLICY "Enable insert access for all users" ON click_records
    FOR INSERT WITH CHECK (true);
