import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { ContentService } from './content.service';

// Public content reads for the native app. ACTIVE-guarded: only activated
// members can read content (BACKEND_PLAN.md Phase 5).
@Controller('content')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('recipes')
  recipes() {
    return this.content.listRecipes();
  }
  @Get('recipes/:id')
  recipe(@Param('id') id: string) {
    return this.content.getRecipe(id);
  }

  @Get('videos')
  videos() {
    return this.content.listVideos();
  }
  @Get('videos/:id')
  video(@Param('id') id: string) {
    return this.content.getVideo(id);
  }

  @Get('articles')
  articles() {
    return this.content.listArticles();
  }

  @Get('lives')
  lives() {
    return this.content.listLives();
  }

  @Get('events')
  events() {
    return this.content.listEvents();
  }

  @Get('faq')
  faq() {
    return this.content.listFaq();
  }

  @Get('welcome-message')
  welcomeMessage() {
    return this.content.getWelcomeMessage();
  }

  @Get('founder')
  founder() {
    return this.content.getFounder();
  }
}
