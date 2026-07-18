import { Injectable, NotFoundException } from '@nestjs/common';
import { type Live } from '../prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ArticleDto,
  EventDto,
  FaqDto,
  FounderDto,
  LiveDto,
  RecipeDto,
  VideoDto,
  WelcomeMessageDto,
} from './content.dto';

// CRUD for all content collections + the two singletons. Field shapes mirror
// the native app's content types (BACKEND_PLAN.md Phase 5).
@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Recipes ----
  listRecipes() {
    return this.prisma.recipe.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async getRecipe(id: string) {
    const r = await this.prisma.recipe.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Recette introuvable.');
    return r;
  }
  createRecipe(dto: RecipeDto) {
    return this.prisma.recipe.create({ data: dto });
  }
  async updateRecipe(id: string, dto: Partial<RecipeDto>) {
    await this.getRecipe(id);
    return this.prisma.recipe.update({ where: { id }, data: dto });
  }
  async deleteRecipe(id: string) {
    await this.getRecipe(id);
    await this.prisma.recipe.delete({ where: { id } });
  }

  // ---- Videos ----
  listVideos() {
    return this.prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async getVideo(id: string) {
    const v = await this.prisma.video.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Vidéo introuvable.');
    return v;
  }
  createVideo(dto: VideoDto) {
    return this.prisma.video.create({ data: dto });
  }
  async updateVideo(id: string, dto: Partial<VideoDto>) {
    await this.getVideo(id);
    return this.prisma.video.update({ where: { id }, data: dto });
  }
  async deleteVideo(id: string) {
    await this.getVideo(id);
    await this.prisma.video.delete({ where: { id } });
  }

  // ---- Articles ----
  listArticles() {
    return this.prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  }
  createArticle(dto: ArticleDto) {
    return this.prisma.article.create({ data: dto });
  }
  async updateArticle(id: string, dto: Partial<ArticleDto>) {
    if (!(await this.prisma.article.findUnique({ where: { id } })))
      throw new NotFoundException('Article introuvable.');
    return this.prisma.article.update({ where: { id }, data: dto });
  }
  async deleteArticle(id: string) {
    if (!(await this.prisma.article.findUnique({ where: { id } })))
      throw new NotFoundException('Article introuvable.');
    await this.prisma.article.delete({ where: { id } });
  }

  // ---- Lives ----
  // Each live is mirrored to a linked calendar Event (type "live", `liveId`
  // set) so it shows on the calendar and can trigger a reminder + deep-link to
  // the player (WIRING_PLAN B2). The sync runs on every create/update; deleting
  // a live removes its linked event.
  private async syncLiveEvent(live: Live) {
    const data = {
      title: live.title,
      date: live.date,
      time: live.time,
      type: 'live',
      description: live.description,
      liveId: live.id,
    };
    const existing = await this.prisma.event.findFirst({
      where: { liveId: live.id },
    });
    if (existing) {
      await this.prisma.event.update({ where: { id: existing.id }, data });
    } else {
      await this.prisma.event.create({ data });
    }
  }

  listLives() {
    return this.prisma.live.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async createLive(dto: LiveDto) {
    const live = await this.prisma.live.create({ data: dto });
    await this.syncLiveEvent(live);
    return live;
  }
  async updateLive(id: string, dto: Partial<LiveDto>) {
    if (!(await this.prisma.live.findUnique({ where: { id } })))
      throw new NotFoundException('Live introuvable.');
    const live = await this.prisma.live.update({ where: { id }, data: dto });
    await this.syncLiveEvent(live);
    return live;
  }
  async deleteLive(id: string) {
    if (!(await this.prisma.live.findUnique({ where: { id } })))
      throw new NotFoundException('Live introuvable.');
    await this.prisma.event.deleteMany({ where: { liveId: id } });
    await this.prisma.live.delete({ where: { id } });
  }

  // ---- Events ----
  listEvents() {
    return this.prisma.event.findMany({ orderBy: { date: 'asc' } });
  }
  createEvent(dto: EventDto) {
    return this.prisma.event.create({ data: dto });
  }
  async updateEvent(id: string, dto: Partial<EventDto>) {
    if (!(await this.prisma.event.findUnique({ where: { id } })))
      throw new NotFoundException('Événement introuvable.');
    return this.prisma.event.update({ where: { id }, data: dto });
  }
  async deleteEvent(id: string) {
    if (!(await this.prisma.event.findUnique({ where: { id } })))
      throw new NotFoundException('Événement introuvable.');
    await this.prisma.event.delete({ where: { id } });
  }

  // ---- FAQ ----
  listFaq() {
    return this.prisma.faqItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }
  createFaq(dto: FaqDto) {
    return this.prisma.faqItem.create({ data: dto });
  }
  async updateFaq(id: string, dto: Partial<FaqDto>) {
    if (!(await this.prisma.faqItem.findUnique({ where: { id } })))
      throw new NotFoundException('Question introuvable.');
    return this.prisma.faqItem.update({ where: { id }, data: dto });
  }
  async deleteFaq(id: string) {
    if (!(await this.prisma.faqItem.findUnique({ where: { id } })))
      throw new NotFoundException('Question introuvable.');
    await this.prisma.faqItem.delete({ where: { id } });
  }

  // ---- Singletons ----
  async getWelcomeMessage() {
    return (
      (await this.prisma.welcomeMessage.findFirst()) ?? {
        id: '',
        subject: '',
        body: '',
        updatedAt: new Date(0),
      }
    );
  }
  async setWelcomeMessage(dto: WelcomeMessageDto) {
    const existing = await this.prisma.welcomeMessage.findFirst();
    return existing
      ? this.prisma.welcomeMessage.update({ where: { id: existing.id }, data: dto })
      : this.prisma.welcomeMessage.create({ data: dto });
  }

  async getFounder() {
    return (
      (await this.prisma.founderInfo.findFirst()) ?? {
        id: '',
        name: '',
        fullName: '',
        bio: '',
        avatar: '',
        updatedAt: new Date(0),
      }
    );
  }
  async setFounder(dto: FounderDto) {
    const existing = await this.prisma.founderInfo.findFirst();
    return existing
      ? this.prisma.founderInfo.update({ where: { id: existing.id }, data: dto })
      : this.prisma.founderInfo.create({ data: dto });
  }
}
