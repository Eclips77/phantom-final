import { BadRequestException } from '@nestjs/common';
import { VideoQueryResolver } from '../query/video-query.resolver';

describe('VideoQueryResolver', () => {
  let resolver: VideoQueryResolver;

  beforeEach(() => {
    resolver = new VideoQueryResolver();
  });

  describe('resolve', () => {
    it('returns an empty filter when dto is empty', () => {
      expect(resolver.resolve({})).toEqual({});
    });

    describe('text search (title)', () => {
      it('adds $text.$search when title is provided', () => {
        const filter = resolver.resolve({ title: 'Matrix' });
        expect(filter.$text).toEqual({ $search: 'Matrix' });
      });

      it('trims the title before adding it', () => {
        const filter = resolver.resolve({ title: '  Matrix  ' });
        expect(filter.$text).toEqual({ $search: 'Matrix' });
      });

      it.each([
        { label: 'undefined title', dto: { title: undefined } },
        { label: 'empty title', dto: { title: '' } },
        { label: 'whitespace title', dto: { title: '   ' } },
      ])('does not add $text when $label', ({ dto }) => {
        expect(resolver.resolve(dto)).not.toHaveProperty('$text');
      });
    });

    describe('language', () => {
      it('lowercases the language value', () => {
        const filter = resolver.resolve({ language: 'English' });
        expect(filter.language).toBe('english');
      });

      it('trims the language value', () => {
        const filter = resolver.resolve({ language: '  English  ' });
        expect(filter.language).toBe('english');
      });

      it.each([
        { label: 'undefined language', dto: { language: undefined } },
        { label: 'empty language', dto: { language: '' } },
        { label: 'whitespace language', dto: { language: '  ' } },
      ])('does not add language when $label', ({ dto }) => {
        expect(resolver.resolve(dto)).not.toHaveProperty('language');
      });
    });

    describe('genre', () => {
      it('adds trimmed genre to filter', () => {
        const filter = resolver.resolve({ genre: ' Action ' });
        expect(filter.genre).toBe('Action');
      });

      it.each([
        { label: 'undefined genre', dto: { genre: undefined } },
        { label: 'empty genre', dto: { genre: '' } },
      ])('does not add genre when $label', ({ dto }) => {
        expect(resolver.resolve(dto)).not.toHaveProperty('genre');
      });
    });

    describe('duration range', () => {
      it('adds $gte when only minDuration is provided', () => {
        const filter = resolver.resolve({ minDuration: 60 });
        expect(filter.duration).toEqual({ $gte: 60 });
      });

      it('adds $lte when only maxDuration is provided', () => {
        const filter = resolver.resolve({ maxDuration: 300 });
        expect(filter.duration).toEqual({ $lte: 300 });
      });

      it('adds both $gte and $lte when both values are valid', () => {
        const filter = resolver.resolve({ minDuration: 60, maxDuration: 300 });
        expect(filter.duration).toEqual({ $gte: 60, $lte: 300 });
      });

      it('accepts zero as a valid minDuration', () => {
        const filter = resolver.resolve({ minDuration: 0 });
        expect(filter.duration).toEqual({ $gte: 0 });
      });

      it.each([
        { label: 'negative minDuration', dto: { minDuration: -1 }, field: 'minDuration' },
        { label: 'NaN minDuration', dto: { minDuration: NaN }, field: 'minDuration' },
        { label: 'negative maxDuration', dto: { maxDuration: -1 }, field: 'maxDuration' },
        { label: 'NaN maxDuration', dto: { maxDuration: NaN }, field: 'maxDuration' },
      ])('throws BadRequestException for $label', ({ dto }) => {
        expect(() => resolver.resolve(dto)).toThrow(BadRequestException);
      });

      it('throws BadRequestException when minDuration > maxDuration', () => {
        expect(() => resolver.resolve({ minDuration: 300, maxDuration: 60 })).toThrow(BadRequestException);
      });

      it('does not add duration when neither min nor max are provided', () => {
        expect(resolver.resolve({})).not.toHaveProperty('duration');
      });
    });

    describe('upload date range', () => {
      it('adds $gte when only uploadedFrom is provided', () => {
        const filter = resolver.resolve({ uploadedFrom: '2024-01-01' });
        expect((filter.createdAt as any).$gte).toEqual(new Date('2024-01-01'));
      });

      it('adds $lte when only uploadedTo is provided', () => {
        const filter = resolver.resolve({ uploadedTo: '2024-12-31' });
        expect((filter.createdAt as any).$lte).toEqual(new Date('2024-12-31'));
      });

      it('adds both $gte and $lte when both dates are valid', () => {
        const filter = resolver.resolve({ uploadedFrom: '2024-01-01', uploadedTo: '2024-12-31' });
        expect((filter.createdAt as any).$gte).toEqual(new Date('2024-01-01'));
        expect((filter.createdAt as any).$lte).toEqual(new Date('2024-12-31'));
      });

      it.each([
        { label: 'invalid uploadedFrom', dto: { uploadedFrom: 'not-a-date' } },
        { label: 'invalid uploadedTo', dto: { uploadedTo: 'not-a-date' } },
      ])('throws BadRequestException for $label', ({ dto }) => {
        expect(() => resolver.resolve(dto)).toThrow(BadRequestException);
      });

      it('throws BadRequestException when uploadedFrom is after uploadedTo', () => {
        expect(() =>
          resolver.resolve({ uploadedFrom: '2024-12-31', uploadedTo: '2024-01-01' }),
        ).toThrow(BadRequestException);
      });

      it('does not add createdAt when no date fields are provided', () => {
        expect(resolver.resolve({})).not.toHaveProperty('createdAt');
      });
    });

    describe('combined filters', () => {
      it('builds a filter with all fields populated', () => {
        const filter = resolver.resolve({
          title: 'Matrix',
          language: 'English',
          genre: 'Action',
          minDuration: 60,
          maxDuration: 300,
          uploadedFrom: '2024-01-01',
          uploadedTo: '2024-12-31',
        });

        expect(filter.$text).toEqual({ $search: 'Matrix' });
        expect(filter.language).toBe('english');
        expect(filter.genre).toBe('Action');
        expect(filter.duration).toEqual({ $gte: 60, $lte: 300 });
        expect((filter.createdAt as any).$gte).toEqual(new Date('2024-01-01'));
        expect((filter.createdAt as any).$lte).toEqual(new Date('2024-12-31'));
      });
    });
  });
});
