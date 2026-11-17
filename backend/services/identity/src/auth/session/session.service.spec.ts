import { SessionService } from './session.service';

describe('SessionService', () => {
  it('maps telegram profile to public contract', () => {
    const profile = SessionService.toPublicProfile({
      id: '11111111-1111-1111-1111-111111111111',
      status: 'ACTIVE',
      telegram: {
        telegramUserId: 99n,
        username: 'user99',
        firstName: 'Ada',
        lastName: null,
        languageCode: 'fa',
      },
    });
    expect(profile.subjectId).toBe('11111111-1111-1111-1111-111111111111');
    expect(profile.telegramUserId).toBe('99');
    expect(profile.username).toBe('user99');
  });
});