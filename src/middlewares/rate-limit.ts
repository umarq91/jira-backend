import { NextFunction, Request, Response } from "express";

class TokeBucket {

    private capacity:number;
    private tokens : number;
    private refillRate:number;
    private lastREfill:number;
    constructor({capacity,refillRate}:any){
        this.capacity = capacity;
        this.tokens = capacity // start with full capacity;
        this.refillRate = refillRate;
        this.lastREfill = Date.now(); // timestamp for the last refill;
    }

    refill(){
        const now = Date.now();
        const secondsPassed = (now - this.lastREfill) / 1000; // check the last refill time
        const tokensToAdd = secondsPassed * this.refillRate;

        this.tokens = Math.min(this.capacity,this.tokens + tokensToAdd) // check that doesn't excee the limit;
        this.lastREfill = now
    };


    consume(tokens=1){

        this.refill();
        if(this.tokens >= tokens){
            this.tokens -= tokens;
            return true
        }else{
            return false
        }
    }
}


const maps = new Map<string,any>();


export function rateLimiter({capacity,refillRate}:any){

  return (req:Request,res:Response,next:NextFunction)=>{
      const userId = req.ip ?? "unknown";


    if(!maps.has(userId)){
        maps.set(userId,new TokeBucket({capacity,refillRate}))
    }   

    const bucket = maps.get(userId);
    if(bucket.consume()){
        return next()
    }else{
        res.status(429).json({message:"TOO MANY REQUESTS"})
    }
  }

}