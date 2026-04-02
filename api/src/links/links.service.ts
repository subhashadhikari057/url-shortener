import {
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { customAlphabet } from 'nanoid';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { Link } from './links.entity';

const generateSlug = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  7,
);

@Injectable()
export class LinksService {
  private readonly logger = new Logger(LinksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
  ) {}

  async create(createLinkDto: CreateLinkDto) {
    const slug = createLinkDto.slug ?? (await this.generateUniqueSlug());
    await this.ensureSlugIsAvailable(slug);

    const link = this.linksRepository.create({
      slug,
      originalUrl: createLinkDto.url,
      userId: null,
      expiresAt: createLinkDto.expiresAt
        ? new Date(createLinkDto.expiresAt)
        : null,
    });

    const savedLink = await this.linksRepository.save(link);
    await this.cacheRedirectTarget(savedLink);

    return this.toLinkResponse(savedLink);
  }

  async findAll() {
    const links = await this.linksRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return links.map((link) => this.toLinkResponse(link));
  }

  async remove(id: string) {
    const link = await this.linksRepository.findOne({
      where: { id },
    });

    if (!link) {
      throw new NotFoundException(`Link with id "${id}" was not found.`);
    }

    const result = await this.linksRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Link with id "${id}" was not found.`);
    }

    await this.redisService.del(this.getRedirectCacheKey(link.slug));

    return { success: true };
  }

  async findBySlug(slug: string) {
    const cachedOriginalUrl = await this.redisService.get(
      this.getRedirectCacheKey(slug),
    );

    if (cachedOriginalUrl) {
      this.logger.log(`Redirect cache hit for slug "${slug}"`);

      return {
        slug,
        originalUrl: cachedOriginalUrl,
      };
    }

    this.logger.log(`Redirect cache miss for slug "${slug}"`);

    const link = await this.linksRepository.findOne({
      where: { slug },
    });

    if (!link) {
      throw new NotFoundException(`Link with slug "${slug}" was not found.`);
    }

    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      throw new GoneException(`Link with slug "${slug}" has expired.`);
    }

    await this.cacheRedirectTarget(link);

    return {
      slug: link.slug,
      originalUrl: link.originalUrl,
    };
  }

  private async ensureSlugIsAvailable(slug: string) {
    const existingLink = await this.linksRepository.findOne({
      where: { slug },
    });

    if (existingLink) {
      throw new ConflictException(`Slug "${slug}" is already in use.`);
    }
  }

  private async generateUniqueSlug() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = generateSlug();
      const existingLink = await this.linksRepository.findOne({
        where: { slug },
      });

      if (!existingLink) {
        return slug;
      }
    }

    throw new ConflictException(
      'Could not generate a unique slug. Please try again.',
    );
  }

  private toLinkResponse(link: Link) {
    return {
      id: link.id,
      slug: link.slug,
      shortUrl: this.buildShortUrl(link.slug),
      originalUrl: link.originalUrl,
      userId: link.userId,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
    };
  }

  private buildShortUrl(slug: string) {
    const configuredBaseUrl = this.configService.get<string>('BASE_URL');

    if (configuredBaseUrl) {
      return `${configuredBaseUrl.replace(/\/$/, '')}/${slug}`;
    }

    const port = this.configService.get<string>('PORT', '3000');

    return `http://localhost:${port}/${slug}`;
  }

  private getRedirectCacheKey(slug: string) {
    return `redirect:${slug}`;
  }

  private async cacheRedirectTarget(link: Link) {
    const expiresInSeconds = this.getCacheTtlInSeconds(link.expiresAt);

    await this.redisService.set(
      this.getRedirectCacheKey(link.slug),
      link.originalUrl,
      expiresInSeconds,
    );
  }

  private getCacheTtlInSeconds(expiresAt: Date | null) {
    if (expiresAt) {
      const secondsUntilExpiry = Math.floor(
        (expiresAt.getTime() - Date.now()) / 1000,
      );

      return secondsUntilExpiry > 0 ? secondsUntilExpiry : undefined;
    }

    return Number(
      this.configService.get<string>('REDIRECT_CACHE_TTL_SECONDS', '86400'),
    );
  }
}
