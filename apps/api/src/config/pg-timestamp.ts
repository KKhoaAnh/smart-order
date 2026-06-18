/* eslint-disable @typescript-eslint/no-require-imports */
const { types } = require('pg') as {
  types: { setTypeParser: (oid: number, parser: (value: string) => Date) => void };
};

/**
 * PostgreSQL TIMESTAMP (without time zone) lưu giá trị UTC (session DB = UTC).
 * node-pg mặc định parse theo TZ của Node (Asia/Ho_Chi_Minh) → lệch 7 giờ.
 * Ép parse là UTC trước khi TypeORM mở connection.
 */
const TIMESTAMP_OID = 1114;

types.setTypeParser(TIMESTAMP_OID, (value: string) => {
  return new Date(`${value.replace(' ', 'T')}Z`);
});
