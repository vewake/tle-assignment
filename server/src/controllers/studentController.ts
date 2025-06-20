import { Student } from "../models/studentSchema.js";
import { fetchCodeforcesData } from "../controllers/fetchCfdata.js";


export async function deleteStudent(req: any, res: any) {
  const { id } = req.params;
  try {
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
export async function editStudent(req: any, res: any) {
  const { id, name, email, phone, codeforcesHandle, emailRemindersEnabled, isActive } = req.body;

  // Validation - phone should be optional
  if (!name || !email || !codeforcesHandle) {
    return res.status(400).json({ error: "Name, email, and Codeforces handle are required" });
  }

  try {
    // Check if student exists
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentData: any = {
      name,
      email,
      phone: phone || "", // Allow empty phone
      codeforcesHandle,
      emailRemindersEnabled: emailRemindersEnabled ?? true,
      isActive: isActive ?? true
    };

    // Only fetch Codeforces data if handle changed
    if (existingStudent.codeforcesHandle !== codeforcesHandle) {
      try {
        const cfData = await fetchCodeforcesData(studentData.codeforcesHandle);

        if (cfData && cfData.user) {
          studentData.currentRating = cfData.user.rating || 0;
          studentData.maxRating = cfData.user.maxRating || cfData.user.rating || 0;
          studentData.codeforcesData = {
            contests: cfData.contests || [],
            submissions: cfData.submissions || [],
            lastSyncTime: new Date(),
          };

          // Check activity (submissions in last 7 days)
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const recentSubmissions = (cfData.submissions || []).filter(
            (sub: any) => sub.creationTimeSeconds * 1000 > sevenDaysAgo
          );

          // Only update activity based on submissions if we have submission data
          if (cfData.submissions && cfData.submissions.length > 0) {
            studentData.isActive = recentSubmissions.length > 0;
          }
        } else {
          return res.status(400).json({ error: "Invalid Codeforces handle or user not found" });
        }
      } catch (cfError) {
        console.error("Error fetching Codeforces data:", cfError);
        return res.status(400).json({ error: "Failed to fetch Codeforces data. Please check the handle." });
      }
    } else {
      // If handle didn't change, preserve existing Codeforces data
      studentData.currentRating = existingStudent.currentRating;
      studentData.maxRating = existingStudent.maxRating;
      studentData.codeforcesData = existingStudent.codeforcesData;
    }

    studentData.lastUpdated = new Date();

    // Update and return the updated document
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      studentData,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}



export async function getAllStudents(req: any, res: any) {
  try {
    const students = await Student.find({}, 'name email phone codeforcesHandle currentRating maxRating lastUpdated isActive');
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function getStudentDetails(req: any, res: any) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function addStudent(req: any, res: any) {
  const { name, email, phone, codeforcesHandle, emailRemindersEnabled, isActive } = req.body;
  if (!name || !email || !phone || !codeforcesHandle) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const studentData: any = { name, email, phone, codeforcesHandle, emailRemindersEnabled, isActive }

  const cfData = await fetchCodeforcesData(studentData.codeforcesHandle)

  studentData.currentRating = cfData.user.rating || 0
  studentData.maxRating = cfData.user.maxRating || cfData.user.rating || 0
  studentData.codeforcesData = {
    contests: cfData.contests,
    submissions: cfData.submissions,
    lastSyncTime: new Date(),
  }

  // Check activity (submissions in last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentSubmissions = cfData.submissions.filter((sub: any) => sub.creationTimeSeconds * 1000 > sevenDaysAgo)
  studentData.isActive = recentSubmissions.length > 0
  studentData.lastUpdated = new Date()



  const student = new Student(studentData);
  try {
    await student.save();
    res.status(201).json(studentData);
  } catch (err) {
    console.error("Error saving student:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
