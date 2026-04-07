const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.recruiterVerification.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 12);

  // Create Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@internmatch.com',
      password,
      role: 'ADMIN',
      admin: { create: { firstName: 'System', lastName: 'Admin' } },
    },
  });

  // Create Recruiters
  const recruiter1User = await prisma.user.create({
    data: {
      email: 'hr@techcorp.com',
      password,
      role: 'RECRUITER',
      recruiter: {
        create: {
          companyName: 'TechCorp Solutions',
          designation: 'HR Manager',
          about: 'Leading technology company specializing in AI and cloud solutions. We offer exciting internship opportunities for talented students.',
          website: 'https://techcorp.example.com',
          isVerified: true,
          verification: { create: { status: 'APPROVED' } },
        },
      },
    },
    include: { recruiter: true },
  });

  const recruiter2User = await prisma.user.create({
    data: {
      email: 'careers@designstudio.com',
      password,
      role: 'RECRUITER',
      recruiter: {
        create: {
          companyName: 'Creative Design Studio',
          designation: 'Talent Lead',
          about: 'Award-winning design agency working with Fortune 500 clients. We nurture creative talent through our internship program.',
          website: 'https://designstudio.example.com',
          isVerified: true,
          verification: { create: { status: 'APPROVED' } },
        },
      },
    },
    include: { recruiter: true },
  });

  const recruiter3User = await prisma.user.create({
    data: {
      email: 'recruit@dataflow.com',
      password,
      role: 'RECRUITER',
      recruiter: {
        create: {
          companyName: 'DataFlow Analytics',
          designation: 'Recruiting Head',
          about: 'Data analytics startup revolutionizing business intelligence. Join us to work on cutting-edge data projects.',
          isVerified: false,
          verification: { create: { status: 'PENDING' } },
        },
      },
    },
    include: { recruiter: true },
  });

  // Create Candidates
  const candidate1User = await prisma.user.create({
    data: {
      email: 'alice@student.com',
      password,
      role: 'CANDIDATE',
      candidate: {
        create: {
          firstName: 'Alice',
          lastName: 'Johnson',
          phone: '+1-555-0101',
          bio: 'Computer Science student passionate about full-stack development and machine learning. Looking for hands-on experience in a fast-paced tech environment.',
          profileStrength: 85,
          education: {
            create: [
              {
                institution: 'MIT',
                degree: "Bachelor's",
                field: 'Computer Science',
                startDate: new Date('2022-09-01'),
                endDate: new Date('2026-05-30'),
                grade: '3.8 GPA',
              },
            ],
          },
          skills: {
            create: [
              { name: 'JavaScript', proficiency: 'Advanced' },
              { name: 'React', proficiency: 'Advanced' },
              { name: 'Node.js', proficiency: 'Intermediate' },
              { name: 'Python', proficiency: 'Intermediate' },
              { name: 'SQL', proficiency: 'Intermediate' },
              { name: 'Git', proficiency: 'Advanced' },
            ],
          },
          preferences: {
            create: {
              locations: ['Mumbai', 'Bangalore', 'Remote'],
              types: ['REMOTE', 'HYBRID'],
              industries: ['Technology', 'AI/ML', 'Software'],
              minStipend: 2000,
            },
          },
        },
      },
    },
    include: { candidate: true },
  });

  const candidate2User = await prisma.user.create({
    data: {
      email: 'bob@student.com',
      password,
      role: 'CANDIDATE',
      candidate: {
        create: {
          firstName: 'Bob',
          lastName: 'Smith',
          phone: '+1-555-0102',
          bio: 'Design enthusiast with a strong eye for UI/UX. Experienced with Figma and Adobe Creative Suite. Seeking design internship.',
          profileStrength: 75,
          education: {
            create: [
              {
                institution: 'Parsons School of Design',
                degree: "Bachelor's",
                field: 'Graphic Design',
                startDate: new Date('2023-09-01'),
                grade: '3.6 GPA',
              },
            ],
          },
          skills: {
            create: [
              { name: 'Figma', proficiency: 'Advanced' },
              { name: 'Adobe Photoshop', proficiency: 'Advanced' },
              { name: 'UI/UX Design', proficiency: 'Intermediate' },
              { name: 'HTML/CSS', proficiency: 'Intermediate' },
              { name: 'Illustration', proficiency: 'Beginner' },
            ],
          },
          preferences: {
            create: {
              locations: ['Delhi', 'Gurgaon'],
              types: ['ONSITE', 'HYBRID'],
              industries: ['Design', 'Marketing', 'Media'],
              minStipend: 1500,
            },
          },
        },
      },
    },
    include: { candidate: true },
  });

  const candidate3User = await prisma.user.create({
    data: {
      email: 'carol@student.com',
      password,
      role: 'CANDIDATE',
      candidate: {
        create: {
          firstName: 'Carol',
          lastName: 'Williams',
          phone: '+1-555-0103',
          bio: 'Data science and analytics enthusiast. Proficient in Python, R, and data visualization tools.',
          profileStrength: 70,
          education: {
            create: [
              {
                institution: 'Stanford University',
                degree: "Master's",
                field: 'Data Science',
                startDate: new Date('2024-09-01'),
                grade: '3.9 GPA',
              },
            ],
          },
          skills: {
            create: [
              { name: 'Python', proficiency: 'Advanced' },
              { name: 'R', proficiency: 'Advanced' },
              { name: 'Machine Learning', proficiency: 'Intermediate' },
              { name: 'SQL', proficiency: 'Advanced' },
              { name: 'Tableau', proficiency: 'Intermediate' },
              { name: 'TensorFlow', proficiency: 'Beginner' },
            ],
          },
          preferences: {
            create: {
              locations: ['Bangalore', 'Hyderabad', 'Remote'],
              types: ['REMOTE'],
              industries: ['Technology', 'AI/ML', 'Data Analytics'],
              minStipend: 3000,
            },
          },
        },
      },
    },
    include: { candidate: true },
  });

  const candidate4User = await prisma.user.create({
    data: {
      email: 'david@student.com',
      password,
      role: 'CANDIDATE',
      candidate: {
        create: {
          firstName: 'David',
          lastName: 'Chen',
          bio: 'Mobile app developer exploring cross-platform frameworks.',
          profileStrength: 50,
          education: {
            create: [
              {
                institution: 'UC Berkeley',
                degree: "Bachelor's",
                field: 'Software Engineering',
                startDate: new Date('2023-09-01'),
              },
            ],
          },
          skills: {
            create: [
              { name: 'React Native', proficiency: 'Intermediate' },
              { name: 'Flutter', proficiency: 'Beginner' },
              { name: 'JavaScript', proficiency: 'Intermediate' },
            ],
          },
        },
      },
    },
    include: { candidate: true },
  });

  const candidate5User = await prisma.user.create({
    data: {
      email: 'emma@student.com',
      password,
      role: 'CANDIDATE',
      candidate: {
        create: {
          firstName: 'Emma',
          lastName: 'Davis',
          phone: '+1-555-0105',
          bio: 'Marketing and communications student with digital marketing skills. Eager to contribute to brand strategy.',
          profileStrength: 65,
          education: {
            create: [
              {
                institution: 'NYU',
                degree: "Bachelor's",
                field: 'Marketing',
                startDate: new Date('2022-09-01'),
                endDate: new Date('2026-05-30'),
                grade: '3.5 GPA',
              },
            ],
          },
          skills: {
            create: [
              { name: 'Digital Marketing', proficiency: 'Intermediate' },
              { name: 'Content Writing', proficiency: 'Advanced' },
              { name: 'SEO', proficiency: 'Intermediate' },
              { name: 'Social Media', proficiency: 'Advanced' },
            ],
          },
          preferences: {
            create: {
              locations: ['Pune', 'Mumbai'],
              types: ['ONSITE', 'HYBRID'],
              industries: ['Marketing', 'Media', 'E-commerce'],
              minStipend: 1000,
            },
          },
        },
      },
    },
    include: { candidate: true },
  });

  // Create Internships
  const internships = await Promise.all([
    prisma.internship.create({
      data: {
        recruiterId: recruiter1User.recruiter.id,
        title: 'Full Stack Developer Intern',
        company: 'TechCorp Solutions',
        description: 'Join our engineering team to build scalable web applications. You will work with React, Node.js, and cloud technologies. Great opportunity for Computer Science students.',
        type: 'HYBRID',
        location: 'Mumbai, Maharashtra',
        industry: 'Technology',
        stipend: 3000,
        duration: '3 months',
        skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
        requirements: 'Currently pursuing CS degree. Experience with web development preferred.',
        deadline: new Date('2026-06-30'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter1User.recruiter.id,
        title: 'Machine Learning Research Intern',
        company: 'TechCorp Solutions',
        description: 'Work on cutting-edge ML projects. Assist in developing recommendation systems and NLP models. Ideal for Data Science and AI enthusiasts.',
        type: 'REMOTE',
        location: 'Remote',
        industry: 'AI/ML',
        stipend: 4000,
        duration: '6 months',
        skills: ['Python', 'TensorFlow', 'Machine Learning', 'SQL', 'R'],
        requirements: "Master's in CS/Data Science preferred. Strong Python skills required.",
        deadline: new Date('2026-07-15'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter1User.recruiter.id,
        title: 'Mobile App Developer Intern',
        company: 'TechCorp Solutions',
        description: 'Develop cross-platform mobile apps using React Native. Collaborate with the product team to bring ideas to life.',
        type: 'ONSITE',
        location: 'Bangalore, Karnataka',
        industry: 'Technology',
        stipend: 2500,
        duration: '4 months',
        skills: ['React Native', 'JavaScript', 'Git', 'REST APIs'],
        requirements: 'Experience with mobile development. Portfolio preferred.',
        deadline: new Date('2026-05-30'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter2User.recruiter.id,
        title: 'UI/UX Design Intern',
        company: 'Creative Design Studio',
        description: 'Design beautiful interfaces for our clients. Work with our senior designers on real projects. Strong Figma skills required.',
        type: 'HYBRID',
        location: 'Delhi, NCR',
        industry: 'Design',
        stipend: 2000,
        duration: '3 months',
        skills: ['Figma', 'UI/UX Design', 'Adobe Photoshop', 'HTML/CSS'],
        requirements: 'Design portfolio required. Pursuing design degree.',
        deadline: new Date('2026-06-15'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter2User.recruiter.id,
        title: 'Brand & Marketing Intern',
        company: 'Creative Design Studio',
        description: 'Help us create compelling brand strategies for global clients. Develop marketing content and manage social media campaigns.',
        type: 'ONSITE',
        location: 'Pune, Maharashtra',
        industry: 'Marketing',
        stipend: 1800,
        duration: '3 months',
        skills: ['Digital Marketing', 'Content Writing', 'Social Media', 'SEO'],
        requirements: 'Marketing or Communications major. Strong writing skills.',
        deadline: new Date('2026-06-01'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter2User.recruiter.id,
        title: 'Graphic Design Intern',
        company: 'Creative Design Studio',
        description: 'Create visual content for digital and print media. Work alongside experienced designers on high-profile projects.',
        type: 'ONSITE',
        location: 'Chennai, Tamil Nadu',
        industry: 'Design',
        stipend: 1500,
        duration: '2 months',
        skills: ['Adobe Photoshop', 'Illustration', 'Figma'],
        requirements: 'Pursuing degree in Graphic Design or related field.',
        deadline: new Date('2026-05-15'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter3User.recruiter.id,
        title: 'Data Analyst Intern',
        company: 'DataFlow Analytics',
        description: 'Analyze large datasets to derive business insights. Work with SQL, Python, and visualization tools to create dashboards.',
        type: 'REMOTE',
        location: 'Remote',
        industry: 'Data Analytics',
        stipend: 3500,
        duration: '4 months',
        skills: ['Python', 'SQL', 'Tableau', 'R'],
        requirements: 'Strong analytical skills. Stats background preferred.',
        deadline: new Date('2026-07-01'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter3User.recruiter.id,
        title: 'Backend Engineer Intern',
        company: 'DataFlow Analytics',
        description: 'Build robust backend services for our analytics platform. Work with Node.js, PostgreSQL, and Redis.',
        type: 'HYBRID',
        location: 'Hyderabad, Telangana',
        industry: 'Technology',
        stipend: 3200,
        duration: '3 months',
        skills: ['Node.js', 'SQL', 'Python', 'Git'],
        requirements: 'CS or SE major. REST API experience preferred.',
        deadline: new Date('2026-06-20'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter1User.recruiter.id,
        title: 'DevOps Intern',
        company: 'TechCorp Solutions',
        description: 'Learn and implement CI/CD pipelines, container orchestration, and cloud infrastructure management.',
        type: 'REMOTE',
        location: 'Remote',
        industry: 'Technology',
        stipend: 2800,
        duration: '3 months',
        skills: ['Linux', 'Git', 'Python', 'Docker'],
        requirements: 'Familiarity with Linux. CS or IT major preferred.',
        deadline: new Date('2026-07-30'),
      },
    }),
    prisma.internship.create({
      data: {
        recruiterId: recruiter2User.recruiter.id,
        title: 'Content Strategy Intern',
        company: 'Creative Design Studio',
        description: 'Develop content strategies for diverse clients. Research trends, create editorial calendars, and produce engaging content.',
        type: 'REMOTE',
        location: 'Remote',
        industry: 'Marketing',
        stipend: 1200,
        duration: '2 months',
        skills: ['Content Writing', 'SEO', 'Social Media', 'Digital Marketing'],
        requirements: 'Excellent writing and research skills. Marketing or Journalism major.',
        deadline: new Date('2026-05-30'),
      },
    }),
  ]);

  // Create Applications
  await prisma.application.create({
    data: {
      candidateId: candidate1User.candidate.id,
      internshipId: internships[0].id,
      status: 'SHORTLISTED',
      matchScore: 92,
    },
  });

  await prisma.application.create({
    data: {
      candidateId: candidate1User.candidate.id,
      internshipId: internships[1].id,
      status: 'APPLIED',
      matchScore: 65,
    },
  });

  await prisma.application.create({
    data: {
      candidateId: candidate2User.candidate.id,
      internshipId: internships[3].id,
      status: 'APPLIED',
      matchScore: 88,
    },
  });

  await prisma.application.create({
    data: {
      candidateId: candidate3User.candidate.id,
      internshipId: internships[1].id,
      status: 'SHORTLISTED',
      matchScore: 95,
    },
  });

  await prisma.application.create({
    data: {
      candidateId: candidate3User.candidate.id,
      internshipId: internships[6].id,
      status: 'APPLIED',
      matchScore: 90,
    },
  });

  await prisma.application.create({
    data: {
      candidateId: candidate4User.candidate.id,
      internshipId: internships[2].id,
      status: 'APPLIED',
      matchScore: 78,
    },
  });

  await prisma.application.create({
    data: {
      candidateId: candidate5User.candidate.id,
      internshipId: internships[4].id,
      status: 'SELECTED',
      matchScore: 85,
    },
  });

  await prisma.application.create({
    data: {
      candidateId: candidate5User.candidate.id,
      internshipId: internships[9].id,
      status: 'APPLIED',
      matchScore: 82,
    },
  });

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: candidate1User.id,
        title: 'Application Shortlisted!',
        message: 'Your application for "Full Stack Developer Intern" at TechCorp Solutions has been shortlisted!',
        type: 'application',
      },
      {
        userId: candidate5User.id,
        title: 'Congratulations! You are Selected!',
        message: 'You have been selected for "Brand & Marketing Intern" at Creative Design Studio!',
        type: 'application',
      },
      {
        userId: recruiter1User.id,
        title: 'New Application Received',
        message: 'Alice Johnson applied for "Full Stack Developer Intern".',
        type: 'application',
      },
      {
        userId: recruiter3User.id,
        title: 'Verification Pending',
        message: 'Your account verification is under review. You can post internships once verified.',
        type: 'verification',
      },
    ],
  });

  console.log('✅ Seed data created successfully!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   Admin:      admin@internmatch.com / password123');
  console.log('   Recruiter1: hr@techcorp.com / password123');
  console.log('   Recruiter2: careers@designstudio.com / password123');
  console.log('   Recruiter3: recruit@dataflow.com / password123');
  console.log('   Candidate1: alice@student.com / password123');
  console.log('   Candidate2: bob@student.com / password123');
  console.log('   Candidate3: carol@student.com / password123');
  console.log('   Candidate4: david@student.com / password123');
  console.log('   Candidate5: emma@student.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
