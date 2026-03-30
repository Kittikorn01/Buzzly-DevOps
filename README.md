# 🐝 Buzzly - Web Local Development Guide

คู่มือการติดตั้งและรันโปรเจกต์ Buzzly บนเครื่องคอมพิวเตอร์ (Local Environment)

> [!TIP]
> โปรเจกต์นี้ถูกตั้งค่าให้เชื่อมต่อกับ **Supabase Cloud** ไว้แล้วในไฟล์ `.env` ดังนั้นคุณสามารถรัน Web ได้ทันทีโดยไม่ต้องติดตั้ง Database ในเครื่อง (ไม่ต้องใช้ Docker)

---

## 🚀 วิธีที่ 1: รันแบบเชื่อมต่อ Supabase Cloud (แนะนำ)

ใช้ฐานข้อมูลและระบบ Auth เดียวกันกับบน Cloud (เหมาะสำหรับพัฒนาฟีเจอร์ทั่วไป)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์:
```bash
npm install
```

### 2. เริ่มทำงาน Mock API Server
จำเป็นต้องรันเพื่อให้ระบบดึงข้อมูลจำลอง (เช่น Facebook Analytics) ได้:
```bash
cd mock-api
npm install
npm start
```
*Mock Server จะทำงานอยู่ที่ [http://localhost:3001](http://localhost:3001)*

### 3. เริ่มทำงาน Frontend
เปิด Terminal ใหม่ (ย้อนกลับมาที่โฟลเดอร์หลัก):
```bash
npm run dev
```
*เข้าใช้งาน Web ได้ที่: [http://localhost:5173](http://localhost:5173)*

---

## 🏗️ วิธีที่ 2: รันแบบ Local Supabase (กรณีต้องการ Offline/Test)

หากต้องการทดลองระบบโดยไม่กระทบข้อมูลบน Cloud หรือต้องการรันแบบ Offline

### 1. เริ่มใช้งาน Docker & Supabase
ตรวจสอบว่า **Docker Desktop** เปิดอยู่ แล้วรัน:
```bash
npx supabase start
```

### 2. อัปเดตไฟล์ .env
เปลี่ยนค่าในไฟล์ `.env` ให้ชี้มาที่เครื่องตัวเอง (ดูตัวอย่างจาก `.env.example`):
```env
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_PUBLISHABLE_KEY="<LOCAL_KEY_FROM_SUPABASE_START>"
```

### 3. ตั้งค่าระบบเริ่มต้น
รันสคริปต์เพื่อสร้างตารางและใส่ข้อมูลตัวอย่าง:
```bash
bash setup-full.sh
```

---

## 🔐 ข้อมูลเข้าสู่ระบบ (Login)
*สำหรับการใช้งานบน Cloud กรุณาใช้อีเมล/รหัสผ่านที่คุณสร้างไว้ หรือหากใช้ Local ให้ใช้บัญชีเหล่านี้:*

| บทบาท | อีเมล | รหัสผ่าน |
| :--- | :--- | :--- |
| **Owner** | `hachikonoluna@gmail.com` | `owner123` |
| **Dev** | `dev@buzzly.co` | `dev123` |
| **Support** | `support@buzzly.co` | `support123` |

---
> [!IMPORTANT]
> หากต้องการเปลี่ยนไปใช้ Cloud อีกครั้ง อย่าลืมเช็คให้แน่ใจว่าไฟล์ `.env` กลับมาเป็น URL ของ Supabase Cloud (`https://kjjdixstidjdgijnzviy.supabase.co`)
