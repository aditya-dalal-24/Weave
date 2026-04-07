const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const prisma = require('../config/database');
const { OAuth2Client } = require('google-auth-library');
const { sendOtpEmail } = require('../utils/email.util');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  async register({ email, password, role, firstName, lastName, companyName }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        isVerified: false,
        otp,
        otpExpiry,
        ...(role === 'CANDIDATE' && {
          candidate: {
            create: {
              firstName: firstName || '',
              lastName: lastName || '',
            },
          },
        }),
        ...(role === 'RECRUITER' && {
          recruiter: {
            create: {
              companyName: companyName || '',
              verification: {
                create: { status: 'PENDING' },
              },
            },
          },
        }),
        ...(role === 'ADMIN' && {
          admin: {
            create: {
              firstName: firstName || '',
              lastName: lastName || '',
            },
          },
        }),
      },
      select: { id: true, email: true, role: true },
    });

    // Send email asynchronously
    sendOtpEmail(email, otp).catch(err => console.error('Failed to send OTP email:', err));

    return { 
      message: 'Verification code sent to your email',
      email: user.email 
    };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true } },
        admin: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isVerified) {
      const error = new Error('Email not verified');
      error.statusCode = 403;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password: _, refreshToken: __, ...userData } = user;

    return { user: userData, ...tokens };
  }

  async googleLogin(accessToken, rolePreference = 'CANDIDATE') {
    let googleProfile;
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      googleProfile = response.data;
    } catch (err) {
      console.error('Google Token Verification Error:', err.response?.data || err.message);
      const error = new Error('Invalid Google token');
      error.statusCode = 401;
      throw error;
    }

    const { email, sub: googleId, given_name, family_name, picture } = googleProfile;

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true } },
        admin: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    if (user) {
      if (!user.googleId || user.authProvider === 'LOCAL') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, authProvider: 'GOOGLE', isVerified: true },
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true } },
            admin: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        });
      }
    } else {
      const role = (rolePreference === 'RECRUITER' || rolePreference === 'CANDIDATE') ? rolePreference : 'CANDIDATE';
      
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          authProvider: 'GOOGLE',
          role,
          isVerified: true,
          ...(role === 'CANDIDATE' && {
            candidate: {
              create: {
                firstName: given_name || '',
                lastName: family_name || '',
                avatar: picture || null,
              },
            },
          }),
          ...(role === 'RECRUITER' && {
            recruiter: {
              create: {
                companyName: `${given_name || 'User'}'s Company`,
                companyLogo: picture || null,
                verification: {
                  create: { status: 'PENDING' },
                },
              },
            },
          }),
        },
        include: {
          candidate: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true } },
          admin: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      });
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password: _, refreshToken: __, ...userData } = user;
    return { user: userData, ...tokens };
  }

  async refreshToken(token) {
    if (!token) {
      const error = new Error('Refresh token required');
      error.statusCode = 401;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, refreshToken: true, isActive: true },
    });

    if (!user || !user.isActive || user.refreshToken !== token) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async verifyOtp({ email, otp }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('Email already verified');
    if (!user.otp || user.otp !== otp) throw new Error('Invalid verification code');
    if (new Date() > user.otpExpiry) throw new Error('Verification code expired');

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otp: null, otpExpiry: null },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true } },
        admin: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    const tokens = this.generateTokens(updatedUser);
    await this.saveRefreshToken(updatedUser.id, tokens.refreshToken);

    const { password: _, refreshToken: __, ...userData } = updatedUser;
    return { user: userData, ...tokens };
  }

  async resendOtp(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('Email already verified');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });

    await sendOtpEmail(email, otp);
    return { success: true, message: 'New verification code sent' };
  }

  async saveRefreshToken(userId, refreshToken) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}

module.exports = new AuthService();
