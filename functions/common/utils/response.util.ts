export function notFound(message: string, details?: Record<string, any>): {
    statusCode: 404;
    message: string;
    details: Record<string, any> | undefined;
} {
    return {
        statusCode: 404,
        message,
        details,
    }
}