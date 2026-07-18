import 'dotenv/config';
import { PrismaClient } from '../src/prisma/client';
import { createPgAdapter } from '../src/prisma/pg-connection';

// Seeds starter content (BACKEND_PLAN.md Phase 5). Idempotent — each collection
// is only seeded when empty; singletons are created if missing. Run: `pnpm db:seed:content`.
//
// NOTE on images: the native app's mock data used bundled local assets
// (require(...)), which have no URL. Until real images are hosted (Phase 6),
// these use picsum placeholders. The client will replace them via the dashboard.
const prisma = new PrismaClient({ adapter: createPgAdapter() });

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

// Test Vimeo video used for every seeded video & live (WIRING_PLAN B4) until
// the client sets real links in the dashboard.
const TEST_VIMEO = 'https://vimeo.com/17433286?h=6bcdf4c934';

const RECIPES = [
  {
    id: 'couscous-royal',
    title: 'Couscous royal de Ghania',
    image: img('couscous-royal'),
    time: '1h30',
    difficulty: 'Moyen',
    category: 'Couscous',
    portions: 6,
    description:
      "Le couscous signature de la maison : semoule parfumée, bouillon de légumes mijoté et viande fondante au TM7.",
    cookidooUrl: 'https://cookidoo.fr/recipes/recipe/fr-FR/r-couscous',
    isNew: true,
    ingredients: [
      { label: 'Semoule moyenne', qty: '500 g' },
      { label: 'Agneau', qty: '800 g' },
      { label: 'Pois chiches trempés', qty: '200 g' },
      { label: 'Courgettes', qty: '3' },
      { label: 'Carottes', qty: '4' },
      { label: 'Navet', qty: '1' },
      { label: 'Ras el hanout', qty: '2 c.à.s' },
    ],
    steps: [
      "Faites revenir l'agneau au TM7 avec oignon et épices, 8 min / 120°C / sens inverse / vitesse 1.",
      'Ajoutez la tomate, les légumes durs et 1L d\'eau. 35 min / Varoma / sens inverse / vitesse mijotage.',
      'Placez la semoule humidifiée dans le Varoma, posez-le et lancez 20 min / Varoma.',
      'Aérez la semoule au beurre, dressez avec viande, légumes et un peu de bouillon.',
    ],
  },
  {
    id: 'tajine-poulet',
    title: 'Tajine de poulet aux olives & citron confit',
    image: img('tajine-poulet'),
    time: '55 min',
    difficulty: 'Facile',
    category: 'Tajines',
    portions: 4,
    description:
      'Un grand classique revisité au Thermomix TM7 : poulet fondant, olives violettes et citron confit maison.',
    cookidooUrl: 'https://cookidoo.fr/recipes/recipe/fr-FR/r-tajine-poulet',
    isNew: false,
    ingredients: [
      { label: 'Cuisses de poulet', qty: '6' },
      { label: 'Olives violettes', qty: '150 g' },
      { label: 'Citron confit', qty: '1' },
      { label: 'Oignons', qty: '2' },
      { label: 'Gingembre', qty: '1 c.à.c' },
      { label: 'Safran', qty: '1 pincée' },
    ],
    steps: [
      'Hachez les oignons 5 sec / vitesse 5. Faites revenir avec l\'huile et les épices.',
      'Ajoutez le poulet, mijotage 35 min / 100°C / sens inverse.',
      'Incorporez olives et citron confit en fin de cuisson, 5 min.',
      'Servez avec un pain maison ou de la semoule.',
    ],
  },
];

