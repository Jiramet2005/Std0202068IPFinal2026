export type Language = 'th' | 'en';
export type TranslationValues = Record<string, string | number>;

const en = {
  language: 'Language', switchThai: 'Switch to Thai', switchEnglish: 'Switch to English',
  loginEyebrow: 'HR MANAGER / 2026', loginTitle: 'Good people.\nClear decisions.',
  loginSubtitle: 'Sign in to manage your team and understand your salary structure.',
  username: 'Username', password: 'Password', usernamePlaceholder: 'Enter your username', passwordPlaceholder: 'Enter your password',
  signIn: 'Sign in', accountHint: 'Exam account: admin / password123', appName: 'HR Manager & Salary Analytics System',
  loginRequired: 'Please enter your username and password.', loginFailed: 'Login failed.',
  workspace: 'HR workspace', signOut: 'Sign out', teamEyebrow: 'YOUR TEAM, AT A GLANCE', teamTitle: 'Team overview',
  teamSubtitle: 'A clear view of your people and their potential.', administrator: 'Administrator', hrManager: 'HR Manager',
  totalEmployees: 'Total employees', activeEmployees: 'Active team members', onLeave: 'On leave', monthlyPayroll: 'Monthly payroll',
  retry: 'Retry', directory: 'Employee directory', teamCount: 'Team members: {count}', refresh: 'Refresh employees',
  loadingEmployees: 'Loading employees...', emptyTitle: 'Your team starts here', emptySubtitle: 'Add your first employee using the form.',
  perMonth: ' / mo', statusActive: 'Active', statusOnLeave: 'On Leave', toggleStatus: 'Toggle Status', delete: 'Delete',
  toggleFor: 'Toggle Status for {name}', deleteFor: 'Delete {name}',
  edit: 'Edit', editFor: 'Edit {name}', editEmployee: 'Edit employee', editSubtitle: 'Update the name, position or salary.', saveChanges: 'Save changes',
  searchEmployees: 'Search employees', searchPlaceholder: 'Search by name or position...', clearSearch: 'Clear search', searchCount: 'Showing {count} of {total} employees',
  noSearchResults: 'No matching employees', searchTryAgain: 'Try another name or position, or clear your search.',
  addEmployee: 'Add Employee', addSubtitle: 'Make room for someone new.', fullName: 'Full name', position: 'Position', monthlySalary: 'Monthly salary (THB)',
  namePlaceholder: 'e.g. John Doe', positionPlaceholder: 'e.g. Software Engineer', salaryPlaceholder: 'e.g. 45000',
  formRequired: 'Name, position and salary are required.', salaryInvalid: 'Enter a valid non-negative salary with at most 2 decimal places, such as 45000.50.',
  fieldsTooLong: 'Name and position must be at most 255 characters.', newStatusHint: 'New employees start with an Active status.',
  salaryIntelligence: 'SALARY INTELLIGENCE', analysisTitle: 'Understand your salary structure',
  analysisSubtitle: 'Group current salaries into three tiers with K-Means.', analyze: 'Analyze Salary Structure', analyzing: 'Analyzing...',
  calculating: 'Calculating salary groups...', analysisHint: 'Run an analysis to see the employee count and average salary for each tier.',
  tier: 'Tier {number}', averageSalary: 'Average monthly salary', employeeOne: '{count} employee', employeeMany: '{count} employees',
  emptyTier: 'No salaries in this tier', footer: 'People first. Decisions backed by data.',
  errorTitle: 'Unable to complete request', requestFailed: 'The request failed.', unexpectedError: 'Something went wrong.',
  invalidCredentials: 'Invalid username or password.', loginAgain: 'Please log in to access employee records.',
  employeeNotFound: 'Employee not found.', endpointNotFound: 'Endpoint not found.',
  databaseUnavailable: 'Database unavailable. Please try again later.', internalError: 'Internal server error. Please try again later.',
  invalidJson: 'Invalid request data.', networkError: 'Cannot connect to the server. Check your connection and try again.',
  confirmTitle: 'Are you sure?', deletePrompt: 'Delete {name}? This cannot be undone.', cancel: 'Cancel',
} as const;

