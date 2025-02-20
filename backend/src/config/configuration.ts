export default () => ({
  port: parseInt(process.env.PORT, 10),
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: process.env.NODE_ENV === 'development',
  },
  jwt_secret: process.env.JWT_SECRET
});
