import { Request, Response } from "express";
import pool from "../db";

/**
 * Default: goes to backlog (sprint_id = NULL)
 */
export async function createIssue(req: Request, res: Response) {
  const { projectId, title, description, type, priority } = req.body;
  const reporterId = req.user?.userId;

  if (!projectId || !title) {
    return res
      .status(400)
      .json({ message: "projectId and title are required" });
  }

  try {
    const issue = await pool.query(
      `
      INSERT INTO issues
        (title, description, status, type, priority, project_id, reporter_id)
      VALUES
        ($1, $2, 'TODO', $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title,
        description || "",
        type || "bug",
        priority || "medium",
        projectId,
        reporterId,
      ]
    );

    res.status(201).json({ success: true, issue: issue.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}

export async function getIssue(req: Request, res: Response) {
  const { issueId } = req.params;

  try {
    const issue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
      issueId,
    ]);

    if (!issue.rows.length) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ success: true, issue: issue.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}

export async function getBacklogIssues(req: Request, res: Response) {
  const { projectId } = req.params;

  try {
    const issues = await pool.query(
      `
      SELECT *
      FROM issues
      WHERE project_id = $1
        AND sprint_id IS NULL
      ORDER BY created_at DESC
      `,
      [projectId]
    );

    res.json({ success: true, issues: issues.rows });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}

export async function getSprintIssues(req: Request, res: Response) {
  const { sprintId } = req.params;

  try {
    const issues = await pool.query(
      `
      SELECT *
      FROM issues
      WHERE sprint_id = $1
      ORDER BY created_at ASC
      `,
      [sprintId]
    );

    res.json({ success: true, issues: issues.rows });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}

/**
 * sprintId = null → backlog
 */
export async function moveIssue(req: Request, res: Response) {
  const { issueId } = req.params;
  const { sprintId } = req.body;

  try {
    const issue = await pool.query(
      `
      UPDATE issues
      SET sprint_id = $1
      WHERE id = $2
      RETURNING *
      `,
      [sprintId ?? null, issueId]
    );

    if (!issue.rows.length) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ success: true, issue: issue.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}

export async function updateIssueStatus(req: Request, res: Response) {
  const { issueId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  try {
    const issue = await pool.query(
      `
      UPDATE issues
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, issueId]
    );

    if (!issue.rows.length) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ success: true, issue: issue.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}

export async function assignIssue(req: Request, res: Response) {
  const { issueId } = req.params;
  const { assigneeId } = req.body;

  try {
    const issue = await pool.query(
      `
      UPDATE issues
      SET assignee_id = $1
      WHERE id = $2
      RETURNING *
      `,
      [assigneeId, issueId]
    );

    if (!issue.rows.length) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ success: true, issue: issue.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}

export async function deleteIssue(req: Request, res: Response) {
  const { issueId } = req.params;

  try {
    await pool.query(`DELETE FROM issues WHERE id = $1`, [issueId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}