export type TranslationKey = keyof typeof en;
const th: Record<TranslationKey, string> = {
  language: 'ภาษา', switchThai: 'เปลี่ยนเป็นภาษาไทย', switchEnglish: 'เปลี่ยนเป็นภาษาอังกฤษ',
  loginEyebrow: 'ระบบจัดการบุคลากร / 2026', loginTitle: 'ดูแลทีมให้ดี\nตัดสินใจให้ชัด',
  loginSubtitle: 'เข้าสู่ระบบเพื่อจัดการพนักงานและวิเคราะห์โครงสร้างเงินเดือนของทีม',
  username: 'ชื่อผู้ใช้', password: 'รหัสผ่าน', usernamePlaceholder: 'กรอกชื่อผู้ใช้', passwordPlaceholder: 'กรอกรหัสผ่าน',
  signIn: 'เข้าสู่ระบบ', accountHint: 'บัญชีทดสอบ: admin / password123', appName: 'ระบบจัดการบุคลากรและวิเคราะห์เงินเดือน',
  loginRequired: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', loginFailed: 'เข้าสู่ระบบไม่สำเร็จ',
  workspace: 'จัดการบุคลากร', signOut: 'ออกจากระบบ', teamEyebrow: 'ดูแลทีมของคุณในที่เดียว', teamTitle: 'ภาพรวมทีม',
  teamSubtitle: 'ดูข้อมูลพนักงานและวางแผนดูแลทีมได้อย่างชัดเจน', administrator: 'ผู้ดูแลระบบ', hrManager: 'ฝ่ายบุคคล',
  totalEmployees: 'พนักงานทั้งหมด', activeEmployees: 'พนักงานที่ปฏิบัติงาน', onLeave: 'พนักงานที่ลา', monthlyPayroll: 'เงินเดือนรวมต่อเดือน',
  retry: 'ลองใหม่', directory: 'รายชื่อพนักงาน', teamCount: 'สมาชิกในทีม {count} คน', refresh: 'โหลดรายชื่อพนักงานใหม่',
  loadingEmployees: 'กำลังโหลดข้อมูลพนักงาน...', emptyTitle: 'เริ่มสร้างทีมของคุณ', emptySubtitle: 'เพิ่มพนักงานคนแรกด้วยแบบฟอร์ม',
  perMonth: ' / เดือน', statusActive: 'ปฏิบัติงาน', statusOnLeave: 'ลา', toggleStatus: 'สลับสถานะ', delete: 'ลบ',
  toggleFor: 'สลับสถานะของ {name}', deleteFor: 'ลบ {name}',
  edit: 'แก้ไข', editFor: 'แก้ไขข้อมูล {name}', editEmployee: 'แก้ไขข้อมูลพนักงาน', editSubtitle: 'เปลี่ยนชื่อ ตำแหน่ง หรือเงินเดือนของพนักงาน', saveChanges: 'บันทึกการแก้ไข',
  searchEmployees: 'ค้นหาพนักงาน', searchPlaceholder: 'ค้นหาชื่อหรือตำแหน่ง...', clearSearch: 'ล้างการค้นหา', searchCount: 'แสดง {count} จาก {total} คน',
  noSearchResults: 'ไม่พบพนักงานที่ค้นหา', searchTryAgain: 'ลองค้นหาชื่อหรือตำแหน่งอื่น หรือล้างการค้นหา',
  addEmployee: 'เพิ่มพนักงาน', addSubtitle: 'เพิ่มสมาชิกใหม่ให้ทีมของคุณ', fullName: 'ชื่อ-นามสกุล', position: 'ตำแหน่ง', monthlySalary: 'เงินเดือนต่อเดือน (บาท)',
  namePlaceholder: 'เช่น สมชาย ใจดี', positionPlaceholder: 'เช่น วิศวกรซอฟต์แวร์', salaryPlaceholder: 'เช่น 45000',
  formRequired: 'กรุณากรอกชื่อ ตำแหน่ง และเงินเดือนให้ครบ', salaryInvalid: 'กรุณากรอกเงินเดือนเป็นตัวเลขไม่ติดลบ และทศนิยมไม่เกิน 2 ตำแหน่ง เช่น 45000.50',
  fieldsTooLong: 'ชื่อและตำแหน่งต้องยาวไม่เกิน 255 ตัวอักษร', newStatusHint: 'พนักงานใหม่จะมีสถานะเริ่มต้นเป็นปฏิบัติงาน',
  salaryIntelligence: 'วิเคราะห์ข้อมูลเงินเดือน', analysisTitle: 'เข้าใจโครงสร้างเงินเดือนของทีม',
  analysisSubtitle: 'จัดกลุ่มเงินเดือนปัจจุบันเป็น 3 ระดับด้วย K-Means', analyze: 'วิเคราะห์โครงสร้างเงินเดือน', analyzing: 'กำลังวิเคราะห์...',
  calculating: 'กำลังคำนวณกลุ่มเงินเดือน...', analysisHint: 'กดวิเคราะห์เพื่อดูจำนวนพนักงานและเงินเดือนเฉลี่ยของแต่ละระดับ',
  tier: 'ระดับ {number}', averageSalary: 'เงินเดือนเฉลี่ยต่อเดือน', employeeOne: 'พนักงาน {count} คน', employeeMany: 'พนักงาน {count} คน',
  emptyTier: 'ไม่มีพนักงานในระดับนี้', footer: 'ใส่ใจพนักงาน ตัดสินใจด้วยข้อมูล',
  errorTitle: 'ดำเนินการไม่สำเร็จ', requestFailed: 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่', unexpectedError: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
  invalidCredentials: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', loginAgain: 'กรุณาเข้าสู่ระบบเพื่อดูข้อมูลพนักงาน',
  employeeNotFound: 'ไม่พบข้อมูลพนักงาน', endpointNotFound: 'ไม่พบข้อมูลที่ร้องขอ',
  databaseUnavailable: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่ภายหลัง', internalError: 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง',
  invalidJson: 'รูปแบบข้อมูลที่ส่งไม่ถูกต้อง', networkError: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อและลองใหม่',
  confirmTitle: 'ยืนยันการลบ', deletePrompt: 'ต้องการลบ {name} ใช่หรือไม่? เมื่อลบแล้วจะไม่สามารถกู้คืนได้', cancel: 'ยกเลิก',
};

