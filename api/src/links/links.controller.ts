import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Redirect,
} from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinksService } from './links.service';

@Controller()
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post('links')
  create(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(createLinkDto);
  }

  @Get('links')
  findAll() {
    return this.linksService.findAll();
  }

  @Delete('links/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.linksService.remove(id);
  }

  @Get(':slug')
  @Redirect()
  async redirectToOriginal(@Param('slug') slug: string) {
    const link = await this.linksService.findBySlug(slug);

    return { url: link.originalUrl };
  }
}
