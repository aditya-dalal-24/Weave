const axios = require('axios');
const prisma = require('../config/database');

class RecommendationService {
  async getRecommendations(userId) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        skills: true,
        education: { orderBy: { startDate: 'desc' } },
        preferences: true,
        applications: { select: { internshipId: true } },
      },
    });

    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    // Get active internships the candidate hasn't applied to already
    const appliedIds = candidate.applications.map((a) => a.internshipId);
    const internships = await prisma.internship.findMany({
      where: {
        isActive: true,
        id: { notIn: appliedIds },
        ...(candidate.preferences?.types?.length > 0
          ? { type: { in: candidate.preferences.types } }
          : {}),
      },
      include: {
        recruiter: { select: { companyName: true, companyLogo: true, isVerified: true } },
      },
    });

    if (internships.length === 0) {
      return [];
    }

    // Try AI service first, fallback to local scoring
    try {
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const response = await axios.post(
        `${aiUrl}/recommend`,
        {
          candidate: {
            skills: candidate.skills.map((s) => ({ name: s.name, proficiency: s.proficiency })),
            education: candidate.education.map((e) => ({
              degree: e.degree,
              field: e.field,
              institution: e.institution,
            })),
            preferences: candidate.preferences
              ? {
                  locations: candidate.preferences.locations,
                  types: candidate.preferences.types,
                  industries: candidate.preferences.industries,
                  minStipend: candidate.preferences.minStipend,
                }
              : null,
          },
          internships: internships.map((i) => ({
            id: i.id,
            title: i.title,
            company: i.company,
            skills: i.skills,
            type: i.type,
            location: i.location,
            industry: i.industry,
            stipend: i.stipend,
            description: i.description,
          })),
        },
        { timeout: 5000 }
      );

      // Merge AI scores with full internship data
      const scoreMap = {};
      response.data.recommendations.forEach((r) => {
        scoreMap[r.internship_id] = r;
      });

      const results = internships
        .map((internship) => {
          const score = scoreMap[internship.id];
          return {
            ...internship,
            matchScore: score ? score.match_score : 0,
            matchBreakdown: score ? score.breakdown : null,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      return results;
    } catch (err) {
      console.warn('AI service unavailable, using fallback scoring:', err.message);
      return this.fallbackScoring(candidate, internships);
    }
  }

  fallbackScoring(candidate, internships) {
    const candidateSkills = candidate.skills.map((s) => s.name.toLowerCase());

    return internships
      .map((internship) => {
        let skillScore = 0;
        let prefScore = 0;
        let eduScore = 0;

        // Skills match (50%)
        if (internship.skills.length > 0 && candidateSkills.length > 0) {
          const internSkills = internship.skills.map((s) => s.toLowerCase());
          const matched = internSkills.filter((s) => candidateSkills.includes(s));
          skillScore = (matched.length / internSkills.length) * 50;
        }

        // Preferences match (30%)
        if (candidate.preferences) {
          let prefPoints = 0;
          let prefTotal = 0;

          if (candidate.preferences.types.length > 0) {
            prefTotal += 10;
            if (candidate.preferences.types.includes(internship.type)) prefPoints += 10;
          }
          if (candidate.preferences.locations.length > 0 && internship.location) {
            prefTotal += 10;
            if (candidate.preferences.locations.some((l) => internship.location.toLowerCase().includes(l.toLowerCase()))) {
              prefPoints += 10;
            }
          }
          if (candidate.preferences.industries.length > 0 && internship.industry) {
            prefTotal += 10;
            if (candidate.preferences.industries.some((i) => internship.industry.toLowerCase().includes(i.toLowerCase()))) {
              prefPoints += 10;
            }
          }
          if (candidate.preferences.minStipend > 0) {
            prefTotal += 10;
            if (internship.stipend >= candidate.preferences.minStipend) prefPoints += 10;
          }

          if (prefTotal > 0) {
            prefScore = (prefPoints / prefTotal) * 30;
          }
        }

        // Education relevance (20%)
        if (candidate.education.length > 0 && internship.description) {
          const latestEdu = candidate.education[0];
          const desc = internship.description.toLowerCase();
          if (desc.includes(latestEdu.field.toLowerCase())) {
            eduScore = 20;
          } else if (desc.includes(latestEdu.degree.toLowerCase())) {
            eduScore = 10;
          }
        }

        const matchScore = Math.round(skillScore + prefScore + eduScore);

        return {
          ...internship,
          matchScore,
          matchBreakdown: {
            skills: Math.round(skillScore),
            preferences: Math.round(prefScore),
            education: Math.round(eduScore),
          },
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}

module.exports = new RecommendationService();
