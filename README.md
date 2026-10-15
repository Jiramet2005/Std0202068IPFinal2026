# HR Manager & Salary Analytics System

โปรเจกต์ `Std0202068IPFinal2026` โดย **Jiramet Berkban — 6730202068** ปรับจาก MyProfileAppNindam1 มี Express backend และ React Native / Expo SDK 57 frontend

## โหมดที่รองรับ

- **MySQL / คลาวด์อาจารย์:** ข้อมูลพนักงาน บัญชีแอป session และประวัติผลวิเคราะห์เก็บใน MySQL ข้อมูลยังอยู่เมื่อรีสตาร์ต backend
- **Memory / ตาม Final.pdf:** เก็บพนักงานใน array และเริ่มต้นข้อมูลใหม่เมื่อรีสตาร์ต ใช้ `STORAGE_MODE=memory`

```text
Std0202068IPFinal2026/
├── backend/
│   ├── app.js, server.js, clustering.js
│   ├── memory-store.js, mysql-store.js, config.js
│   ├── schema.sql, init-db.js, verify-mysql.js
│   ├── .env.example
│   └── public/       generated web build; ไม่ใส่ Git/ZIP source
├── frontend/
├── DEPLOYMENT.md
└── README.md
```

## ค่าคลาวด์ที่ตรวจพบจากโปรเจกต์เดิม

| รายการ | ค่า |
| --- | --- |
| Host | 119.59.102.161 |
| SSH Terminal | port 2222, interactive session เท่านั้น |
| SFTP / FileZilla | port 22 |
| Cloud user | std6730202068 |
| Database | ip_std6730202068 |
| DB host เมื่อรันบนคลาวด์ | localhost:3306 |
| Backend port ในโปรเจกต์เดิม | 3009 |
| โฟลเดอร์ที่เตรียมสำหรับ HR | /app/hr-final/backend |
| URL หลังรันสำเร็จ | http://119.59.102.161:3009 |

เมื่อรันแบบ foreground ต้องเปิด SSH ค้างไว้ โปรดดูขั้นตอนติดตั้งและเปิดเว็บใน [DEPLOYMENT.md](DEPLOYMENT.md)

## บัญชีล็อกอินแอป

- Username: `admin`
- Password: `password123`
- Response ตามโจทย์: `{ "success": true, "token": "mock-jwt-token" }`

บัญชีนี้แยกจากบัญชี SSH / SFTP / MySQL ของนักศึกษา ห้ามใช้รหัสคลาวด์ในฟอร์มล็อกอินแอป

## รันแบบ Memory ในเครื่อง

Backend รองรับ Node.js 18 ขึ้นไป; frontend Expo SDK 57 ใช้ Node.js 22.13 ขึ้นไป

Terminal 1:

```powershell
cd backend
npm ci
$env:STORAGE_MODE='memory'
$env:PORT='5000'
npm start
```

Terminal 2 จากโฟลเดอร์หลัก:

```powershell
cd frontend
npm ci
npm start
```

กด `w` เพื่อเปิดเว็บ หรือใช้ Expo Go ที่รองรับ SDK 57 บนมือถือ backend ทำงานที่ localhost:5000 หากใช้มือถือจริงให้ตั้ง `frontend/.env` เป็น IP ของคอมพิวเตอร์ตามตัวอย่างใน `.env.example`

environment variable ของ Terminal จะมีความสำคัญกว่าไฟล์ `.env` หากจะเปลี่ยนกลับเป็น MySQL ให้เปิด Terminal ใหม่หรือลบ `STORAGE_MODE` / `PORT` ที่ตั้งไว้

## รันกับ MySQL บนคลาวด์

ขั้นตอนครบอยู่ใน [DEPLOYMENT.md](DEPLOYMENT.md)

1. ตั้งค่า `backend/.env` จาก `.env.example` ด้วย DB credentials ของตัวเอง (ไฟล์จริงถูก ignore)
2. อัปโหลด backend และ public ที่ build แล้วไปโฟลเดอร์ใหม่ `/app/hr-final/backend`
3. เข้า SSH แบบ interactive พอร์ต 2222 แล้วรัน `npm ci --omit=dev`, `node init-db.js`, `node verify-mysql.js` และ `node server.js`
4. ตรวจ `/api/health` ต้องได้ `success: true, storage: "mysql"`

ผู้ที่ clone ใหม่ต้องสร้าง `backend/.env` เองจากตัวอย่าง ไม่มีรหัสผ่านฐานข้อมูลจริงใน Git

