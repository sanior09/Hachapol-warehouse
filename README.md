# Nachapol Shop — WMS v3.5 🖥️📦

ระบบบริหารจัดการสต็อกสินค้าคอมพิวเตอร์และอุปกรณ์ไอทีครบวงจร (Warehouse Management System)

> 🎓 **หมายเหตุทางวิชาการ (Academic Notice):**  
> โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษาและการส่งงานอาจารย์ (Coursework & Academic Project Submission)

🌐 **ลิงก์เข้าชมระบบจริง (Live Website):** [https://hachapol-warehouse.vercel.app/](https://hachapol-warehouse.vercel.app/)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

- **คลังสินค้าครบวงจร (Product Catalog & Inventory):** จัดการและติดตามสถานะสต็อกสินค้าไอทีกว่า 50 รายการ (SKU-001 ถึง SKU-050)
- **ระบบวิเคราะห์และการแจ้งเตือน (Analytics & Low Stock Alerts):** แจ้งเตือนสินค้าใกล้หมดสต็อก พร้อมระบบออกใบสั่งซื้อด่วน
- **ประวัติการทำรายการ (Transaction History):** บันทึกประวัติการรับเข้าและเบิกออกสินค้าแบบเรียลไทม์
- **Dark Tech UI:** ดีไซน์ทันสมัย ตอบสนองทุกขนาดหน้าจอ (Responsive) ด้วย Tailwind CSS และ Lucide Icons
- **ระบบจัดเก็บข้อมูล (Local State Management):** รองรับการเพิ่ม ลบ แก้ไข และบันทึกข้อมูลการเปลี่ยนแปลงสต็อก

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** HTML5, Modern JavaScript (ES6+), CSS3
- **Styling & Icons:** Tailwind CSS (CDN), Lucide Icons
- **Deployment & Hosting:** Vercel (Edge Network)
- **Version Control:** Git & GitHub

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
สต็อกสินค้า/
├── css/
│   └── styles.css          # สไตล์ตกแต่ง Dark Tech UI
├── images/                 # รูปภาพสินค้า SKU-001 ถึง SKU-050
├── js/
│   ├── app.js             # ตรรกะการทำงาน WMS หลัก
│   ├── image-renderer.js  # ตัวประมวลผลการแสดงผลภาพสินค้า
│   └── products-data.js   # ฐานข้อมูลสินค้าเริ่มต้น (50 SKUs)
├── index.html             # หน้าจอระบบคลังสินค้าหลัก
├── .gitignore             # รายการไฟล์ที่ไม่ต้องการให้ Git ติดตาม
├── LICENSE                # สัญญาอนุญาตซอฟต์แวร์ (MIT License)
└── README.md              # เอกสารและรายละเอียดโปรเจกต์
```

## 🚀 การเปิดใช้งาน (Getting Started)

เปิดไฟล์ `index.html` บนเครื่องคอมพิวเตอร์ผ่านเว็บเบราว์เซอร์ (Google Chrome, Microsoft Edge) เพื่อทดสอบแบบ Local โดยไม่ต้องติดตั้งเซิร์ฟเวอร์

## 📄 สัญญาอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้เงื่อนไข [MIT License](LICENSE) — Copyright (c) 2026 sanior09
