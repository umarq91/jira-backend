import { Request, Response } from "express";
import pool from "../db";
import { ROLES } from "../types";
import { getUserProjectRole } from "../utils";
import { redis } from "../cache/redis";

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, description = "" } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO projects (title, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title.trim(), description, userId]
    );

    return res.status(201).json({
      success: true,
      project: rows[0],
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rows, rowCount } = await pool.query(
      "SELECT created_by FROM projects WHERE id = $1",
      [projectId]
    );

    if (!rowCount) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (Number(rows[0].created_by) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this project",
      });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [projectId]);

    return res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   GET OWN PROJECTS
========================= */
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cachedKey = `projects-user:${userId}`;
    const cachedValue = await redis.get(cachedKey);
    if (cachedValue) {
      return res.json({
        success: true,
        projects: JSON.parse(cachedValue),
      });
    }
    const { rows } = await pool.query(
      "SELECT * FROM projects WHERE created_by = $1",
      [userId]
    );

    await redis.setex(cachedKey, 60, JSON.stringify(rows));
    return res.json({ success: true, projects: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const cacheKey = `project:${projectId}:user:${userId}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        project: JSON.parse(cached),
      });
    }

    const { rows, rowCount } = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );

    if (!rowCount) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (Number(rows[0].created_by) !== Number(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await redis.setex(cacheKey, 60, JSON.stringify(rows[0]));

    return res.json({
      success: true,
      source: "db",
      project: rows[0],
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/* =========================
   ADD MEMBER
========================= */
export const addMemberInProject = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId!;
    const { projectId } = req.params;
    const { userId: memberId, role = ROLES.MEMBER } = req.body;

    const userRole = await getUserProjectRole(adminId, Number(projectId));

    if (userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can add members",
      });
    }

    await pool.query(
      `
      INSERT INTO project_members (user_id, project_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      `,
      [memberId, projectId, role]
    );

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const cacheKey = `project:${projectId}:members`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        members: JSON.parse(cached),
      });
    }

    const { rows } = await pool.query(
      `
      SELECT u.id, u.username, pm.role
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = $1
      `,
      [projectId]
    );

    await redis.setex(cacheKey, 60, JSON.stringify(rows));

    return res.json({
      success: true,
      source: "db",
      members: rows,
    });
  } catch {
    return res.status(500).json({ success: false });
  }
};


/* =========================
   GET MY (MEMBER) PROJECTS
========================= */
export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cacheKey = `user:${userId}:member-projects`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        projects: JSON.parse(cached),
      });
    }

    const { rows } = await pool.query(
      `
      SELECT p.*
      FROM project_members pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.user_id = $1
      `,
      [userId]
    );

    await redis.setex(cacheKey, 60, JSON.stringify(rows));

    return res.json({ success: true, source: "db", projects: rows });
  } catch {
    return res.status(500).json({ success: false });
  }
};


/*
Only ADMIN
Cannot remove project owner
Admin can remove other admins
*/

export const removeMemberFromProject = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId!;
    const { projectId, userId } = req.params;

    const adminRole = await getUserProjectRole(adminId, Number(projectId));

    if (adminRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can remove members",
      });
    }

    // Prevent removing owner
    const ownerCheck = await pool.query(
      "SELECT created_by FROM projects WHERE id = $1",
      [projectId]
    );

    if (Number(ownerCheck.rows[0].created_by) === Number(userId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove project owner",
      });
    }

    await pool.query(
      `
      DELETE FROM project_members
      WHERE project_id = $1 AND user_id = $2
      `,
      [projectId, userId]
    );

    return res.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};
