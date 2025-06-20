import { Router } from "express";
export const studentRouter = Router()
import { addStudent, getAllStudents, editStudent, deleteStudent, getStudentDetails } from "../controllers/studentController.js";

studentRouter.post("/add", addStudent);
studentRouter.get("/all", getAllStudents)
studentRouter.get("/details/:id", getStudentDetails)
studentRouter.put("/edit", editStudent);
studentRouter.delete("/delete/:id", deleteStudent);



