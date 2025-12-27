import pool from "../db";
import { ROLES } from "../types";

export const getUserProjectRole = async (
  userId: number,
  projectId: number
): Promise<ROLES | null> => {
  const ownerRes = await pool.query(
    "SELECT created_by FROM projects WHERE id = $1",
    [projectId]
  );

  if (!ownerRes.rowCount) return null;

  if (Number(ownerRes.rows[0].created_by) === Number(userId)) {
    return ROLES.ADMIN;
  }

  const memberRes = await pool.query(
    `
    SELECT role
    FROM project_members
    WHERE user_id = $1 AND project_id = $2
    `,
    [userId, projectId]
  );

  return memberRes.rowCount ? memberRes.rows[0].role : null;
};
