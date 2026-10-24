import { mock } from 'vitest-mock-extended';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

globalThis.mock = mock;