import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { decode } from "node:punycode";
import { ROLES, User } from "../types";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return  res.json({
        success: false,
        message: "Unauthorized, Provide a token",
      });
    }

    const token = authHeader?.split(" ")[1];

    const decoded = jwt.verify(token as string, config.jwt_secret);
    req.user = decoded as User;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ msg: "Unπauthorized. Please add valid token" ,error});
  }
};



export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
      const role = req.user?.role
      if(role !== ROLES.ADMIN){
        return res.json({
          success:false,
          message:"Only Admins are allowed to add members"
        })
      }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ msg: "Unauthorized. Please add valid token" ,error});
  }
};