export function translate(language: Language, key: TranslationKey, values: TranslationValues = {}): string {
  const template = language === 'th' ? th[key] : en[key];
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] === undefined ? placeholder : String(values[name]));
}

const errorKeys: Record<string, TranslationKey> = {
  'Invalid username or password.': 'invalidCredentials', 'Please log in to access employee records.': 'loginAgain',
  'Name and position are required.': 'formRequired', 'Name and position must be at most 255 characters.': 'fieldsTooLong',
  'Salary must be a finite, non-negative number with at most 2 decimal places within the safe numeric range.': 'salaryInvalid',
  'Employee not found.': 'employeeNotFound', 'Endpoint not found.': 'endpointNotFound',
  'Database unavailable. Check the server configuration and initialize the HR tables.': 'databaseUnavailable',
  'Internal server error.': 'internalError', 'Invalid JSON request body.': 'invalidJson',
  'The request failed.': 'requestFailed', 'Something went wrong.': 'unexpectedError', 'Login failed.': 'loginFailed',
  'Please enter your username and password.': 'loginRequired',
};
export function translateError(language: Language, message: string): string {
  if (message.startsWith('Cannot connect to the server at ')) return translate(language, 'networkError');
  return Object.prototype.hasOwnProperty.call(errorKeys, message) ? translate(language, errorKeys[message]) : message;
}
