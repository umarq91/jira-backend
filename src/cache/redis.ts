import { createClient } from 'redis';

export const redis = createClient();

redis.on('error', err => console.log('Redis Client Error', err));


export async function connectRedis(){
try {
    
    await redis.connect();
    console.log("REDIS CONNECTED")

} catch (error) {
    console.log("Error COnnecting redis");
    
}
}