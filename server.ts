import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// API Lấy dữ liệu chủ đề & câu hỏi từ Prisma Seed
app.get('/api/topics', async (req, res) => {
  const topics = await prisma.topic.findMany({
    include: { questions: true } // Hoặc tùy tên model trong schema.prisma của bạn
  });
  res.json(topics);
});

app.listen(5000, () => {
  console.log('🚀 Backend chạy tại http://localhost:5000');
});