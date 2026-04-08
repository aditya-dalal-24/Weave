const candidateService = require('../services/candidate.service');
const fs = require('fs');
const pdfParse = require('pdf-parse');

class CandidateController {
  async getDashboard(req, res, next) {
    try {
      const data = await candidateService.getDashboard(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const data = await candidateService.getProfile(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await candidateService.updateProfile(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) throw new Error('No image file provided');
      const avatarUrl = `/uploads/${req.file.filename}`;
      const data = await candidateService.updateProfile(req.user.id, { avatar: avatarUrl });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async uploadResume(req, res, next) {
    try {
      if (!req.file) throw new Error('No PDF file provided');
      const resumeUrl = `/uploads/${req.file.filename}`;
      
      let extractedSkills = [];
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        const text = data.text.toLowerCase();
        
        const commonSkills = ['javascript', 'react', 'react js', 'node', 'node.js', 'python', 'java', 'c++', 'html', 'css', 'sql', 'mongodb', 'docker', 'aws', 'typescript', 'figma', 'git', 'express', 'angular', 'vue'];
        
        extractedSkills = commonSkills.filter(skill => text.includes(skill.toLowerCase()));
        
        if (extractedSkills.length > 0) {
          for (const skill of extractedSkills) {
            try {
              let displaySkill = skill === 'node.js' ? 'Node.js' : skill === 'react js' ? 'React JS' : skill.charAt(0).toUpperCase() + skill.slice(1);
              await candidateService.addSkill(req.user.id, { name: displaySkill, proficiency: 'Intermediate' });
            } catch (ignore) {}
          }
        }
      } catch (parseError) {
        console.error('PDF parsing failed:', parseError);
      }

      const data = await candidateService.updateProfile(req.user.id, { resumeUrl });
      res.json({ success: true, data, extractedSkills });
    } catch (error) {
      next(error);
    }
  }

  async extractResume(req, res, next) {
    try {
      const candidateProfile = await candidateService.getProfile(req.user.id);
      if (!candidateProfile || !candidateProfile.resumeUrl) {
        throw new Error('No resume uploaded to extract from');
      }

      const path = require('path');
      const filePath = path.join(__dirname, '../../', candidateProfile.resumeUrl.replace(/^\//, ''));
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Resume file not found on server');
      }

      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      const text = data.text;
      
      let updates = {};
      let extractedData = { phone: null, links: [], education: [] };
      
      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const phoneMatch = text.match(phoneRegex);
      if (phoneMatch && !candidateProfile.phone) {
         extractedData.phone = phoneMatch[0];
         updates.phone = extractedData.phone;
      }

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex) || [];
      const relevantUrls = urls.filter(url => url.toLowerCase().includes('linkedin') || url.toLowerCase().includes('github') || url.toLowerCase().includes('portfolio'));
      
      if (relevantUrls.length > 0) {
         const uniqueUrls = [...new Set(relevantUrls)];
         extractedData.links = uniqueUrls;
         const linksText = "\n\nLinks Extracted:\n" + uniqueUrls.join('\n');
         updates.bio = (candidateProfile.bio || '') + linksText;
      }

      const lines = text.split('\n');
      for (const line of lines) {
         if (line.trim().length === 0) continue;
         const lower = line.toLowerCase();
         const hasInst = lower.includes('university') || lower.includes('college') || lower.includes('institute') || lower.includes('school') || lower.includes('academy');
         const hasDegree = lower.includes('b.tech') || lower.includes('btech') || lower.includes('bachelor') || lower.includes('master') || lower.includes('degree') || lower.includes('b.sc') || lower.includes('b.e') || lower.includes('diploma');
         const isYear = /(20\d{2})/.test(lower);
         
         if (hasInst || hasDegree || isYear) {
             // Only guess as education if it has a keyword
             if (hasInst || hasDegree) {
               let degreeGuess = 'Degree';
               if (lower.includes('b.tech') || lower.includes('btech') || lower.includes('bachelor') || lower.includes('b.sc') || lower.includes('b.e')) degreeGuess = 'Bachelor';
               else if (lower.includes('master')) degreeGuess = 'Master';
               else if (lower.includes('diploma')) degreeGuess = 'Diploma';
               
               extractedData.education.push({
                  institution: hasInst ? line.trim().substring(0, 50) : 'Extracted Institution',
                  degree: degreeGuess,
                  field: 'Extracted Field',
               });
                             // Refined CGPA/Score Extraction
               const gradeRegex = /(?:cgpa|gpa|percentage|score|marks?)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?\s*%?/gi;
               let matches;
               let extractedGrade = null;
               
               while ((matches = gradeRegex.exec(text)) !== null) {
                 const valueStr = matches[1];
                 const scaleStr = matches[2];
                 const isPercentage = matches[0].includes('%');
                 const value = parseFloat(valueStr);
                 
                 // Reject if it looks like a year (e.g., 2024-2028) and isn't specifically labeled as a grade with a decimal
                 if (!valueStr.includes('.') && value >= 1900 && value <= 2100 && !scaleStr) continue;
                 
                 const roundedValue = value.toFixed(2).replace(/\.00$/, ''); // Round to 2 decimal places, remove redundant .00
                 
                 if (isPercentage || value > 10) {
                   extractedGrade = `${roundedValue}%`;
                 } else if (scaleStr === '4' || (value <= 4 && scaleStr !== '10')) {
                   extractedGrade = `${roundedValue}/4`;
                 } else {
                   extractedGrade = `${roundedValue}/10`;
                 }
                 break; // Take the first valid score found
               }

               // Extract Timeline (Start and End Years)
               let startDate = '2020-01-01'; // Default Fallback
               let endDate = '2024-01-01';   // Default Fallback
               
               const yearRangeRegex = /(20\d{2})\s*[-–—to\s]+\s*(20\d{2}|present|ongoing|current)/i;
               const nextLine = lines[lines.indexOf(line) + 1] || "";
               const combinedLine = `${line} ${nextLine}`;
               const timelineMatch = combinedLine.match(yearRangeRegex);
               
               if (timelineMatch) {
                 startDate = `${timelineMatch[1]}-01-01`;
                 const endPart = timelineMatch[2].toLowerCase();
                 if (['present', 'ongoing', 'current'].includes(endPart)) {
                   endDate = null;
                 } else {
                   endDate = `${timelineMatch[2]}-01-01`;
                 }
               } else {
                 // Try to find ANY year if range is not found
                 const singleYearMatch = combinedLine.match(/(20\d{2})/);
                 if (singleYearMatch) {
                   const endYear = parseInt(singleYearMatch[1]);
                   endDate = `${endYear}-01-01`;
                   startDate = `${endYear - 4}-01-01`; // Guess a 4-year degree
                 }
               }

               try {
                  await candidateService.addEducation(req.user.id, {
                     institution: hasInst ? line.trim().substring(0, 50) : 'Extracted Institution',
                     degree: degreeGuess,
                     field: 'Extracted Field (Please edit)',
                     startDate: startDate,
                     endDate: endDate,
                     grade: extractedGrade
                  });
               } catch (ignored) {}
               break; // limit to 1 entry for now
             }
         }
      }

      if (Object.keys(updates).length > 0) {
         await candidateService.updateProfile(req.user.id, updates);
      }

      const commonSkills = ['javascript', 'react', 'react js', 'node', 'node.js', 'python', 'java', 'c++', 'html', 'css', 'sql', 'mongodb', 'docker', 'aws', 'typescript', 'figma', 'git', 'express', 'angular', 'vue'];
      const extractedSkills = commonSkills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
      if (extractedSkills.length > 0) {
        for (const skill of extractedSkills) {
          try {
            let displaySkill = skill === 'node.js' ? 'Node.js' : skill === 'react js' ? 'React JS' : skill.charAt(0).toUpperCase() + skill.slice(1);
            await candidateService.addSkill(req.user.id, { name: displaySkill, proficiency: 'Intermediate' });
          } catch (ignore) {}
        }
      }

      res.json({ success: true, message: 'Details extracted', data: extractedData });
    } catch (error) {
      next(error);
    }
  }

  async addEducation(req, res, next) {
    try {
      const data = await candidateService.addEducation(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateEducation(req, res, next) {
    try {
      const data = await candidateService.updateEducation(req.user.id, req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteEducation(req, res, next) {
    try {
      await candidateService.deleteEducation(req.user.id, req.params.id);
      res.json({ success: true, message: 'Education deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addSkill(req, res, next) {
    try {
      const data = await candidateService.addSkill(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteSkill(req, res, next) {
    try {
      await candidateService.deleteSkill(req.user.id, req.params.id);
      res.json({ success: true, message: 'Skill deleted' });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const data = await candidateService.updatePreferences(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProfileSuggestions(req, res, next) {
    try {
      const data = await candidateService.getProfileSuggestions(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CandidateController();
