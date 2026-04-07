const prisma = require('../config/database');

class RecruiterService {
  async getDashboard(userId) {
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId },
      include: { verification: true },
    });

    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    const totalInternships = await prisma.internship.count({ where: { recruiterId: recruiter.id } });
    const activeInternships = await prisma.internship.count({ where: { recruiterId: recruiter.id, isActive: true } });
    const totalApplications = await prisma.application.count({
      where: { internship: { recruiterId: recruiter.id } },
    });
    const shortlisted = await prisma.application.count({
      where: { internship: { recruiterId: recruiter.id }, status: 'SHORTLISTED' },
    });

    const recentApplications = await prisma.application.findMany({
      where: { internship: { recruiterId: recruiter.id } },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        internship: { select: { id: true, title: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take: 10,
    });

    const recentInternships = await prisma.internship.findMany({
      where: { recruiterId: recruiter.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      profile: recruiter,
      stats: { totalInternships, activeInternships, totalApplications, shortlisted },
      recentApplications,
      recentInternships,
    };
  }

  async getProfile(userId) {
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
        verification: true,
      },
    });

    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    return recruiter;
  }

  async updateProfile(userId, data) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.recruiter.update({
      where: { userId },
      data: {
        designation: data.designation,
        companyLogo: data.companyLogo,
        phone: data.phone,
        website: data.website,
        about: data.about,
      },
    });
  }

  async getApplicants(userId, internshipId, filters = {}) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    const where = { internship: { recruiterId: recruiter.id } };
    if (internshipId) where.internshipId = internshipId;
    if (filters.status) where.status = filters.status;

    const applicants = await prisma.application.findMany({
      where,
      include: {
        candidate: {
          include: {
            skills: true,
            education: { orderBy: { startDate: 'desc' }, take: 1 },
            preferences: true,
          },
        },
        internship: { select: { id: true, title: true, company: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Apply skill filters if provided
    if (filters.skills && filters.skills.length > 0) {
      return applicants.filter((app) => {
        const candidateSkills = app.candidate.skills.map((s) => s.name.toLowerCase());
        return filters.skills.some((skill) => candidateSkills.includes(skill.toLowerCase()));
      });
    }

    return applicants;
  }

  async shortlistCandidate(userId, applicationId) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    const application = await prisma.application.findFirst({
      where: { id: applicationId, internship: { recruiterId: recruiter.id } },
    });

    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.application.update({
      where: { id: applicationId },
      data: { status: 'SHORTLISTED' },
    });
  }

  async updateApplicationStatus(userId, applicationId, status) {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      const error = new Error('Recruiter profile not found');
      error.statusCode = 404;
      throw error;
    }

    const application = await prisma.application.findFirst({
      where: { id: applicationId, internship: { recruiterId: recruiter.id } },
      include: { candidate: true, internship: true },
    });

    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    // Create notification for the candidate
    await prisma.notification.create({
      data: {
        userId: application.candidate.userId,
        title: 'Application Status Updated',
        message: `Your application for "${application.internship.title}" has been ${status.toLowerCase()}.`,
        type: 'application',
      },
    });

    return updated;
  }
}

module.exports = new RecruiterService();
