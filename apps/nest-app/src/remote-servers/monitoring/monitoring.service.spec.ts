import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service.js';
import {generateText} from 'ai';
import {createOpenAI, openai} from '@ai-sdk/openai'

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitoringService],
    })
    .useMocker(() => mock())
    .compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('learn-ai-sdk', async() => {

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'What is the capital of France?'
    })

    console.log(result.text);
  }, 100000)
});
