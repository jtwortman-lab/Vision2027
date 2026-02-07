import { describe, it, expect } from '@jest/globals';
import { calculateMatchScores, getScoreColor, getScoreLabel } from '@/lib/matching-engine-v2';
import { mockAdvisor, mockClient, matchingTestCases } from '@/test/test-utils';

describe('Matching Algorithm', () => {
  describe('calculateMatchScores', () => {
    it('should return match scores for all advisors', () => {
      const advisors = [mockAdvisor(), mockAdvisor()];
      const client = mockClient({
        needs: [
          {
            subtopic_id: 'estate-planning',
            importance: 8,
            urgency: 7,
            horizon: 'now',
          },
        ],
      });

      const results = calculateMatchScores(advisors, client.needs);

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('leadScore');
      expect(results[0]).toHaveProperty('backupScore');
      expect(results[0]).toHaveProperty('supportScore');
      expect(results[0]).toHaveProperty('confidenceScore');
      expect(results[0]).toHaveProperty('explanation');
      expect(results[0]).toHaveProperty('skillMatches');
      expect(results[0]).toHaveProperty('metrics');
    });

    it('should sort results by lead score descending', () => {
      const advisors = [
        mockAdvisor({
          skills: [{ skill_level: 5, subtopic_id: 'estate-planning' }],
        }),
        mockAdvisor({
          skills: [{ skill_level: 9, subtopic_id: 'estate-planning' }],
        }),
      ];

      const client = mockClient({
        needs: [
          {
            subtopic_id: 'estate-planning',
            importance: 8,
            urgency: 7,
            horizon: 'now',
          },
        ],
      });

      const results = calculateMatchScores(advisors, client.needs);

      expect(results[0].leadScore).toBeGreaterThan(results[1].leadScore);
    });

    it('should handle perfect skill match', () => {
      const testCase = matchingTestCases.perfectMatch;
      const results = calculateMatchScores(
        [testCase.advisor as any],
        testCase.clientNeeds as any
      );

      expect(results[0].leadScore).toBeGreaterThanOrEqual(testCase.expectedScore.min);
      expect(results[0].leadScore).toBeLessThanOrEqual(testCase.expectedScore.max);
      expect(results[0].confidenceScore).toBeGreaterThan(70);
    });

    it('should penalize overqualified advisors', () => {
      const testCase = matchingTestCases.overqualified;
      const results = calculateMatchScores(
        [testCase.advisor as any],
        testCase.clientNeeds as any
      );

      expect(results[0].leadScore).toBeGreaterThanOrEqual(testCase.expectedScore.min);
      expect(results[0].leadScore).toBeLessThanOrEqual(testCase.expectedScore.max);
    });

    it('should heavily penalize underqualified advisors', () => {
      const testCase = matchingTestCases.underqualified;
      const results = calculateMatchScores(
        [testCase.advisor as any],
        testCase.clientNeeds as any
      );

      expect(results[0].leadScore).toBeLessThanOrEqual(testCase.expectedScore.max);
      expect(results[0].explanation.gaps.length).toBeGreaterThan(0);
    });

    it('should penalize advisors at capacity', () => {
      const testCase = matchingTestCases.atCapacity;
      const results = calculateMatchScores(
        [testCase.advisor as any],
        testCase.clientNeeds as any
      );

      expect(results[0].leadScore).toBeLessThanOrEqual(testCase.expectedScore.max);
      expect(results[0].explanation.why_not).toContain(
        expect.stringContaining('capacity')
      );
    });

    it('should calculate backup and support scores correctly', () => {
      const advisor = mockAdvisor({
        skills: [{ skill_level: 8, subtopic_id: 'estate-planning' }],
      });

      const client = mockClient({
        needs: [
          {
            subtopic_id: 'estate-planning',
            importance: 8,
            urgency: 7,
            horizon: 'now',
          },
        ],
      });

      const results = calculateMatchScores([advisor as any], client.needs as any);

      expect(results[0].backupScore).toBe(results[0].leadScore * 0.85);
      expect(results[0].supportScore).toBe(results[0].leadScore * 0.7);
    });

    it('should include confidence factors in explanation', () => {
      const advisor = mockAdvisor({
        skills: [{ skill_level: 8, subtopic_id: 'estate-planning' }],
      });

      const client = mockClient({
        needs: [
          {
            subtopic_id: 'estate-planning',
            importance: 8,
            urgency: 7,
            horizon: 'now',
          },
        ],
      });

      const results = calculateMatchScores([advisor as any], client.needs as any);

      expect(results[0].explanation.confidence_factors).toBeDefined();
      expect(results[0].explanation.confidence_factors.length).toBeGreaterThan(0);
    });

    it('should calculate metrics correctly', () => {
      const advisor = mockAdvisor({
        skills: [
          { skill_level: 8, subtopic_id: 'estate-planning' },
          { skill_level: 7, subtopic_id: 'tax-planning' },
        ],
        years_experience: 12,
      });

      const client = mockClient({
        needs: [
          {
            subtopic_id: 'estate-planning',
            importance: 8,
            urgency: 7,
            horizon: 'now',
          },
          {
            subtopic_id: 'tax-planning',
            importance: 7,
            urgency: 6,
            horizon: '1yr',
          },
        ],
      });

      const results = calculateMatchScores([advisor as any], client.needs as any);

      expect(results[0].metrics.skillCoverage).toBeGreaterThan(0);
      expect(results[0].metrics.averageSkillGap).toBeGreaterThanOrEqual(0);
      expect(results[0].metrics.experienceLevel).toBe('senior');
    });
  });

  describe('getScoreColor', () => {
    it('should return correct color for excellent score', () => {
      expect(getScoreColor(90)).toBe('excellent');
    });

    it('should return correct color for good score', () => {
      expect(getScoreColor(75)).toBe('good');
    });

    it('should return correct color for moderate score', () => {
      expect(getScoreColor(60)).toBe('moderate');
    });

    it('should return correct color for poor score', () => {
      expect(getScoreColor(30)).toBe('poor');
    });
  });

  describe('getScoreLabel', () => {
    it('should return correct label for excellent score', () => {
      expect(getScoreLabel(90)).toBe('Excellent Match');
    });

    it('should return correct label for good score', () => {
      expect(getScoreLabel(75)).toBe('Good Match');
    });

    it('should return correct label for moderate score', () => {
      expect(getScoreLabel(60)).toBe('Moderate Match');
    });

    it('should return correct label for poor score', () => {
      expect(getScoreLabel(30)).toBe('Poor Match');
    });
  });
});

describe('Match Score Edge Cases', () => {
  it('should handle advisor with no skills', () => {
    const advisor = mockAdvisor({ skills: [] });
    const client = mockClient({
      needs: [
        {
          subtopic_id: 'estate-planning',
          importance: 8,
          urgency: 7,
          horizon: 'now',
        },
      ],
    });

    const results = calculateMatchScores([advisor as any], client.needs as any);

    expect(results[0].leadScore).toBeDefined();
    expect(results[0].leadScore).toBeLessThan(50);
  });

  it('should handle client with no needs', () => {
    const advisor = mockAdvisor({
      skills: [{ skill_level: 8, subtopic_id: 'estate-planning' }],
    });

    const results = calculateMatchScores([advisor as any], []);

    expect(results[0].leadScore).toBeDefined();
  });

  it('should handle empty advisor list', () => {
    const client = mockClient({
      needs: [
        {
          subtopic_id: 'estate-planning',
          importance: 8,
          urgency: 7,
          horizon: 'now',
        },
      ],
    });

    const results = calculateMatchScores([], client.needs as any);

    expect(results).toHaveLength(0);
  });
});
