const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/session/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: |
 *       Refreshes the access token using the refresh token stored in HttpOnly cookie.
 *       Only refreshes if user has been active within the last 15 minutes.
 *       Returns a new 5-minute access token.
 *       
 *       **Note**: This endpoint requires the refresh token cookie to be present.
 *       The refresh token is automatically set during login.
 *     tags: [Session]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token (valid for 5 minutes)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn:
 *                       type: integer
 *                       description: Token expiration time in seconds
 *                       example: 300
 *             examples:
 *               success:
 *                 summary: Token refreshed successfully
 *                 value:
 *                   success: true
 *                   data:
 *                     accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn: 300
 *       401:
 *         description: Session expired or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Session expired due to inactivity"
 *                 code:
 *                   type: string
 *                   example: "SESSION_EXPIRED"
 */
router.post('/refresh', SessionController.refreshToken);

/**
 * @swagger
 * /api/session/logout:
 *   post:
 *     summary: Logout user
 *     description: |
 *       Revokes the refresh token and clears the session cookie.
 *       This endpoint requires a valid access token.
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing access token
 */
router.post('/logout', authenticateToken, SessionController.logout);

/**
 * @swagger
 * /api/session/activity:
 *   post:
 *     summary: Update activity timestamp
 *     description: |
 *       Updates the last activity timestamp to keep session alive.
 *       This endpoint is called automatically by the frontend when user activity is detected.
 *       The refresh token cookie must be present.
 *     tags: [Session]
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity updated"
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired refresh token"
 */
router.post('/activity', SessionController.updateActivity);

/**
 * @swagger
 * /api/session/info:
 *   get:
 *     summary: Get session information
 *     description: |
 *       Returns session details including expiry time, last activity, and device information.
 *       This endpoint requires a valid access token.
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     lastActivity:
 *                       type: string
 *                       format: date-time
 *                       description: Last activity timestamp
 *                       example: "2025-01-22T10:30:00.000Z"
 *                     sessionExpiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Session expiration timestamp (15 minutes from last activity)
 *                       example: "2025-01-22T10:45:00.000Z"
 *                     secondsUntilExpiry:
 *                       type: integer
 *                       description: Seconds until session expires
 *                       example: 600
 *                     deviceInfo:
 *                       type: string
 *                       description: Device/user agent information
 *                       example: "Mozilla/5.0..."
 *             examples:
 *               activeSession:
 *                 summary: Active session info
 *                 value:
 *                   success: true
 *                   data:
 *                     lastActivity: "2025-01-22T10:30:00.000Z"
 *                     sessionExpiresAt: "2025-01-22T10:45:00.000Z"
 *                     secondsUntilExpiry: 600
 *                     deviceInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *       401:
 *         description: No active session or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No active session"
 */
router.get('/info', authenticateToken, SessionController.getSessionInfo);

module.exports = router;

