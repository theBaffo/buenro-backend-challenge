import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class DownloaderService {
  private readonly logger = new Logger(DownloaderService.name);

  /**
   * Fetch data from public URL and parse it
   */
  async fetchData(url: string): Promise<unknown[]> {
    try {
      this.logger.log(`Fetching data from ${url}`);

      // Fetch JSON directly from public URL using axios
      const response: AxiosResponse<unknown> = await axios.get(url, {
        responseType: 'json',
        timeout: 300000, // 5 minutes timeout for large files
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error('Expected JSON array from URL');
      }

      this.logger.log(`Successfully fetched ${data.length} items from ${url}`);

      return data as unknown[];
    } catch (error) {
      this.logger.error(
        `Error fetching from URL: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
