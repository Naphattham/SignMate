# Video Tutorials Structure

โครงสร้างโฟลเดอร์สำหรับเก็บวิดีโอสอนภาษามือ จัดเรียงตามหมวดหมู่และคำศัพท์

## โครงสร้างโฟลเดอร์

```
videos/
└── tutorials/
    ├── greetings/      # บทสนทนาทั่วไป
    ├── illness/        # อาการเจ็บป่วย
    ├── questions/      # คำถาม-คำตอบ
    └── emotions/       # อารมณ์
```

## การตั้งชื่อไฟล์

ใช้ชื่อที่ตรงกับ `modelLabel` ใน constants.ts

### 1. Greetings (บทสนทนาทั่วไป)
- `hello_adult.mp4` - สวัสดี
- `bye_go.mp4` - ลาก่อน
- `eaten_yet.mp4` - กินข้าวแล้วยัง?
- `ate_already.mp4` - กินแล้ว / ไม่ได้กิน
- `how_are_you.mp4` - สบายดีไหม?
- `fine.mp4` - สบายดี

### 2. Illness (อาการเจ็บป่วย)
- `cold.mp4` - เป็นหวัด
- `sore_throat.mp4` - เจ็บคอ
- `stomachache.mp4` - ปวดท้อง
- `headache.mp4` - ปวดหัว
- `fever.mp4` - เป็นไข้

### 3. Questions (คำถาม-คำตอบ)
- `what.mp4` - อะไร
- `why.mp4` - ทำไม
- `how_much.mp4` - เท่าไหร่
- `yes.mp4` - ใช่
- `no.mp4` - ไม่

### 4. Emotions (อารมณ์)
- `angry.mp4` - โกรธ
- `fear.mp4` - กลัว
- `love.mp4` - รัก
- `unhappy.mp4` - เศร้า / ไม่พอใจ
- `tired.mp4` - เหนื่อย

## วิธีการใช้งาน

ใน constants.ts สามารถเพิ่ม `tutorialVideoUrl` ให้กับแต่ละ level:

```typescript
{
  id: 'lvl_hello',
  words: ['สวัสดี'],
  thaiWords: ['สวัสดี (ผู้ใหญ่ | เพื่อน)'],
  description: 'Greeting for adults and friends.',
  difficulty: 'Easy',
  videoPlaceholderColor: 'bg-blue-500',
  modelLabel: 'hello_adult',
  tutorialVideoUrl: '/videos/tutorials/greetings/hello_adult.mp4' // เพิ่มบรรทัดนี้
}
```

## หมายเหตุ

- ไฟล์วิดีโอควรมีขนาดไม่เกิน 10MB เพื่อประสิทธิภาพในการโหลด
- รองรับรูปแบบ: `.mp4`, `.webm`
- ความละเอียดแนะนำ: 720p (1280x720) หรือ 1080p (1920x1080)
- Frame rate แนะนำ: 30fps หรือ 60fps
