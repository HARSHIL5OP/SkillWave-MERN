import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Video from '../models/Video.js';
import Challenge from '../models/Challenge.js';
import Event from '../models/Event.js';

export const seedDatabase = async () => {
  try {
    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('[Seed] Seeding initial course categories...');
      await Category.create([
        {
          name: 'Web Development',
          subcategories: [
            { name: 'Frontend', topics: ['React', 'Vue', 'HTML/CSS', 'Tailwind'] },
            { name: 'Backend', topics: ['Node.js', 'Express', 'Django', 'Spring Boot'] },
            { name: 'Full Stack', topics: ['MERN Stack', 'Next.js', 'PERN Stack'] },
          ],
        },
        {
          name: 'Data Science',
          subcategories: [
            { name: 'Machine Learning', topics: ['Supervised Learning', 'Scikit-Learn', 'Regression'] },
            { name: 'Deep Learning', topics: ['PyTorch', 'TensorFlow', 'Neural Networks'] },
            { name: 'Data Engineering', topics: ['Pandas', 'SQL', 'Spark', 'ETL Pipelines'] },
          ],
        },
        {
          name: 'AI & Robotics',
          subcategories: [
            { name: 'Computer Vision', topics: ['OpenCV', 'YOLO', 'Image Classification'] },
            { name: 'NLP', topics: ['Transformers', 'LLMs', 'Tokenization', 'Hugging Face'] },
            { name: 'Reinforcement Learning', topics: ['Q-Learning', 'Gymnasium', 'Policy Gradients'] },
          ],
        },
        {
          name: 'Cloud Computing',
          subcategories: [
            { name: 'AWS', topics: ['EC2', 'S3', 'Lambda', 'DynamoDB'] },
            { name: 'Azure', topics: ['App Services', 'Blob Storage', 'Azure Functions'] },
            { name: 'Google Cloud', topics: ['Compute Engine', 'Cloud Run', 'BigQuery'] },
          ],
        },
        {
          name: 'Cybersecurity',
          subcategories: [
            { name: 'Network Security', topics: ['Firewalls', 'Wireshark', 'Packet Analysis'] },
            { name: 'Ethical Hacking', topics: ['Penetration Testing', 'Metasploit', 'OWASP Top 10'] },
            { name: 'Cryptography', topics: ['Public Key Crypto', 'AES', 'Hashing', 'Zero Knowledge'] },
          ],
        },
      ]);
      console.log('[Seed] Categories seeded successfully');
    }

    // 2. Seed Default Users if empty
    const adminExists = await User.findOne({ email: 'admin@skillwave.edu' });
    let adminUser = adminExists;
    if (!adminExists) {
      console.log('[Seed] Creating default Admin user...');
      adminUser = await User.create({
        name: 'SkillWave Administrator',
        email: 'admin@skillwave.edu',
        password: 'Admin@123',
        role: 'admin',
        phone: '+1 234-567-8900',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      });
    }

    const teacherExists = await User.findOne({ email: 'teacher@skillwave.edu' });
    let teacherUser = teacherExists;
    if (!teacherExists) {
      console.log('[Seed] Creating default Teacher user...');
      teacherUser = await User.create({
        name: 'Dr. Sarah Connor',
        email: 'teacher@skillwave.edu',
        password: 'Teacher@123',
        role: 'teacher',
        phone: '+1 234-567-8901',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      });
    }

    const learnerExists = await User.findOne({ email: 'learner@skillwave.edu' });
    let learnerUser = learnerExists;
    if (!learnerExists) {
      console.log('[Seed] Creating default Learner user...');
      learnerUser = await User.create({
        name: 'Alex Johnson',
        email: 'learner@skillwave.edu',
        password: 'Learner@123',
        role: 'learner',
        phone: '+1 234-567-8902',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
        preferences: {
          category: 'Web Development',
          subcategory: 'Full Stack',
          currentSkills: ['HTML', 'CSS', 'JavaScript'],
          wantToLearn: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
          futureGoals: 'Become a Senior Full Stack MERN Developer',
        },
      });
    }

    // 3. Seed Sample Videos if empty
    const videoCount = await Video.countDocuments();
    if (videoCount === 0 && teacherUser) {
      console.log('[Seed] Seeding sample course videos...');
      await Video.create([
        {
          title: 'Mastering Modern React 19 & Tailwind CSS',
          description:
            'A comprehensive guide to building interactive, high-performance web applications using modern React Hooks, Vite, and Tailwind CSS.',
          videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
          teacher: teacherUser._id,
          teacherName: teacherUser.name,
          teacherEmail: teacherUser.email,
          category: 'Web Development',
          subcategory: 'Frontend',
          topic: 'React',
          duration: '15:42',
          likeCount: 42,
          averageRating: 4.8,
          ratings: [
            {
              userId: learnerUser._id,
              email: learnerUser.email,
              rating: 5,
              createdAt: new Date(),
            },
          ],
          views: 318,
          status: 'Active',
        },
        {
          title: 'Building Scalable RESTful APIs with Node.js & Express',
          description:
            'Learn production architecture, JWT authentication, Mongoose ORM data modeling, error handling, and clean modular code design.',
          videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
          teacher: teacherUser._id,
          teacherName: teacherUser.name,
          teacherEmail: teacherUser.email,
          category: 'Web Development',
          subcategory: 'Backend',
          topic: 'Node.js',
          duration: '22:10',
          likeCount: 56,
          averageRating: 4.9,
          ratings: [
            {
              userId: learnerUser._id,
              email: learnerUser.email,
              rating: 5,
              createdAt: new Date(),
            },
          ],
          views: 452,
          status: 'Active',
        },
        {
          title: 'Neural Networks & Deep Learning with PyTorch',
          description:
            'Understand gradient descent, backpropagation, convolutional layers, and model training in Python.',
          videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
          teacher: teacherUser._id,
          teacherName: teacherUser.name,
          teacherEmail: teacherUser.email,
          category: 'Data Science',
          subcategory: 'Deep Learning',
          topic: 'PyTorch',
          duration: '18:30',
          likeCount: 38,
          averageRating: 4.7,
          views: 289,
          status: 'Active',
        },
      ]);
    }

    // 4. Seed Sample Challenges if empty
    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0 && teacherUser) {
      console.log('[Seed] Seeding sample coding challenges...');
      await Challenge.create([
        {
          title: 'Two Sum & Hash Map Optimization',
          description:
            'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target in O(n) time.',
          problemStatementUrl:
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          solutionUrl:
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          teacher: teacherUser._id,
          teacherName: teacherUser.name,
          teacherEmail: teacherUser.email,
          category: 'Web Development',
          status: 'Active',
        },
        {
          title: 'Binary Search Tree Validation',
          description:
            'Determine if a given binary tree is a valid binary search tree (BST) using in-order traversal and bounds validation.',
          problemStatementUrl:
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          solutionUrl:
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          teacher: teacherUser._id,
          teacherName: teacherUser.name,
          teacherEmail: teacherUser.email,
          category: 'Data Science',
          status: 'Active',
        },
      ]);
    }

    // 5. Seed Sample Events if empty
    const eventCount = await Event.countDocuments();
    if (eventCount === 0 && teacherUser) {
      console.log('[Seed] Seeding sample events...');
      await Event.create([
        {
          title: 'Full Stack MERN Architecture Workshop',
          description:
            'Interactive live workshop on structuring enterprise MERN applications, secure JWT handling, and seamless frontend-backend integration.',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
          pdfUrl:
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          registrationClosingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          organizedBy: 'SkillWave Academic Team',
          mode: 'Online',
          location: 'Zoom Webinar',
          eventType: 'Workshop',
          organizer: teacherUser._id,
          organizerName: teacherUser.name,
          organizerEmail: teacherUser.email,
          status: 'Active',
        },
        {
          title: 'Global AI & Web3 Hackathon 2026',
          description:
            'Join developers worldwide to build cutting-edge intelligent applications. Cash prizes, mentorship, and project showcases.',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
          pdfUrl:
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          registrationClosingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          organizedBy: 'SkillWave & Tech Partners',
          mode: 'Online',
          location: 'SkillWave Platform',
          eventType: 'Hackathon',
          organizer: teacherUser._id,
          organizerName: teacherUser.name,
          organizerEmail: teacherUser.email,
          status: 'Active',
        },
      ]);
    }

    console.log('[Seed] Database initialization and seed check completed successfully.');
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error.message);
  }
};
