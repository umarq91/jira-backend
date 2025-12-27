import { Request, Response } from "express";
import { resolveSoa } from "node:dns";
import pool from "../db";
import { ROLES } from "../types";

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, description = "" } = req.body;

    // Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    // 3Insert project
    const result = await pool.query(
      `
      INSERT INTO projects (title, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, created_by, created_at
      `,
      [title.trim(), description, userId]
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    //  Check if project exists
    const projectResult = await pool.query(
      "SELECT id, created_by FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projectResult.rows[0];

    // Authorization check
    if (Number(project.created_by) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this project",
      });
    }

    //  Delete project
    await pool.query("DELETE FROM projects WHERE id = $1", [projectId]);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.userId;
    const response = await pool.query(
      "SELECT * from projects where created_by=$1",
      [userId]
    );
    console.log("RESSPONSEE", response);
    const projects = response.rows;
    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.log("ERRRORRR", error);
    return res.status(500).json({
      success: false,
      message: "Something went Wrong",
    });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req?.user?.userId;
    const response = await pool.query("SELECT * from projects where id=$1", [
      projectId,
    ]);
    console.log("RESPONSE", response);
    if (Number(userId) != Number(response.rows[0].created_by)) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this project...",
      });
    }

    const project = response.rows[0];
    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went Wrong",
    });
  }
};

export const addMemberInProject = async (req: Request, res: Response) => {
  try {
    const userToAdd = req.body.userId;
    const { projectId } = req.params;
    const adminId = req?.user?.userId;
    const response = await pool.query("SELECT * from projects where id=$1", [
      projectId,
    ]);

    if (response.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "PROJECT DOES NOT EXIST",
      });
    }
    if (Number(adminId) != Number(response.rows[0].created_by)) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this project...",
      });
    }

    await pool.query(
      "INSERT INTO project_members(user_id,project_id,role) VALUES($1,$2,$3)",
      [userToAdd, projectId, ROLES.MEMBER]
    );

    return res.status(201).json({
      success: true,
      message: "User Successfully Added to project",
    });
  } catch (error) {
    console.error("ERRORRR", error);
    return res.status(500).json({
      success: false,
      message: "Something went Wrong",
    });
  }
};

export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const response = await pool.query(
      "SELECT * from project_members WHERE project_id=$1 AND user_id=$2",
      [projectId, userId]
    );

    return res.json({
      projects: response.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "SOmething went wrong",
      error: error,
    });
  }
};

export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const userId = 3;
    const response = await pool.query(
      `SELECT p.* from project_members pm INNER JOIN projects p ON pm.project_id = p.id where pm.user_id=$1 
  `,
      [userId]
    );

    return res.json({
      success: true,
      projects: response.rows,
    });
  } catch (error) {
    console.log("ERRORRR", error);
    return res.json({
      message: "Something went wrong.",
    });
  }
};
