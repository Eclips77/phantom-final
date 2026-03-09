import { Injectable, BadRequestException } from '@nestjs/common';
import type { SearchVideoDto } from '../dto/search-video.dto';

type VideoFilter = Record<string, any>;

@Injectable()
export class VideoQueryResolver {

  resolve(dto: SearchVideoDto): VideoFilter {
    const filter: VideoFilter = {};

    this.applyTextSearch(filter, dto);
    this.applyLanguage(filter, dto);
    this.applyGenre(filter, dto);
    this.applyDurationRange(filter, dto);
    this.applyUploadDateRange(filter, dto);

    return filter;
  }

  private applyTextSearch(
    filter: VideoFilter,
    dto: SearchVideoDto,
  ): void {
    if (!dto.title?.trim()) return;
    filter.$text = { $search: dto.title.trim() };
  }

  private applyLanguage(
    filter: VideoFilter,
    dto: SearchVideoDto,
  ): void {
    if (!dto.language?.trim()) return;
    filter.language = dto.language.trim().toLowerCase();
  }

  private applyGenre(
    filter: VideoFilter,
    dto: SearchVideoDto,
  ): void {
    if (!dto.genre?.trim()) return;
    filter.genre = dto.genre.trim();
  }

  private applyDurationRange(
    filter: VideoFilter,
    dto: SearchVideoDto,
  ): void {
    const hasMin = dto.minDuration !== undefined;
    const hasMax = dto.maxDuration !== undefined;

    if (!hasMin && !hasMax) return;

    const min = hasMin ? Number(dto.minDuration) : undefined;
    const max = hasMax ? Number(dto.maxDuration) : undefined;

    if (min !== undefined && (isNaN(min) || min < 0)) {
      throw new BadRequestException('minDuration must be a non-negative number');
    }

    if (max !== undefined && (isNaN(max) || max < 0)) {
      throw new BadRequestException('maxDuration must be a non-negative number');
    }

    if (min !== undefined && max !== undefined && min > max) {
      throw new BadRequestException('minDuration cannot be greater than maxDuration');
    }

    filter.duration = {
      ...(min !== undefined && { $gte: min }),
      ...(max !== undefined && { $lte: max }),
    };
  }

  private applyUploadDateRange(
    filter: VideoFilter,
    dto: SearchVideoDto,
  ): void {
    const hasFrom = Boolean(dto.uploadedFrom);
    const hasTo = Boolean(dto.uploadedTo);

    if (!hasFrom && !hasTo) return;

    let from: Date | undefined;
    let to: Date | undefined;

    if (hasFrom) {
      from = new Date(dto.uploadedFrom!);
      if (isNaN(from.getTime())) {
        throw new BadRequestException('uploadedFrom is not a valid ISO date');
      }
    }

    if (hasTo) {
      to = new Date(dto.uploadedTo!);
      if (isNaN(to.getTime())) {
        throw new BadRequestException('uploadedTo is not a valid ISO date');
      }
    }

    if (from && to && from > to) {
      throw new BadRequestException('uploadedFrom cannot be after uploadedTo');
    }

    filter.createdAt = {
      ...(from && { $gte: from }),
      ...(to && { $lte: to }),
    };
  }
}
