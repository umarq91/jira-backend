import { Request, Response } from "express";
import pool from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";

// TODO: add zod validation
export async function signUp(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const isUserAvailable = await pool.query(
      "Select * from users where email=$1",
      [email]
    );
    if (isUserAvailable.rows.length > 0) {
      return res
        .json({
          message: "User already exists",
          status: 409,
        })
        .status(409);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hashSync(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username,email,password) VALUES ($1,$2,$3)",
      ["Sampe User", email, hashedPass]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.log("Errorrrr");
    res.json({
      message: "Something went wrong",
      status: 500,
      error: error,
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const doesUserExist = await pool.query(
      "Select * from users where email=$1",
      [email]
    );
    if (!doesUserExist.rows[0]) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // match password
    const comparePassword = await bcrypt.compare(
      password,
      doesUserExist.rows[0].password
    );
    if (!comparePassword) {
      return res.status(200).json({ error: "Wrong credentials" });
    }
    const payload = {
      userId: doesUserExist.rows[0].id,
      username: doesUserExist.rows[0].username,
      role:doesUserExist.rows[0].role
    };
    const token = jwt.sign(payload, config.jwt_secret);

    res.status(200).json({
      success: true,
      message: "User created succssfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await pool.query("select * from users where id=$1", [
      req.user?.userId,
    ]);
    return res.json({
      success: true,
      user: user.rows[0],
    });
  } catch (error) {}
}
