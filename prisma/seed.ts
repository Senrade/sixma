import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang nạp dữ liệu từ topics.json...');

  const jsonPath = path.join(__dirname, 'topics.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const topicsData = JSON.parse(rawData);

  await prisma.topic.deleteMany();

  for (const item of topicsData) {
    await prisma.topic.create({
      data: {
        setId: item.set_id,
        themeJson: JSON.stringify(item.theme),
        storyContext: item.story_context,
        mechanicType: item.mechanic_type,
        simulatedPost: JSON.stringify(item.simulated_post),
        trapsJson: JSON.stringify(item.traps),
        dialogueTrigger: JSON.stringify(item.dialogue_trigger),
      },
    });
  }

  console.log(`✅ Đã nạp thành công ${topicsData.length} màn chơi vào Database!`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });