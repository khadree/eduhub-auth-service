import { Router } from 'express';

import {
  getProfile,
  initiateSso,
  login,
  logout,
  refresh,
  register,
  requestPasswordReset,
  resetPassword,
  ssoCallback,
} from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/password/reset-request', requestPasswordReset);
router.post('/password/reset', resetPassword);
router.get('/me', authenticate(), getProfile);

router.get('/sso/:provider', initiateSso);
router.get('/sso/:provider/callback', ssoCallback);

export const authRoutes = router;
