
import axios from 'axios';
import createHttpError from 'http-errors';

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:8000';
export class CatalogClient {
  private client = axios.create({
    baseURL: CATALOG_URL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

 async checkProfileExists(role: 'teacher' | 'student', email: string): Promise<boolean> {
    try {
      const endpoint = role === 'teacher' ? '/teachers/check-exists' : '/students/check-exists';
      const response = await this.client.get<boolean>(
        `/api/v1${endpoint}/${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return false;
        }
        console.error(`${role} service error:`, error.message);
        throw new createHttpError.ServiceUnavailable(
          `${role} profile verification service unavailable`
        );
      }
      throw error;
    }
  }
}
  
