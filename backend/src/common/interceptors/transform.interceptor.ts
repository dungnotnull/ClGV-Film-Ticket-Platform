import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  data: T;
  meta?: any;
}

// Global Interceptor bọc dữ liệu trả về theo đúng định dạng chuẩn API-CONTRACT.md
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((res) => {
        // Nếu response đã chứa sẵn wrapper success
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
          return res;
        }

        return {
          success: true,
          data: res !== undefined ? res : null,
          meta: {
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
