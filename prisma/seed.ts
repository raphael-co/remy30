// prisma/seed.ts
import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.trim()) {
  throw new Error("DATABASE_URL is missing or empty for seed process.");
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IMAGE_URLS: string[] = [
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175712-0e2ff57856a037197a9a802b.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175706-2c1b885d2fd22fc85db61077.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175688-cbdb11a094525ae0ed302220.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175721-f2292ca0de5714da3f27d384.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175736-b74c110405eae1b82f03c7d0.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175912-407bc46efe75a0f7f9efb159.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175921-6b565dd67a0ae233fb151bc6.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175926-786fe6c4af1f2f4eb9345949.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685175976-278df40de2d40f6509d21944.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176015-fe66f8d685f1f162f80d440e.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176096-6bfed5ee95cea0c84dce260d.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176115-69324e63b6155d3f4e9f9a8f.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176125-ed86438c093151129299011f.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176197-2f8e0cf45812eb4ff4e3a84a.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176241-38b70b916ddd3e40ebec8db7.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176310-7b9362173fd7650065dcdc93.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176375-9615b5cc560125054cffc7f0.jpg",
  "https://pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev/gallery/1766685176525-319f1a630f0f33a966b26c60.jpg",
];

const REVIEW_MESSAGES = [
  "Incroyable, on a passé une super soirée 🎉",
  "Site propre et rapide, bravo.",
  "Franchement top, rien à dire.",
  "Ambiance parfaite, merci !",
  "Très bien organisé, ça fait plaisir.",
  "La galerie est trop cool 😄",
  "Tout est clair et fluide.",
  "C’était génial, hâte de la prochaine !",
  "Super expérience, je recommande.",
  "Simple, joli, efficace.",
  "On sent le soin dans les détails.",
  "Trop bien, j’ai adoré.",
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickOne<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function pbkdf2Hash(password: string) {
  const iterations = 120000;
  const salt = crypto.randomBytes(16).toString("base64");
  const dk = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const hash = dk.toString("base64");
  return `pbkdf2$sha256$${iterations}$${salt}$${hash}`;
}

async function main() {
  await prisma.review.deleteMany({});
  await prisma.user.deleteMany({ where: { name: { startsWith: "seed_user_" } } });

  await prisma.user.createMany({
    data: Array.from({ length: 30 }).map((_, i) => ({
      name: `seed_user_${String(i + 1).padStart(2, "0")}`,
      passwordHash: pbkdf2Hash("password123"),
      role: UserRole.USER,
    })),
    skipDuplicates: true,
  });

  const users = await prisma.user.findMany({
    where: { name: { startsWith: "seed_user_" } },
    orderBy: { createdAt: "asc" },
  });

  for (const u of users) {
    const rating = randInt(3, 5);
    const message = pickOne(REVIEW_MESSAGES);
    const imageUrl = Math.random() < 0.85 ? pickOne(IMAGE_URLS) : null;

    const daysAgo = randInt(0, 45);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    await prisma.review.create({
      data: {
        userId: u.id,
        nameSnapshot: u.name,
        rating,
        message,
        imageUrl,
        approved: true,
        createdAt,
      },
    });
  }

  console.log(`Seed OK: ${users.length} users + ${users.length} reviews`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
