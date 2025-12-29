import { Request, Response } from "express";
import pool from "../db";

/**
 * Create sprint
 */
export const createSprint = async (req: Request, res: Response) => {
  const { label, description, start_date, end_date } = req.body;
  const { projectId } = req.params;
  const userId = req.user?.userId;

  if (!label) {
    return res.status(400).json({ message: "Sprint label is required" });
  }

  const sprint = await pool.query(
    `
    INSERT INTO sprints
      (label, description, project_id, start_date, end_date, created_by)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [label, description, projectId, start_date, end_date, userId]
  );

  res.status(201).json(sprint.rows[0]);
};

/**
 * Get all sprints of a project
 */
export const getProjectSprints = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const sprints = await pool.query(
    `
    SELECT *
    FROM sprints
    WHERE project_id = $1
    ORDER BY created_at DESC
    `,
    [projectId]
  );

  res.json(sprints.rows);
};

/**
 * Start sprint (only one active sprint per project)
 */
export const startSprint = async (req: Request, res: Response) => {
  const { id } = req.params;

  // get sprint
  const sprint = await pool.query(`SELECT * FROM sprints WHERE id = $1`, [id]);

  if (!sprint.rows.length) {
    return res.status(404).json({ message: "Sprint not found" });
  }

  const { project_id } = sprint.rows[0];

  // stop other active sprint
  await pool.query(
    `
    UPDATE sprints
    SET status = 'completed'
    WHERE project_id = $1 AND status = 'active'
    `,
    [project_id]
  );

  // start this sprint
  const updated = await pool.query(
    `
    UPDATE sprints
    SET status = 'active', start_date = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  res.json(updated.rows[0]);
};

/**
 * Complete sprint
 */
export const completeSprint = async (req: Request, res: Response) => {
  const { id } = req.params;

  const sprint = await pool.query(
    `
    UPDATE sprints
    SET status = 'completed', end_date = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  if (!sprint.rows.length) {
    return res.status(404).json({ message: "Sprint not found" });
  }

  res.json(sprint.rows[0]);
};

/**
 * Delete sprint
 */
export const deleteSprint = async (req: Request, res: Response) => {
  const { id } = req.params;

  await pool.query(`DELETE FROM sprints WHERE id = $1`, [id]);

  res.status(204).send();
};
