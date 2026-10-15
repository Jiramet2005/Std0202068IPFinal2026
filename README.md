# HR Manager & Salary Analytics System

โปรเจกต์สอบ Internet Programming 2026 ปรับจาก MyProfileAppNindam1 ตามข้อกำหนดใน Final.pdf

ชื่อ repository ที่ผู้ใช้เลือก: **Std0202068IPFinal2026** (เลข 7 หลักท้ายของ 6730202068)

```text
Std0202068IPFinal2026/
├── backend/       Express.js + in-memory employee array + K-Means
├── frontend/      React Native / Expo SDK 57 / Expo Router
├── .gitignore
└── README.md
```

## เริ่มใช้งาน

ใช้ Node.js 22.13 ขึ้นไป (เครื่องนี้ทดสอบด้วย Node.js 24.13.0) เปิด Terminal แยกกัน 2 หน้าต่าง

Terminal แรก:

```powershell
cd backend
npm ci
npm start
```

API ทำงานที่ `http://localhost:5000` ไม่ต้องติดตั้ง MySQL หรือสร้างฐานข้อมูล

Terminal ที่สอง จากโฟลเดอร์หลัก:

```powershell
cd frontend
npm ci
npm start
```

กด `w` เพื่อเปิดเว็บ หรือสแกน QR ด้วย Expo Go ที่รองรับ SDK 57 สามารถใช้ `npm run web`, `npm run android` หรือ `npm run ios` ตามอุปกรณ์ที่มี (iOS Simulator ต้องใช้ macOS)

บัญชีตามโจทย์:

- Username: `admin`
- Password: `password123`
- Token ที่ API ส่งคืน: `mock-jwt-token`

ข้อมูลมีพนักงานเริ่มต้น 6 คน เก็บใน array บนเซิร์ฟเวอร์ การปิด/เริ่ม backend ใหม่จะคืนข้อมูลเริ่มต้นตามโจทย์ การรีเฟรชหน้าเว็บจะต้องล็อกอินใหม่

## เชื่อมต่อจากมือถือหรือ Emulator

มือถือและคอมพิวเตอร์ต้องอยู่ Wi-Fi เดียวกัน แอปจะพยายามใช้ IP ของ Expo dev server อัตโนมัติ หากเชื่อมต่อไม่ได้ ให้คัดลอก `frontend/.env.example` เป็น `frontend/.env` และกำหนด:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

แทน IP ด้วย IPv4 ของเครื่องที่รัน backend จาก `ipconfig` แล้วเริ่ม Expo ใหม่ หากมี Windows Firewall ให้ผู้ใช้อนุญาต Node.js บนเครือข่ายที่ใช้งาน

- เว็บบนเครื่องเดียวกัน: `http://localhost:5000`
- Android Emulator: `http://10.0.2.2:5000` หรือ IP ของเครื่อง
- iOS Simulator: `http://localhost:5000`
- มือถือจริง: `http://<LAN-IP-ของคอมพิวเตอร์>:5000`

หากเปลี่ยนพอร์ต backend ด้วย environment variable `PORT` ต้องเปลี่ยน `EXPO_PUBLIC_API_URL` ให้ตรงกัน

## สิ่งที่ทำตามโจทย์

| ข้อกำหนด | การทำงาน |
| --- | --- |
| Login | ตรวจ admin / password123, รหัสผิดตอบ 401 และแสดง Alert |
| ป้องกันการเข้าถึง | Dashboard ต้องล็อกอิน และ employee API ทุกเส้นทางต้องส่ง Bearer token |
| ข้อมูลพนักงาน | id, name, position, status, salary เป็นตัวเลข มีข้อมูลเริ่มต้น 6 คน |
| แสดงข้อมูล | รายชื่อ ตำแหน่ง สถานะ เงินเดือน พร้อมสรุปจำนวนและ payroll |
| เพิ่มพนักงาน | ตรวจค่าว่างทั้ง client/server, trim ช่องว่าง, ตรวจเงินเดือนเป็นตัวเลขที่ไม่ติดลบ |
| สลับสถานะ | Active ↔ On Leave และแสดงผลทันที |
| ลบพนักงาน | ยืนยัน “Are you sure?” ก่อนส่ง DELETE; Native ใช้ Alert, Web ใช้ confirm |
| วิเคราะห์เงินเดือน | ปุ่ม Analyze Salary Structure เรียก backend มี Loading Indicator |
| ผลวิเคราะห์ | แสดง Tier 1–3, จำนวนคน และ centroid/เงินเดือนเฉลี่ย |
| ข้อผิดพลาด | จัดการ network timeout, API error, ไม่พบ id, JSON เสีย และการกดซ้ำระหว่างทำงาน |

