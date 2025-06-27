// export const API_BASE_URL = 'http://localhost:3000';
export const API_BASE_URL = "https://tle-assignment-igt4.onrender.com";
export const API_ENDPOINTS = {
  addStudent: `${API_BASE_URL}/api/student/add`,
  getAllStudents: `${API_BASE_URL}/api/student/all`,
  updateStudent: `${API_BASE_URL}/api/student/edit`,
  deleteStudent: `${API_BASE_URL}/api/student/delete`,
  getDetails: `${API_BASE_URL}/api/student/details`,

  testCronJob: `${API_BASE_URL}/api/settings/sync`,
  getSettings: `${API_BASE_URL}/api/settings`,
  updateSettings: `${API_BASE_URL}/api/settings`,

}
