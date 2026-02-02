const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding notifications...');

  await prisma.notification.createMany({
    data: [
      {
        title: 'Bảo trì hệ thống nước',
        content:
          'Hệ thống nước sẽ được bảo trì từ 8h-12h ngày 05/02/2026. Mong quý cư dân thông cảm.',
        type: 'SYSTEM',
        isRead: false,
      },
      {
        title: 'Thông báo về việc đóng cổng muộn',
        content:
          'Cổng chính sẽ đóng vào lúc 23h hàng ngày. Vui lòng về trước giờ quy định.',
        type: 'GENERAL',
        isRead: false,
      },
      {
        title: 'Chúc mừng năm mới',
        content:
          'Ban quản lý chúc quý cư dân một năm mới An Khang - Thịnh Vượng!',
        type: 'GENERAL',
        isRead: false,
      },
    ],
  });

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
