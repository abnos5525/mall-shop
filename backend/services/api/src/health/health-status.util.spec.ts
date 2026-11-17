import { aggregateHealthStatus } from './health-status.util';

describe('aggregateHealthStatus', () => {
  it('returns error when any check fails', () => {
    const status = aggregateHealthStatus([
      { name: 'db', status: 'ok' },
      { name: 'redis', status: 'error', message: 'down' },
    ]);
    expect(status).toBe('error');
  });

  it('returns ok when all checks pass', () => {
    const status = aggregateHealthStatus([{ name: 'db', status: 'ok' }]);
    expect(status).toBe('ok');
  });
});