### API

| Method | Path | ผลสำเร็จ |
| --- | --- | --- |
| POST | /api/login | 200 `{ "success": true, "token": "mock-jwt-token" }` |
| GET | /api/employees | 200 array พนักงาน |
| POST | /api/employees | 201 พนักงานใหม่; body มี name, position, salary |
| PUT | /api/employees/:id/status | 200 พนักงานหลังสลับสถานะ; ไม่ต้องส่ง body |
| DELETE | /api/employees/:id | 200 `{ "success": true }` |
| GET | /api/employees/salary-clusters | 200 `{ "success": true, "clusters": [...] }` |
| GET | /api/health | 200 ใช้ตรวจว่าเซิร์ฟเวอร์ทำงาน |

ทุกเส้นทาง `/api/employees` ต้องส่ง `Authorization: Bearer mock-jwt-token` หากไม่ส่งหรือ token ผิดจะตอบ 401; ข้อมูลเพิ่มพนักงานไม่ถูกต้องตอบ 400; id ที่ไม่มีอยู่ตอบ 404

ตัวอย่าง body สำหรับเพิ่มพนักงาน:

```json
{ "name": "John Doe", "position": "Software Engineer", "salary": 45000 }
```

salary ต้องเป็น JSON number ที่ finite, ไม่ติดลบ และไม่เกิน `Number.MAX_SAFE_INTEGER` รองรับเงินเดือน 0; string `"45000"`, ค่าว่าง, null และ boolean ใช้ไม่ได้

### K-Means

ทำ 1D K-Means บน **salary ของพนักงานปัจจุบันทั้งหมด** ที่ backend ใช้ k=3 เริ่มจากค่าต่ำสุด ค่ากลาง และค่าสูงสุดของค่าที่ไม่ซ้ำ วนจัดกลุ่มใกล้ centroid และคำนวณค่าเฉลี่ยจนลู่เข้าหรือครบ 100 รอบ เรียง centroid จากน้อยไปมากเป็น Tier 1–3 ปัดค่าเฉลี่ยที่แสดงเป็น 2 ตำแหน่ง

หากมีค่าเงินเดือนที่แตกต่างกันน้อยกว่า 3 ค่า จะใช้จำนวนกลุ่มที่มีข้อมูลจริง และเติม tier ว่างให้ครบ 3 กลุ่ม โดยกลุ่มว่างมี `count: 0, centroid: null` ไม่สร้างค่าเฉลี่ยเทียม ถ้าไม่มีพนักงานจะได้ 3 กลุ่มว่าง

ผลเริ่มต้น: Tier 1 = 20,000 (2 คน), Tier 2 = 46,500 (2 คน), Tier 3 = 90,000 (2 คน) เมื่อเพิ่ม/สลับสถานะ/ลบพนักงาน แอปจะล้างผลวิเคราะห์เดิม ให้กดวิเคราะห์ใหม่เพื่อใช้ข้อมูลล่าสุด

## ส่วนที่นำมาจากโค้ดเดิม

- ใช้โครง package และเวอร์ชัน Expo/React Native เดิม พร้อม TypeScript config
- ปรับ AuthContext จาก user object เป็น token ตาม response ในโจทย์
- ปรับรูปแบบ fetch/login + Expo Router เป็นหน้าล็อกอินและ Dashboard ของ HR
- ดัดแปลงแนวคิด `enrichWithKMeans` ที่เดิมจัดกลุ่มราคาสินค้า เป็น salary clustering บน backend และเพิ่มการจัดการชุดข้อมูลว่าง/ซ้ำ
- ใช้ไฟล์ app icon เดิม; ไม่ยก MySQL, ข้อมูลสมาชิก, ที่อยู่ API เดิม หรือระบบร้านค้าเข้ามา