const VIDEOS = [
  {
    // Matches FIRST_STEPS_VIDEO_ID in the native app (constants/content.ts) so
    // the "Mes premiers pas" screen can resolve this video's metadata.
    id: 'premiers-pas-tm7',
    title: 'Mise en service du TM7 — mes premiers pas',
    image: img('video-mise-en-service'),
    duration: '18:42',
    category: 'Prise en main',
    description:
      'La vidéo de mise en service complète, comme une visio personnalisée : présentation, étapes indispensables et premiers conseils.',
    vimeoUrl: TEST_VIMEO,
  },
  {
    id: 'nettoyage-entretien',
    title: 'Nettoyage & entretien au quotidien',
    image: img('video-entretien'),
    duration: '07:15',
    category: 'Entretien',
    description: 'Les bons gestes pour garder votre Thermomix impeccable.',
    vimeoUrl: TEST_VIMEO,
  },
];

const ARTICLES = [
  {
    id: 'bien-demarrer',
    title: 'Bien démarrer avec le Thermomix TM7',
    excerpt: 'Nos conseils pour prendre en main votre appareil sereinement.',
    image: img('article-demarrer'),
    readTime: '4 min',
    category: 'Conseils',
  },
  {
    id: 'epices-algeriennes',
    title: 'Les épices algériennes essentielles',
    excerpt: 'Ras el hanout, cannelle, safran… le b.a.-ba de votre placard.',
    image: img('article-epices'),
    readTime: '6 min',
    category: 'Culture',
  },
];

const LIVES = [
  {
    id: 'live-couscous-royal',
    title: 'Couscous royal en direct',
    date: '2026-08-01',
    time: '19:30',
    image: img('live-couscous'),
    status: 'À venir',
    description: 'Le couscous signature, pas à pas, avec vos questions en direct.',
    platform: 'Instagram Live',
    vimeoUrl: TEST_VIMEO,
  },
  {
    id: 'live-ftour-express',
    title: "F'tour express au TM7",
    date: '2026-07-20',
    time: '20:00',
    image: img('live-ftour'),
    status: 'Replay',
    description: "Menu du f'tour en 45 min chrono.",
    platform: 'YouTube',
    vimeoUrl: TEST_VIMEO,
  },
];

const FAQ = [
  { q: 'Comment accéder à la vidéo « Mes premiers pas » ?', a: "Elle est directement intégrée dans l'application, dans l'onglet Accueil > Mes premiers pas. Plus besoin de lien Vimeo ni de mot de passe." },
  { q: 'Puis-je reprendre une vidéo là où je m\'étais arrêtée ?', a: "Oui. L'application mémorise automatiquement la minute exacte de votre dernier visionnage. Retrouvez-la dans Profil > Historique." },
  { q: 'Comment prendre des notes pendant un visionnage ?', a: 'Utilisez le bouton flottant en bas à droite. Vos notes sont enregistrées avec une référence vers le contenu consulté.' },
  { q: 'Où retrouver mes notes ?', a: 'Profil > Mes notes — toutes vos notes sont rangées avec un lien direct vers la vidéo ou la recette concernée.' },
  { q: 'Comment voir le calendrier des lives ?', a: "Le mini-calendrier de la semaine est visible sur la page d'accueil. Cliquez dessus pour ouvrir la vue mensuelle complète." },
  { q: 'Comment modifier mes informations personnelles ?', a: 'Profil > Paramètres : vous pouvez y changer votre nom, votre email, votre téléphone et vos préférences.' },
  { q: 'Mes données sont-elles partagées ?', a: 'Non. Vos notes, votre historique et vos favoris restent privés sur votre appareil.' },
  { q: 'Comment contacter Ghania ?', a: 'Via Profil > Support, ou directement par email à contact@perledelys.fr.' },
];

const WELCOME = {
  subject: "Bienvenue dans l'aventure Thermomix TM7",
  body: `Coucou,

Félicitations pour la réception de ton Thermomix TM7.

Pour t'accompagner dans tes premiers pas, j'ai fait spécialement pour toi une vidéo de mise en service, comme si nous étions ensemble, afin que tu puisses la regarder selon tes disponibilités.

Il est très important que tu regardes la vidéo entièrement, car tu y trouveras :
• la présentation complète du TM7 ;
• toutes les étapes indispensables pour bien le prendre en main ;
• mes conseils pour cuisiner sereinement dès les premiers jours.

Cette vidéo est strictement réservée à mes clientes. Merci de ne pas la partager.

Avec tout mon cœur,
Ghania`,
};

