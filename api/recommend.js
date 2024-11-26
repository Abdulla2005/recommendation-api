// Load static course data (if using courses.json as mock data)
const courses = require("../data/courses.json"); // Ensure the path to courses.json is correct

/**
 * Recommendation Logic
 * @param {Object} student - Student data from the API request body
 * @param {Array} courses - List of available courses
 * @returns {Array} - Recommended courses (2 custom + 1 mandatory)
 */
function recommendCourses(student, courses) {
  // Step 1: Find the mandatory English course
  const mandatoryCourse = courses.find((course) => course.mandatory);
  if (!mandatoryCourse) {
    throw new Error("Mandatory course not found!");
  }

  // Step 2: Filter courses by grade and group (excluding the mandatory course)
  const filteredCourses = courses.filter(
    (course) =>
      course.grade === student.grade &&
      course.group.includes(student.group) &&
      !course.mandatory
  );

  // Step 3: Score courses based on skills and interests
  const scoredCourses = filteredCourses
    .map((course) => {
      const overlap = new Set(student.skills.concat(student.interests));
      const score = course.tags.filter((tag) => overlap.has(tag)).length; // Count overlapping tags
      return { ...course, score }; // Attach the score to each course
    })
    .filter((course) => course.score > 0); // Only keep courses with at least 1 match

  // Step 4: Sort by score in descending order
  scoredCourses.sort((a, b) => b.score - a.score);

  // Step 5: Select the top 2 custom courses
  const topCourses = scoredCourses.slice(0, 2);

  // Step 6: Add the mandatory course to the recommendations
  return [...topCourses, mandatoryCourse];
}

// API Handler
module.exports = async (req, res) => {
  try {
    // Step 1: Check if the HTTP method is POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    // Step 2: Parse the incoming student data
    const student = req.body;

    // Step 3: Validate the student data
    if (
      !student ||
      !student.grade ||
      !student.group ||
      !Array.isArray(student.skills) ||
      !Array.isArray(student.interests)
    ) {
      return res.status(400).json({ error: "Invalid student data provided." });
    }

    // Step 4: Generate course recommendations
    const recommendations = recommendCourses(student, courses);

    // Step 5: Respond with the recommendations
    return res.status(200).json({ recommendations });
  } catch (error) {
    // Step 6: Handle errors and send a 500 response
    console.error("Error in recommend.js:", error.message);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};