อ้างอิง API ของ framework: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) และ [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)

## ตรวจสอบ

```powershell
cd backend
npm test
cd ../frontend
npm run typecheck
npm run export:web
```

ผลตรวจในเครื่องนี้: backend tests ผ่าน 3 ชุด (หลายกรณีต่อชุด), TypeScript ผ่าน, export เว็บ/Android/iOS ผ่าน และ API กับ Expo dev server ตอบ HTTP ได้จริง การ export บน Android/iOS เป็นการตรวจ bundle ไม่ใช่การทดสอบบนเครื่องจริง ยังไม่ได้ตรวจการกด UI และรูปแบบหน้าจอในเบราว์เซอร์/มือถือ เพราะช่องทางควบคุมเบราว์เซอร์ไม่พร้อมใช้งาน

การติดตั้งใหม่ผ่าน npm registry ถูกจำกัดโดย sandbox ใน session นี้ จึงใช้ node_modules เดิมที่มีเวอร์ชันตรงกันเพื่อทดสอบ และสร้าง package-lock.json สำหรับ `npm ci` บนเครื่องผู้ตรวจ ไม่ใส่ node_modules ในไฟล์ ZIP

การทดสอบ backend ครอบคลุม login สำเร็จ/ล้มเหลว, ป้องกัน endpoint, validation, JSON เสีย, เพิ่ม/อ่าน/สลับสถานะสองครั้ง/ลบ, id ไม่มีอยู่, id ไม่ซ้ำหลังลบ, analytics จากข้อมูลล่าสุด และกรณีไม่มีพนักงาน รวมถึง K-Means ข้อมูลอ้างอิง/เงินเดือนซ้ำ/น้อยกว่า 3 ค่า/เงินเดือน 0

ตรวจหน้าจอด้วยตนเองก่อนส่ง:

1. เข้า Dashboard โดยยังไม่ล็อกอิน ต้องเปลี่ยนไปหน้า Login
2. ล็อกอินผิด ต้องมี Alert แล้วล็อกอินด้วยบัญชีข้างต้น
3. กด Add Employee ขณะฟอร์มว่าง ต้องไม่ส่งข้อมูล; ลองเงินเดือนติดลบ/ไม่ใช่ตัวเลข
4. เพิ่มพนักงาน เงินเดือน 35000 แล้วตรวจข้อมูลในรายการ
5. กด Toggle Status สองครั้ง ต้องเปลี่ยน Active → On Leave → Active
6. กด Delete แล้ว Cancel ต้องยังอยู่; กด Delete แล้วยืนยันต้องหายไป
7. กด Analyze Salary Structure ต้องมี Loading และการ์ดครบ 3 Tier
8. เพิ่ม/ลบแล้ววิเคราะห์ใหม่ ยอดคนรวมต้องตรงกับรายชื่อ
9. Sign out แล้ว Dashboard ต้องถูกป้องกัน

## ส่งงาน

สร้าง **Public GitHub repository** ชื่อ `Std0202068IPFinal2026` แล้ว push จากโฟลเดอร์นี้หรือโฟลเดอร์ที่แตกจาก ZIP:

```powershell
git init
git add .
git commit -m "Build HR manager and salary analytics final project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Std0202068IPFinal2026.git
git push -u origin main
```

แทน YOUR_USERNAME ด้วยบัญชีจริง ตรวจหน้า GitHub ว่ามี `backend/` และ `frontend/` ที่ root จากนั้นนำ URL repository ไปส่ง LMS ตามเวลาที่ผู้สอนกำหนด

ขั้นตอนเผยแพร่ GitHub และส่ง LMS ยังต้องดำเนินการ ไม่ใช่ผลจากการสร้างโค้ดในเครื่อง
