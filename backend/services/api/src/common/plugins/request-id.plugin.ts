import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

const REQUEST_ID_HEADER = 'x-request-id';

export const requestIdPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', async (request, reply) => {
    const incoming = request.headers[REQUEST_ID_HEADER];
    const requestId =
      typeof incoming === 'string' && incoming.trim().length > 0 ? incoming : randomUUID();
    request.requestId = requestId;
    void reply.header(REQUEST_ID_HEADER, requestId);
  });
};

declare module 'fastify' {
  interface FastifyRequest {
    requestId?: string;
  }
}