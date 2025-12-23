import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  db_user:string;
  db_database:string;
  db_host:string;
  db_port:number;
  jwt_secret:string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  db_user:process.env.POSTGRES_USERNAME || "",
  db_database:process.env.POSTGRES_DATABASE || "",
  db_host:process.env.POSTGRES_HOST || "localhost",
  db_port:Number(process.env.POSTGRES_PORT) || 5432,
  jwt_secret:process.env.JWT_SECRET || "random123"
};




export default config;
