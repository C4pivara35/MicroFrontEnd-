import { createRepository } from '@fitforge/shared/storage';
import { validSession } from '@fitforge/shared/domain';
export const key = 'fitforge.sessions.v1';
export const event = 'fitforge:sessions-updated';
export const repository = createRepository({ key, event, validate: validSession });
export const listSessions = repository.read;
