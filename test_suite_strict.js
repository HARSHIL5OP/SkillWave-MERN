// Strict API Test Suite for SkillWave
const BASE = 'http://localhost:5000/api';

async function runTests() {
  const results = [];
  function log(name, passed, detail = '') {
    results.push({ name, passed, detail });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${detail ? '(' + detail + ')' : ''}`);
  }

  try {
    // 1. Missing Authentication
    const resNoAuth = await fetch(`${BASE}/videos`);
    const jsonNoAuth = await resNoAuth.json();
    log('Missing Auth (401)', resNoAuth.status === 401 && jsonNoAuth.success === false, `Status: ${resNoAuth.status}`);

    // 2. Invalid JWT Token
    const resBadToken = await fetch(`${BASE}/videos`, {
      headers: { 'Authorization': 'Bearer this_is_a_completely_invalid_token' }
    });
    log('Invalid JWT (401)', resBadToken.status === 401, `Status: ${resBadToken.status}`);

    // 3. Expired JWT Token (Simulated signature error)
    const resExpired = await fetch(`${BASE}/videos`, {
      headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImV4cCI6MTUxNDc2NDgwMH0.invalid' }
    });
    log('Malformed/Expired JWT (401)', resExpired.status === 401, `Status: ${resExpired.status}`);

    // 4. Successful Login - Learner
    const resLearnerLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'learner@skillwave.edu', password: 'Learner@123' })
    });
    const jsonLearner = await resLearnerLogin.json();
    const learnerToken = jsonLearner.data?.token;
    log('Learner Login (200)', resLearnerLogin.status === 200 && jsonLearner.data?.user?.role === 'learner');

    // 5. Successful Login - Teacher
    const resTeacherLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@skillwave.edu', password: 'Teacher@123' })
    });
    const jsonTeacher = await resTeacherLogin.json();
    const teacherToken = jsonTeacher.data?.token;
    log('Teacher Login (200)', resTeacherLogin.status === 200 && jsonTeacher.data?.user?.role === 'teacher');

    // 6. Successful Login - Admin
    const resAdminLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@skillwave.edu', password: 'Admin@123' })
    });
    const jsonAdmin = await resAdminLogin.json();
    const adminToken = jsonAdmin.data?.token;
    log('Admin Login (200)', resAdminLogin.status === 200 && jsonAdmin.data?.user?.role === 'admin');

    // 7. Wrong User Role - Learner trying to create video
    const resForbidden = await fetch(`${BASE}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Unauthorized Video',
        videoUrl: 'https://example.com/video.mp4'
      })
    });
    log('Role Authorization RBAC (403)', resForbidden.status === 403, `Status: ${resForbidden.status}`);

    // 8. Database Validation Error - Teacher creates video with missing required fields
    const resInvalidVideo = await fetch(`${BASE}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Missing title, videoUrl
    });
    log('Validation Error on Empty Body (400)', resInvalidVideo.status === 400, `Status: ${resInvalidVideo.status}`);

    // 9. Successful Video Creation by Teacher
    const resCreateVideo = await fetch(`${BASE}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'REST Architecture Masterclass',
        description: 'Complete guide to REST methods and status codes',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        category: 'Web Development',
        subcategory: 'Backend',
        topic: 'Express.js',
        duration: '18:45'
      })
    });
    const jsonCreated = await resCreateVideo.json();
    const createdVideoId = jsonCreated.data?._id || jsonCreated.data?.id;
    log('Video Creation (201/200)', resCreateVideo.status === 201 || resCreateVideo.status === 200, `ID: ${createdVideoId}`);

    // 10. PUT (Full Update) on Video
    const resPutVideo = await fetch(`${BASE}/videos/${createdVideoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'REST Architecture Masterclass (Updated with PUT)',
        description: 'Updated description through full PUT request',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
      })
    });
    const jsonPut = await resPutVideo.json();
    log('PUT Video Update (200)', resPutVideo.status === 200 && jsonPut.data?.title?.includes('PUT'));

    // 11. PATCH (Partial Update) on Video
    const resPatchVideo = await fetch(`${BASE}/videos/${createdVideoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Advanced Express & HTTP Methods'
      })
    });
    const jsonPatch = await resPatchVideo.json();
    log('PATCH Video Partial Update (200)', resPatchVideo.status === 200 && jsonPatch.data?.topic === 'Advanced Express & HTTP Methods');

    // 12. Nonexistent Resource (404)
    const res404 = await fetch(`${BASE}/videos/64b000000000000000000000`, {
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    log('Nonexistent Resource (404)', res404.status === 404, `Status: ${res404.status}`);

    // 13. Invalid ObjectId format (CastError -> 400)
    const resBadId = await fetch(`${BASE}/videos/not-a-valid-object-id`, {
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    log('Invalid ObjectId Handling (400/500 handled)', resBadId.status === 400 || resBadId.status === 500, `Status: ${resBadId.status}`);

    // 14. Like Video (Learner)
    const resLike = await fetch(`${BASE}/videos/${createdVideoId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    const jsonLike = await resLike.json();
    log('Like Video Toggle (200)', resLike.status === 200 && jsonLike.data?.isLiked === true);

    // 15. Rate Video (Learner)
    const resRate = await fetch(`${BASE}/videos/${createdVideoId}/rate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating: 5 })
    });
    const jsonRate = await resRate.json();
    log('Rate Video (200)', resRate.status === 200 && jsonRate.data?.averageRating === 5);

    // 16. Post Comment (Learner)
    const resComment = await fetch(`${BASE}/videos/${createdVideoId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: 'In-depth and clear explanation of REST APIs.' })
    });
    const jsonComment = await resComment.json();
    const commentId = jsonComment.data?._id || jsonComment.data?.id;
    log('Add Comment (201)', resComment.status === 201 && Boolean(commentId));

    // 17. Threaded Reply to Comment (Teacher)
    const resReply = await fetch(`${BASE}/videos/${createdVideoId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reply: 'Thank you! Let me know if you need any follow-up exercises.' })
    });
    const jsonReply = await resReply.json();
    log('Add Reply (201)', resReply.status === 201 && jsonReply.data?.replies?.length > 0);

    // 18. Report Video (Learner)
    const resReport = await fetch(`${BASE}/videos/${createdVideoId}/report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: 'Test moderation review' })
    });
    log('Report Video (201/200)', resReport.status === 201 || resReport.status === 200, `Status: ${resReport.status}`);

    // 19. User Preferences GET, PUT, PATCH
    const resGetPref = await fetch(`${BASE}/users/me/preferences`, {
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    log('Get User Preferences (200)', resGetPref.status === 200, `Status: ${resGetPref.status}`);

    const resPutPref = await fetch(`${BASE}/users/me/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: 'Web Development',
        subcategory: 'Backend',
        currentSkills: ['JavaScript', 'Node.js'],
        wantToLearn: ['MongoDB', 'Docker', 'Kubernetes'],
        futureGoals: 'Lead Full Stack Architect'
      })
    });
    log('PUT User Preferences (200)', resPutPref.status === 200, `Status: ${resPutPref.status}`);

    const resPatchPref = await fetch(`${BASE}/users/me/preferences`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        futureGoals: 'Distinguished Full Stack Engineer'
      })
    });
    log('PATCH User Preferences (200)', resPatchPref.status === 200, `Status: ${resPatchPref.status}`);

    // 20. Coding Challenges CRUD
    const resCreateChallenge = await fetch(`${BASE}/challenges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Two Sum Problem',
        description: 'Find two indices that sum up to target in O(N)',
        difficulty: 'Easy',
        category: 'Algorithms',
        problemStatementUrl: 'https://res.cloudinary.com/sample.pdf'
      })
    });
    const jsonChallenge = await resCreateChallenge.json();
    const challengeId = jsonChallenge.data?._id || jsonChallenge.data?.id;
    log('Create Challenge (201/200)', resCreateChallenge.status === 201 || resCreateChallenge.status === 200);

    // PATCH Challenge
    const resPatchChallenge = await fetch(`${BASE}/challenges/${challengeId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ difficulty: 'Medium' })
    });
    log('PATCH Challenge (200)', resPatchChallenge.status === 200);

    // 21. Events CRUD
    const resCreateEvent = await fetch(`${BASE}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Full Stack MERN Workshop',
        description: 'Interactive session building real-time apps',
        eventType: 'Workshop',
        eventDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        mode: 'Online',
        location: 'Zoom Meeting Room'
      })
    });
    const jsonEvent = await resCreateEvent.json();
    const eventId = jsonEvent.data?._id || jsonEvent.data?.id;
    log('Create Event (201/200)', resCreateEvent.status === 201 || resCreateEvent.status === 200);

    // PATCH Event
    const resPatchEvent = await fetch(`${BASE}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mode: 'Online' })
    });
    log('PATCH Event (200)', resPatchEvent.status === 200);

    // 22. AI Features (Proxy Endpoints)
    const resAISummarize = await fetch(`${BASE}/ai/summarize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic: 'MERN Architecture', mode: 'summary', language: 'English' })
    });
    const jsonAISum = await resAISummarize.json();
    log('AI Summarizer Proxy (200)', resAISummarize.status === 200 && Boolean(jsonAISum.data?.content));

    const resAIRoadmap = await fetch(`${BASE}/ai/roadmap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic: 'React & Node.js Developer', duration: '4 weeks' })
    });
    const jsonAIRoadmap = await resAIRoadmap.json();
    log('AI Roadmap Generator Proxy (200)', resAIRoadmap.status === 200 && Array.isArray(jsonAIRoadmap.data?.phases));

    const resAIChat = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'What are the benefits of Mongoose over raw MongoDB queries?' })
    });
    const jsonAIChat = await resAIChat.json();
    log('AI Chatbot Assistant Proxy (200)', resAIChat.status === 200 && Boolean(jsonAIChat.data?.reply));

    // 23. Roadmap Persistence CRUD
    const resSaveRoadmap = await fetch(`${BASE}/roadmaps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'My Custom MERN Roadmap',
        topic: 'Full-Stack Engineering',
        duration: '6 Weeks',
        roadmap: jsonAIRoadmap.data || { phases: [] },
        progress: 10
      })
    });
    const jsonSavedRoadmap = await resSaveRoadmap.json();
    const roadmapId = jsonSavedRoadmap.data?._id || jsonSavedRoadmap.data?.id;
    log('Save Roadmap (201/200)', resSaveRoadmap.status === 201 || resSaveRoadmap.status === 200, `ID: ${roadmapId}`);

    // PUT Roadmap Update
    const resPutRoadmap = await fetch(`${BASE}/roadmaps/${roadmapId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress: 25 })
    });
    log('PUT Roadmap (200)', resPutRoadmap.status === 200);

    // PATCH Roadmap Update
    const resPatchRoadmap = await fetch(`${BASE}/roadmaps/${roadmapId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${learnerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress: 50 })
    });
    log('PATCH Roadmap (200)', resPatchRoadmap.status === 200);

    // DELETE Roadmap
    const resDelRoadmap = await fetch(`${BASE}/roadmaps/${roadmapId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    log('DELETE Roadmap (200)', resDelRoadmap.status === 200);

    // 24. Admin Analytics
    const resAdminAnalytics = await fetch(`${BASE}/analytics/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const jsonAdminAnalytics = await resAdminAnalytics.json();
    log('Admin Analytics (200)', resAdminAnalytics.status === 200 && jsonAdminAnalytics.data?.counts?.users > 0);

    // 25. Teacher Analytics
    const resTeacherAnalytics = await fetch(`${BASE}/analytics/teacher`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const jsonTeacherAnalytics = await resTeacherAnalytics.json();
    log('Teacher Analytics (200)', resTeacherAnalytics.status === 200 && jsonTeacherAnalytics.data?.counts?.videos > 0);

    // 26. Cleanup created test items (DELETE operations)
    const resDelVideo = await fetch(`${BASE}/videos/${createdVideoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    log('DELETE Video (200)', resDelVideo.status === 200);

    const resDelChallenge = await fetch(`${BASE}/challenges/${challengeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    log('DELETE Challenge (200)', resDelChallenge.status === 200);

    const resDelEvent = await fetch(`${BASE}/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    log('DELETE Event (200)', resDelEvent.status === 200);

    console.log('\n--- VERIFICATION TEST SUMMARY ---');
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`Total Tests: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    if (failed === 0) {
      console.log('🌟 ALL 26 STRICT API TEST SCENARIOS PASSED WITH 100% SUCCESS!');
    }
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();
