# ติดตั้งและเปิดเว็บบนคลาวด์

ผู้จัดทำ Jiramet Berkban รหัส 6730202068 ใช้ database `ip_std6730202068` และ port `3009` บน `119.59.102.161`

## อัปเดตปุ่มแก้ไขและช่องค้นหา

ชุดไฟล์พร้อมอัปโหลดในเครื่องของผู้จัดทำอยู่ที่ `tmp/cloud-upload/hr-final/backend/` อัปโหลด `app.js`, `memory-store.js`, `mysql-store.js`, `verify-mysql.js` และโฟลเดอร์ `public/` ไปแทนไฟล์ใน `/app/hr-final/backend` ผ่าน FileZilla โดยคง `.env` ของคลาวด์ไว้ ไม่ต้องสร้างตารางใหม่หรือรัน migration

หยุด server HR เดิมด้วย Ctrl+C แล้วรันบน SSH:

```sh
cd /app/hr-final/backend
node verify-mysql.js
node server.js
```

เมื่อทดสอบฐานข้อมูลผ่านและ server เริ่มสำเร็จ เปิดเว็บแล้วกด Ctrl+F5 จะเห็นช่องค้นหาชื่อ/ตำแหน่ง และปุ่มแก้ไขในแต่ละรายชื่อ ปุ่มแก้ไขเปลี่ยนชื่อ ตำแหน่ง และเงินเดือน ส่วนสถานะยังเปลี่ยนด้วยปุ่มสลับสถานะเดิม

## เตรียมจาก source ที่ clone ใหม่

ติดตั้ง Node.js 22.13 ขึ้นไปในเครื่องพัฒนา เปิด Terminal ที่โฟลเดอร์หลัก:

```powershell
cd backend
npm ci
cd ../frontend
npm ci
cd ../backend
npm run build:cloud
```

จะได้เว็บพร้อมใช้งานที่ `backend/public/` โดยเชื่อม API `http://119.59.102.161:3009` หากใช้เซิร์ฟเวอร์อื่นให้ build ด้วย `npm run build:cloud -- https://YOUR_API_HOST`

คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วใส่ DB password จริงของตนเอง ใช้ `STORAGE_MODE=mysql`, `DB_HOST=localhost`, `DB_NAME=ip_std6730202068` และ `PORT=3009` เก็บไฟล์จริงเป็นส่วนตัว ไม่ใส่ GitHub

ใน FileZilla เชื่อม SFTP port **22** แล้วอัปโหลดไฟล์ใน `backend/` รวม `.env` และโฟลเดอร์ `public/` ไป `/app/hr-final/backend` ไม่ต้องอัปโหลด `node_modules/` เพราะติดตั้งบนคลาวด์ได้

## ติดตั้งฐานข้อมูลครั้งแรก

เปิด Command Prompt หรือ Terminal บน Windows:

```sh
ssh -p 2222 std6730202068@119.59.102.161
```

ใส่รหัสผ่าน แล้วรันบน SSH ทีละคำสั่ง:

```sh
cd /app/hr-final/backend
chmod 600 .env
npm ci --omit=dev
node init-db.js
node verify-mysql.js
node server.js
```

ทำคำสั่งต่อไปเมื่อคำสั่งก่อนหน้าสำเร็จ `init-db.js` สร้างเฉพาะตาราง Jiramet_ และ seed ครั้งแรก ไม่สร้างหรือลบ database และไม่แก้ตารางร้านค้าเดิม ส่วน `verify-mysql.js` เพิ่มและลบเฉพาะข้อมูลทดสอบของตัวเอง

