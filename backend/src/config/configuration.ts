export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || 'student',
    database: process.env.POSTGRES_DB || 'kupipodariday',
    synchronize: process.env.NODE_ENV === 'production' ? false : true,
  },
  jwt_secret: process.env.JWT_SECRET || 'defaultSecretKey',
});