หากใช้ frontend ผ่าน Expo ในเครื่องกับ API คลาวด์ ให้สร้าง `frontend/.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://119.59.102.161:3009
```

เริ่ม Expo ใหม่หลังแก้ `.env` เมื่อใช้ API คลาวด์ มือถือไม่จำเป็นต้องอยู่ Wi-Fi เดียวกับคอมพิวเตอร์ที่พัฒนา

## Database

ชื่อตารางใช้ชื่อผู้จัดทำเป็น prefix: `Jiramet_` ชื่อฐานข้อมูลยังเป็น `ip_std6730202068` และชื่อคอลัมน์/API ยังคงเดิม เช่น `id`, `name`, `salary`

หากเคยใช้ตาราง `hr_` ต้องรัน migration ก่อนใช้โค้ดรุ่นนี้ ดูขั้นตอนใน [DEPLOYMENT.md](DEPLOYMENT.md)

ใช้ database เดิมที่ได้รับจากอาจารย์ ไม่สร้างหรือลบ database และไม่แก้ตารางเดิม `users`, `products`, `orders` ฯลฯ

| ตารางใหม่ | ข้อมูลที่เก็บ |
| --- | --- |
| Jiramet_employees | ชื่อ ตำแหน่ง สถานะ เงินเดือน และเวลาเพิ่ม/แก้ไข |
| Jiramet_users | บัญชีแอป โดยเก็บ password เป็น scrypt hash พร้อม random salt |
| Jiramet_sessions | hash ของ mock token ตามรูปแบบที่โจทย์กำหนด |
| Jiramet_salary_analyses | snapshot เงินเดือน, ผล cluster และเวลาวิเคราะห์แต่ละครั้ง |
| Jiramet_schema_migrations | บันทึกว่าลงข้อมูลตั้งต้นแล้ว ป้องกัน seed ซ้ำ |

`npm run init-db` สร้างตารางและพนักงานตัวอย่าง 6 คนครั้งแรก การรันซ้ำไม่ reset พนักงานและไม่เติมข้อมูลที่ผู้ใช้ลบไปแล้ว คำสั่ง CRUD ใช้ SQL parameters; salary เก็บเป็น DECIMAL(18,2)

คลาวด์ที่ใช้งานไม่มี REFERENCES privilege จึงใช้ดัชนี user_id ใน Jiramet_sessions และตรวจความสัมพันธ์กับ Jiramet_users ด้วย JOIN ตอนยืนยัน token แทน database foreign key

`npm run verify:mysql` ตรวจการบันทึกถาวรโดยเพิ่มพนักงานทดสอบ 1 ราย ปิดและเปิด connection ใหม่ ตรวจเงินเดือนทศนิยม สลับสถานะสองครั้ง แล้วลบเฉพาะแถวทดสอบที่คำสั่งนี้สร้างเอง ไม่ลบข้อมูลพนักงานคนอื่น

## ฟังก์ชันตามโจทย์

- Login พร้อมแจ้งเตือนเมื่อรหัสผิด; ป้องกัน Dashboard และ employee API ด้วย Bearer token
- ปุ่ม ไทย / EN บนหน้า Login และ Dashboard เปลี่ยนข้อความ ฟอร์ม สถานะ และข้อความยืนยัน/แจ้งเตือนทันที เริ่มต้นภาษาไทย และเว็บจำภาษาที่เลือกไว้ใน browser
- แสดงชื่อ ตำแหน่ง สถานะ เงินเดือน พร้อมฟอร์มเพิ่มพนักงาน
- ตรวจข้อมูลทั้ง frontend/backend: ห้ามค่าว่าง ชื่อ/ตำแหน่งไม่เกิน 255 ตัวอักษร เงินเดือนไม่ติดลบและทศนิยมไม่เกิน 2 ตำแหน่ง
- Toggle Status: Active ↔ On Leave
- Delete พร้อม “Are you sure?” ก่อนส่ง request (Native ใช้ Alert, Web ใช้ confirm)
- Analyze Salary Structure พร้อม loading และการ์ด Tier 1–3: count, centroid
- ในโหมด MySQL บันทึกประวัติผลวิเคราะห์ลง DB ด้วย
- จัดการ network timeout, DB error, JSON ผิด, id ไม่มีอยู่ และการกดซ้ำขณะทำงาน

## API

