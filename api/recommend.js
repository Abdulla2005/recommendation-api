
const courses = require("../data/courses.json"); 

function recommendCourses(student, courses) {
 
  const mandatoryCourse = courses.find((course) => course.mandatory);
  if (!mandatoryCourse) {
    throw new Error("Mandatory course not found!");
  }

  
  const filteredCourses = courses.filter(
    (course) =>
      course.grade === student.grade &&
      course.group.includes(student.group) &&
      !course.mandatory
  );

  
  const scoredCourses = filteredCourses
    .map((course) => {
      const overlap = new Set(student.skills.concat(student.interests));
      const score = course.tags.filter((tag) => overlap.has(tag)).length;
      return { ...course, score }; 
    })
    .filter((course) => course.score > 0); 

  
  scoredCourses.sort((a, b) => b.score - a.score);

  
  const topCourses = scoredCourses.slice(0, 2);

  
  return [...topCourses, mandatoryCourse];
}


module.exports = async (req, res) => {
  try {
    
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests are allowed." });
    }

   
    const student = req.body;

    
    if (
      !student ||
      !student.grade ||
      !student.group ||
      !Array.isArray(student.skills) ||
      !Array.isArray(student.interests)
    ) {
      return res.status(400).json({ error: "Invalid student data provided." });
    }

    
    const recommendations = recommendCourses(student, courses);

    
    return res.status(200).json({ recommendations });
  } catch (error) {
   
    console.error("Error in recommend.js:", error.message);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};
