import logger from '#config/logger.js';
import { signInSchema, signUpSchema } from '#validations/auth.validation.js';
import { formatValidationsError } from '#utils/format.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signUp = async (req, res, next) => {
  try {
    const vlaidationResult = signUpSchema.safeParse(req.body);

    if (!vlaidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationsError(vlaidationResult.error),
      });
    }

    const { name, email, role, password } = vlaidationResult.data;

    const user = await createUser({ name, email, password, role });

    if (!user) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User registered with email ${email}`);

    res.status(201).json({
      message: 'User registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Signup error', error);

    if (error.message === 'User already exist') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    if (error.message === 'Error creating user') {
      return res.status(500).json({ error: 'Error creating user' });
    }

    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser(email, password);

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User logged in with email ${email}`);

    return res.status(200).json({
      message: 'User logged in',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Signin error', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (error.message === 'Error authenticating user') {
      return res.status(500).json({ error: 'Error authenticating user' });
    }

    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    cookies.clearCookie(res, 'token');
    logger.info('User logged out');

    return res.status(200).json({
      message: 'User logged out',
    });
  } catch (error) {
    logger.error('Signout error', error);
    next(error);
  }
};
