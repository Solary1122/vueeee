import { defineEventHandler } from 'h3';
import { getBaseTemplate } from '../utils/transformer';

export default defineEventHandler(async () => {
  return await getBaseTemplate();
});
