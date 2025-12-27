import { Request, Response } from "express";
import pool from "../db";

export async function createIssue(req: Request, res: Response) {
  const { projectId, title, description, type, priority } = req.body;
  const reporterId = req.user?.userId;
  try {
    const newIssue = await pool.query(
      `INSERT INTO issues(title,description,status,type,priority,project_id,reporter_id) 
      VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *
      `,
      [
        title || "issues ",
        description || "",
        "TODO",
        type || "bug",
        priority || "medium",
        projectId,
        reporterId,
      ]
    );

    return res.json({
      success: true,
      message: "ticket Successfully created",
      issue: newIssue.rows[0],
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
}

export const getIssues = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
  const response =   await pool.query(`SELECT * from issues where project_id=$1`, [projectId]);
return res.json({
    success:true,
    issues:response.rows
})  
} catch (error) {}
};