const FOUNDER = {
  name: 'Ghania',
  fullName: 'Ghania, votre conseillère Thermomix',
  bio: 'Conseillère Thermomix classée parmi les meilleures de France, spécialisée dans les recettes algériennes adaptées au TM7.',
  avatar: img('founder-ghania'),
};

function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function seedCollection(
  name: string,
  count: () => Promise<number>,
  create: () => Promise<unknown>,
) {
  if ((await count()) === 0) {
    await create();
    console.log(`Seeded ${name}.`);
  } else {
    console.log(`${name} already has data — skipped.`);
  }
}

// `pnpm db:seed:content --reset` wipes ALL content first, then reseeds. Use it
// to pick up changes to this file's data (the seed is otherwise idempotent and
// skips non-empty collections). WARNING: this deletes content added via the
// dashboard too — it's meant for dev/demo data, not production content.
async function resetContent() {
  await prisma.recipe.deleteMany();
  await prisma.video.deleteMany();
  await prisma.article.deleteMany();
  await prisma.live.deleteMany();
  await prisma.event.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.welcomeMessage.deleteMany();
  await prisma.founderInfo.deleteMany();
  console.log('Reset: all content deleted.');
}

async function main() {
  if (process.argv.includes('--reset')) {
    await resetContent();
  }

  await seedCollection(
    'recipes',
    () => prisma.recipe.count(),
    () => prisma.recipe.createMany({ data: RECIPES }),
  );
  await seedCollection(
    'videos',
    () => prisma.video.count(),
    () => prisma.video.createMany({ data: VIDEOS }),
  );
  await seedCollection(
    'articles',
    () => prisma.article.count(),
    () => prisma.article.createMany({ data: ARTICLES }),
  );
  await seedCollection(
    'lives',
    () => prisma.live.count(),
    () => prisma.live.createMany({ data: LIVES }),
  );
  await seedCollection(
    'events',
    () => prisma.event.count(),
    () =>
      prisma.event.createMany({
        data: [
          { id: 'ev1', title: "Live : F'tour express", date: isoDay(0), time: '20:00', type: 'live', description: "Menu du f'tour en 45 min chrono au TM7." },
          { id: 'ev2', title: 'Nouvelle recette : Mhalbi rose', date: isoDay(1), time: '10:00', type: 'publication', description: "Publication d'une nouvelle recette signature." },
          { id: 'ev3', title: 'Atelier pâtisseries orientales', date: isoDay(2), time: '14:30', type: 'atelier', description: 'Cornes de gazelle et makrout en direct.' },
          { id: 'ev4', title: 'Q&R Thermomix TM7', date: isoDay(3), time: '21:00', type: 'live', description: 'Vos questions, mes réponses en live.' },
          { id: 'ev5', title: 'Rappel : préparer la chorba', date: isoDay(4), time: '17:00', type: 'rappel' },
        ],
      }),
  );
  await seedCollection(
    'faq_items',
    () => prisma.faqItem.count(),
    () =>
      prisma.faqItem.createMany({
        data: FAQ.map((f, i) => ({ ...f, order: i })),
      }),
  );

  if (!(await prisma.welcomeMessage.findFirst())) {
    await prisma.welcomeMessage.create({ data: WELCOME });
    console.log('Seeded welcome_message.');
  } else {
    console.log('welcome_message already exists — skipped.');
  }

  if (!(await prisma.founderInfo.findFirst())) {
    await prisma.founderInfo.create({ data: FOUNDER });
    console.log('Seeded founder_info.');
  } else {
    console.log('founder_info already exists — skipped.');
  }

  console.log('Content seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