เมื่อขึ้น `HR API listening on port 3009 (mysql)` เปิด [หน้าเว็บ](http://119.59.102.161:3009) แล้วล็อกอิน `admin / password123` คำสั่งนี้เสิร์ฟทั้งเว็บใน public/ และ API เปิด SSH ค้างไว้ระหว่างใช้งานแบบ foreground

## เปิดเว็บครั้งต่อไป

เข้า SSH ด้วยคำสั่งด้านบน แล้วรัน:

```sh
cd /app/hr-final/backend
node server.js
```

ไม่ต้องรัน initializer หรือ migration ใหม่ทุกครั้ง หากมี server รันอยู่แล้วให้เปิดเว็บได้เลย

## ตารางที่เก็บข้อมูล

ใน phpMyAdmin เลือก database `ip_std6730202068` แล้ว Refresh:

| ตาราง | ข้อมูล |
| --- | --- |
| Jiramet_employees | ข้อมูลพนักงานและเงินเดือน |
| Jiramet_users | บัญชีล็อกอินแอป |
| Jiramet_sessions | session ที่ใช้ยืนยัน token |
| Jiramet_salary_analyses | ประวัติการวิเคราะห์เงินเดือน |
| Jiramet_schema_migrations | การลงข้อมูลตั้งต้น |

กด Browse ที่ `Jiramet_employees` หลังเพิ่มข้อมูลผ่านเว็บ จะเห็นแถวใหม่ ตรวจ [health](http://119.59.102.161:3009/api/health) ให้ได้ `success: true` และ `storage: "mysql"`

บัญชีคลาวด์ไม่มี REFERENCES privilege จึงใช้ INDEX ของ user_id และตรวจ session ด้วย JOIN ไปยัง Jiramet_users แทน foreign key

## เปลี่ยนจากตาราง hr_ เดิมโดยคงข้อมูลไว้

ใช้เฉพาะระบบรุ่นเก่าที่ยังมีตาราง hr_ ระบบของผู้จัดทำเปลี่ยนชื่อสำเร็จแล้ว และคงข้อมูลเดิมไว้ ไม่ต้องรันซ้ำสำหรับการเปิดเว็บตามปกติ

อัปโหลด backend รุ่นใหม่ หยุด server HR ด้วย Ctrl+C แล้วรัน:

```sh
cd /app/hr-final/backend
node migrate-table-names.js --check
node migrate-table-names.js --apply
node init-db.js
node verify-mysql.js
node server.js
```

--check แสดงรายการก่อนเปลี่ยน --apply เปลี่ยนชื่อ hr_employees, hr_users, hr_sessions, hr_salary_analyses และ hr_schema_migrations ให้ขึ้นต้นด้วย Jiramet_ ด้วย RENAME TABLE คำสั่งเดียว ตรวจจำนวนแถวก่อน/หลัง โดยคงคอลัมน์และข้อมูลไว้ รันซ้ำเมื่อเปลี่ยนครบแล้วจะไม่เปลี่ยนเพิ่ม หากพบทั้งชื่อเก่าและชื่อใหม่จะหยุดโดยไม่ทับตาราง

หากพบ Missing HR tables หรือ Permission denied ให้ตรวจข้อความก่อน ไม่ลบตารางเพื่อเริ่มใหม่ สคริปต์ไม่เปลี่ยนสิทธิ์บัญชี initializer จะหยุดหากยังพบ hr_ เพื่อป้องกันตารางใหม่ว่างแยกจากข้อมูลเดิม

## อัปเดตหน้าเว็บและปุ่มภาษา ไทย / EN

หลังแก้ frontend ให้รัน `npm run build:cloud` ใน backend บนเครื่องพัฒนา แล้วอัปโหลด `backend/public/` ไป `/app/hr-final/backend/public` เขียนทับไฟล์ชื่อเดียวกัน รอการโอนเสร็จแล้วกด Ctrl+F5 หน้าเว็บ หาก backend รันอยู่จะเสิร์ฟไฟล์ใหม่ได้ทันที ไม่ต้องรัน initializer หรือ migration เพื่ออัปเดตภาษา

## รัน frontend ในเครื่องและเชื่อม API คลาวด์

สร้าง `frontend/.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://119.59.102.161:3009
```

เปิด Terminal บนเครื่องพัฒนา:

```powershell
cd frontend
npm ci
npm run web
```

backend บนคลาวด์ต้องรันอยู่ เริ่ม Expo ใหม่เมื่อเปลี่ยนค่า .env หากต้องการรันทั้งหมดในเครื่องแบบ memory ให้ดู README.md

อ้างอิง SQL: [MySQL RENAME TABLE](https://dev.mysql.com/doc/refman/8.4/en/rename-table.html)
