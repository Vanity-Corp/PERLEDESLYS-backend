import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ContentService } from './content.service';
import {
  articleSchema,
  articleUpdateSchema,
  eventSchema,
  eventUpdateSchema,
  faqSchema,
  faqUpdateSchema,
  founderSchema,
  liveSchema,
  liveUpdateSchema,
  recipeSchema,
  recipeUpdateSchema,
  videoSchema,
  videoUpdateSchema,
  welcomeMessageSchema,
  type ArticleDto,
  type EventDto,
  type FaqDto,
  type FounderDto,
  type LiveDto,
  type RecipeDto,
  type VideoDto,
  type WelcomeMessageDto,
} from './content.dto';

// Admin-only content management. Backs the dashboard Content page
// (BACKEND_PLAN.md Phase 5).
@Controller('admin/content')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  // ---- Recipes ----
  @Post('recipes')
  createRecipe(@Body(new ZodValidationPipe(recipeSchema)) dto: RecipeDto) {
    return this.content.createRecipe(dto);
  }
  @Patch('recipes/:id')
  updateRecipe(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(recipeUpdateSchema)) dto: Partial<RecipeDto>,
  ) {
    return this.content.updateRecipe(id, dto);
  }
  @Delete('recipes/:id')
  @HttpCode(204)
  deleteRecipe(@Param('id') id: string) {
    return this.content.deleteRecipe(id);
  }

  // ---- Videos ----
  @Post('videos')
  createVideo(@Body(new ZodValidationPipe(videoSchema)) dto: VideoDto) {
    return this.content.createVideo(dto);
  }
  @Patch('videos/:id')
  updateVideo(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(videoUpdateSchema)) dto: Partial<VideoDto>,
  ) {
    return this.content.updateVideo(id, dto);
  }
  @Delete('videos/:id')
  @HttpCode(204)
  deleteVideo(@Param('id') id: string) {
    return this.content.deleteVideo(id);
  }

  // ---- Articles ----
  @Post('articles')
  createArticle(@Body(new ZodValidationPipe(articleSchema)) dto: ArticleDto) {
    return this.content.createArticle(dto);
  }
  @Patch('articles/:id')
  updateArticle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(articleUpdateSchema)) dto: Partial<ArticleDto>,
  ) {
    return this.content.updateArticle(id, dto);
  }
  @Delete('articles/:id')
  @HttpCode(204)
  deleteArticle(@Param('id') id: string) {
    return this.content.deleteArticle(id);
  }

  // ---- Lives ----
  @Post('lives')
  createLive(@Body(new ZodValidationPipe(liveSchema)) dto: LiveDto) {
    return this.content.createLive(dto);
  }
  @Patch('lives/:id')
  updateLive(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(liveUpdateSchema)) dto: Partial<LiveDto>,
  ) {
    return this.content.updateLive(id, dto);
  }
  @Delete('lives/:id')
  @HttpCode(204)
  deleteLive(@Param('id') id: string) {
    return this.content.deleteLive(id);
  }

  // ---- Events ----
  @Post('events')
  createEvent(@Body(new ZodValidationPipe(eventSchema)) dto: EventDto) {
    return this.content.createEvent(dto);
  }
  @Patch('events/:id')
  updateEvent(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(eventUpdateSchema)) dto: Partial<EventDto>,
  ) {
    return this.content.updateEvent(id, dto);
  }
  @Delete('events/:id')
  @HttpCode(204)
  deleteEvent(@Param('id') id: string) {
    return this.content.deleteEvent(id);
  }

  // ---- FAQ ----
  @Post('faq')
  createFaq(@Body(new ZodValidationPipe(faqSchema)) dto: FaqDto) {
    return this.content.createFaq(dto);
  }
  @Patch('faq/:id')
  updateFaq(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(faqUpdateSchema)) dto: Partial<FaqDto>,
  ) {
    return this.content.updateFaq(id, dto);
  }
  @Delete('faq/:id')
  @HttpCode(204)
  deleteFaq(@Param('id') id: string) {
    return this.content.deleteFaq(id);
  }

  // ---- Singletons ----
  @Put('welcome-message')
  setWelcomeMessage(
    @Body(new ZodValidationPipe(welcomeMessageSchema)) dto: WelcomeMessageDto,
  ) {
    return this.content.setWelcomeMessage(dto);
  }
  @Put('founder')
  setFounder(@Body(new ZodValidationPipe(founderSchema)) dto: FounderDto) {
    return this.content.setFounder(dto);
  }
}
