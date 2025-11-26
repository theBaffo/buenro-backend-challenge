import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain';

@Injectable()
export class DownloaderService {
  private readonly logger = new Logger(DownloaderService.name);

  /**
   * Fetch data from an URL and parse it using streams
   */
  async fetchData(url: string): Promise<unknown[]> {
    try {
      this.logger.log(`Fetching data from ${url}`);

      // Fetch JSON as a stream for memory-efficient processing
      const response: AxiosResponse<Readable> = await axios.get(url, {
        responseType: 'stream',
        timeout: 300000, // 5 minutes timeout for larger files
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Parse JSON array using streaming parser
      const items: unknown[] = [];
      let itemCount = 0;

      return new Promise<unknown[]>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const pipeline = chain([response.data, parser(), streamArray()]);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        pipeline.on('data', (data: { value: unknown }) => {
          items.push(data.value);
          itemCount++;
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        pipeline.on('end', () => {
          this.logger.log(
            `Successfully fetched ${itemCount} items from ${url}`,
          );
          resolve(items);
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        pipeline.on('error', (error: unknown) => {
          const err =
            error instanceof Error
              ? error
              : new Error(
                  `Error parsing stream from URL: ${JSON.stringify(error)}`,
                );

          this.logger.error(
            `Error parsing stream from URL: ${err.message}`,
            err.stack,
          );

          reject(err);
        });

        response.data.on('error', (error: unknown) => {
          const err =
            error instanceof Error
              ? error
              : new Error(
                  `Error downloading from URL: ${JSON.stringify(error)}`,
                );

          this.logger.error(
            `Error downloading from URL: ${err.message}`,
            err.stack,
          );

          reject(err);
        });
      });
    } catch (error) {
      this.logger.error(
        `Error fetching from URL: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}
