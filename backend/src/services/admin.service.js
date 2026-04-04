const prisma = require('../config/database');

class AdminService {
  async getDashboard() {
    const [totalUsers, totalCandidates, totalRecruiters, totalInternships, totalApplications, pendingVerifications] =
      await Promise.all([
        prisma.user.count(),
        prisma.candidate.count(),
        prisma.recruiter.count(),
        prisma.internship.count(),
        prisma.application.count(),
        prisma.recruiterVerification.count({ where: { status: 'PENDING' } }),
      ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        candidate: { select: { firstName: true, lastName: true } },
        recruiter: { select: { companyName: true, isVerified: true } },
      },
    });

    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return {
      stats: { totalUsers, totalCandidates, totalRecruiters, totalInternships, totalApplications, pendingVerifications },
      recentUsers,
      applicationsByStatus,
    };
  }

  async getUsers(filters = {}) {
    const where = {};
    if (filters.role) where.role = filters.role;
    if (filters.search) {
      where.email = { contains: filters.search, mode: 'insensitive' };
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          candidate: { select: { firstName: true, lastName: true, profileStrength: true } },
          recruiter: { select: { companyName: true, isVerified: true } },
          admin: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async toggleUserStatus(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });
  }

  async getPendingVerifications() {
    return prisma.recruiterVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        recruiter: {
          include: {
            user: { select: { email: true, createdAt: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewVerification(adminUserId, verificationId, status, notes) {
    const admin = await prisma.admin.findUnique({ where: { userId: adminUserId } });
    if (!admin) {
      const error = new Error('Admin profile not found');
      error.statusCode = 404;
      throw error;
    }

    const verification = await prisma.recruiterVerification.findUnique({
      where: { id: verificationId },
      include: { recruiter: true },
    });

    if (!verification) {
      const error = new Error('Verification request not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.recruiterVerification.update({
      where: { id: verificationId },
      data: {
        status,
        notes,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    });

    // Update recruiter verified status
    if (status === 'APPROVED') {
      await prisma.recruiter.update({
        where: { id: verification.recruiterId },
        data: { isVerified: true },
      });
    }

    // Notify recruiter
    await prisma.notification.create({
      data: {
        userId: verification.recruiter.userId,
        title: 'Verification Update',
        message: `Your verification has been ${status.toLowerCase()}.${notes ? ' Note: ' + notes : ''}`,
        type: 'verification',
      },
    });

    return updated;
  }

  async getPlatformStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [newUsersThisMonth, newInternshipsThisMonth, newApplicationsThisMonth] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.internship.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.application.count({ where: { appliedAt: { gte: thirtyDaysAgo } } }),
    ]);

    return { newUsersThisMonth, newInternshipsThisMonth, newApplicationsThisMonth };
  }
}

module.exports = new AdminService();