| Method | Path | ผลสำเร็จ |
| --- | --- | --- |
| POST | /api/login | 200, success และ token |
| GET | /api/employees | 200, array พนักงาน |
| POST | /api/employees | 201, พนักงานใหม่ |
| PUT | /api/employees/:id/status | 200, พนักงานหลังสลับสถานะ |
| DELETE | /api/employees/:id | 200, success |
| GET | /api/employees/salary-clusters | 200, success และ clusters; MySQL บันทึกผลด้วย |
| GET | /api/health | 200, success และ storage; DB ใช้ไม่ได้จะตอบ 503 |

ทุกเส้นทาง `/api/employees` ต้องส่ง `Authorization: Bearer mock-jwt-token` โหมด MySQL ต้องล็อกอินก่อนจึงมี session ใน DB

ตัวอย่างเพิ่มพนักงาน:

```json
{ "name": "John Doe", "position": "Software Engineer", "salary": 45000.50 }
```

salary ต้องเป็น JSON number ที่ finite ไม่ติดลบ ไม่เกิน Number.MAX_SAFE_INTEGER และมีทศนิยมไม่เกิน 2 ตำแหน่ง ค่า 0 ใช้ได้ ส่วน `"45000"`, null, boolean ใช้ไม่ได้

## K-Means

Backend ดึง salary ของพนักงานปัจจุบันทั้งหมด ใช้ 1D K-Means k=3 เริ่มจากค่าต่ำสุด ค่ากลาง และค่าสูงสุดของค่าที่ไม่ซ้ำ วนจนลู่เข้าหรือครบ 100 รอบ แล้วเรียง centroid จากต่ำไปสูงเป็น Tier 1–3

หากมีเงินเดือนต่างกันน้อยกว่า 3 ค่า เติม tier ว่างด้วย `count: 0, centroid: null` ให้ครบ 3 กลุ่ม หากไม่มีพนักงานจะได้ 3 กลุ่มว่าง ไม่สร้างค่าเฉลี่ยเทียม ผลเริ่มต้นคือ 20,000 / 46,500 / 90,000 บาท กลุ่มละ 2 คน

เมื่อข้อมูลพนักงานเปลี่ยน frontend ล้างผลเดิม ให้กดวิเคราะห์ใหม่เพื่อใช้ข้อมูลล่าสุด

## ตรวจสอบ

```powershell
cd backend
npm test
cd ../frontend
npm run typecheck
```

Build เว็บสำหรับเสิร์ฟจาก backend เดียวกัน (รันในเครื่อง ไม่ต้องติดตั้ง Expo บนคลาวด์):

```powershell
cd backend
npm ci
cd ../frontend
npm ci
cd ../backend
npm run build:cloud
```

ไฟล์เว็บจะอยู่ `backend/public/` โดยตั้ง API เป็นปลายทางคลาวด์ หากเปลี่ยน URL ใช้ `npm run build:cloud -- https://YOUR_API_HOST`

ตรวจสอบล่าสุด: backend tests ผ่าน 12 ชุด ครอบคลุม API/validation/error handling/config/K-Means และ migration; TypeScript และ build เว็บ/Android/iOS ผ่าน การทดสอบ MySQL บนคลาวด์ผ่านการบันทึกข้อมูล ปิดและเปิด connection ใหม่ ตรวจทศนิยม สลับสถานะ และลบแถวทดสอบ การเปลี่ยนชื่อเป็น Jiramet_ สำเร็จโดยคงข้อมูลเดิมไว้ การกดใช้งาน UI ทุกขั้นตอนบน browser/มือถือจริงยังต้องตรวจด้วยตนเอง

## โค้ดที่นำมาจากโปรเจกต์เดิม

ใช้เวอร์ชัน Expo / React Native, TypeScript config, AuthContext, รูปแบบ login/fetch, แนวคิด K-Means, และรูปแบบ MySQL connection pool เดิม ปรับเป็นตาราง HR แยกจากงานร้านค้า

เอกสารอ้างอิง: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [MySQL2](https://sidorares.github.io/node-mysql2/docs)

## ส่ง GitHub / LMS

Repository สำหรับส่งงาน: **[Std0202068IPFinal2026](https://github.com/Jiramet2005/Std0202068IPFinal2026)** โดยมี backend/ และ frontend/ ที่ root และไม่รวม `.env`, node_modules, tmp หรือชุดอัปโหลดส่วนตัว

ส่ง URL repository นี้เข้า LMS ตามกำหนดของรายวิชา การอัปโหลด GitHub ไม่ใช่การส่ง LMS โดยอัตโนมัติ
