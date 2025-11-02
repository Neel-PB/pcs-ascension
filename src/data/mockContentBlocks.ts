import { ContentBlock } from '@/types/contentBlock';

export const mockWelcomeResponse: ContentBlock = {
  id: 'welcome-1',
  type: 'ai-response',
  content: `# Welcome to AI Hub

I'm your AI assistant, designed to help you with staffing analysis, forecasting, and workforce planning. I can:

- **Analyze trends** in your workforce data
- **Generate forecasts** based on historical patterns
- **Answer questions** about your organization
- **Create action plans** with clear next steps

Try asking me something like "What's our headcount trend this quarter?" or "Generate a hiring plan for Q4."`,
  metadata: { isStreaming: false, timestamp: new Date() }
};

export const mockResponseWithReasoning: ContentBlock = {
  id: 'demo-reasoning',
  type: 'ai-response',
  content: `Based on the analysis, I recommend **increasing your Q4 hiring target to 125 FTEs**. This accounts for:

- Projected 15% revenue growth
- Historical attrition rate of 8%
- Seasonal demand patterns from previous years

This staffing level will ensure you maintain optimal team capacity while avoiding over-hiring.`,
  metadata: {
    isStreaming: false,
    reasoning: {
      content: `To arrive at this recommendation, I analyzed:

1. **Historical Growth Patterns**: Reviewed Q3 and Q4 data from the past 3 years
2. **Attrition Trends**: Calculated average quarterly turnover (7.5-8.5%)
3. **Revenue Correlation**: Found strong correlation (r=0.87) between revenue growth and headcount needs
4. **Seasonal Adjustments**: Q4 typically requires 10-12% more staff due to year-end initiatives

The 125 FTE target provides a 5% buffer for unexpected attrition while staying within budget constraints.`,
      duration: 2800
    }
  }
};

export const mockResponseWithCitations: ContentBlock = {
  id: 'demo-citations',
  type: 'ai-response',
  content: `According to recent industry research, **remote work has increased productivity by 13%**[1] while reducing operational costs by an average of $11,000 per employee annually[2].

However, hybrid models show the highest employee satisfaction scores[3], with 76% of workers preferring 2-3 days in the office per week. This suggests a balanced approach may be optimal for your organization.`,
  metadata: {
    isStreaming: false,
    citations: [
      {
        number: 1,
        title: 'Stanford Remote Work Productivity Study',
        url: 'https://example.com/stanford-study',
        description: '2-year study of 16,000 workers',
        quote: 'Remote workers demonstrated a 13% performance increase'
      },
      {
        number: 2,
        title: 'Global Workplace Analytics Report 2024',
        url: 'https://example.com/gwa-report',
        description: 'Cost-benefit analysis of remote work',
        quote: 'Average savings of $11,000 per half-time remote worker'
      },
      {
        number: 3,
        title: 'Harvard Business Review: The Hybrid Work Model',
        url: 'https://example.com/hbr-hybrid',
        description: 'Survey of 5,000 knowledge workers',
        quote: '76% prefer hybrid arrangements with office presence 2-3 days weekly'
      }
    ]
  }
};

export const mockResponseWithTasks: ContentBlock = {
  id: 'demo-tasks',
  type: 'ai-response',
  content: `I've created an action plan for optimizing your Q4 staffing. Here are the recommended next steps:`,
  metadata: {
    isStreaming: false,
    tasks: [
      {
        id: 'task-1',
        title: 'Review current headcount by department',
        description: 'Audit actual vs. planned FTEs across all teams',
        status: 'completed'
      },
      {
        id: 'task-2',
        title: 'Schedule Q4 hiring committee meeting',
        description: 'Align stakeholders on hiring priorities and timeline',
        status: 'in-progress'
      },
      {
        id: 'task-3',
        title: 'Update budget forecast for new hires',
        description: 'Calculate total cost impact of recommended staffing changes',
        status: 'pending'
      },
      {
        id: 'task-4',
        title: 'Draft job descriptions for priority roles',
        description: 'Focus on high-impact positions: Senior Engineer, Product Manager',
        status: 'pending'
      },
      {
        id: 'task-5',
        title: 'Set up recruiting pipeline metrics dashboard',
        description: 'Track time-to-hire, candidate quality, and conversion rates',
        status: 'pending'
      }
    ]
  }
};

export const mockComplexResponse: ContentBlock = {
  id: 'demo-complex',
  type: 'ai-response',
  content: `# Staffing Optimization Analysis

After analyzing your workforce data, I've identified **three key opportunities** for Q4:

## 1. Engineering Team Expansion
Your engineering team is currently at 85% capacity[1], which is below the industry benchmark of 92-95%. I recommend adding 8 senior engineers to support the new product roadmap.

## 2. Contractor-to-FTE Conversion
Converting 12 long-term contractors to full-time employees could save approximately **$240K annually**[2] while improving retention and team cohesion.

## 3. Cross-Training Initiative
Implement cross-functional training to reduce single points of failure and improve operational resilience.

Let me know if you'd like me to dive deeper into any of these recommendations.`,
  metadata: {
    isStreaming: false,
    reasoning: {
      content: `I identified these opportunities by:

1. Comparing your team capacity metrics against 50+ similar organizations
2. Analyzing contractor tenure data (avg. 18 months) and cost structures
3. Reviewing incident reports that showed knowledge silos as a risk factor
4. Correlating training investments with employee retention rates (14% improvement)

The recommendations prioritize high-impact, cost-effective interventions that align with your strategic goals.`,
      duration: 3200
    },
    citations: [
      {
        number: 1,
        title: 'Internal Capacity Metrics Dashboard',
        url: '#',
        description: 'Current sprint velocity and utilization data'
      },
      {
        number: 2,
        title: 'Contractor Cost Analysis Report',
        url: '#',
        description: 'Comparison of contractor vs. FTE total compensation'
      }
    ],
    tasks: [
      {
        id: 'task-c1',
        title: 'Review engineering hiring plan',
        status: 'pending'
      },
      {
        id: 'task-c2',
        title: 'Prepare contractor conversion proposal',
        status: 'pending'
      },
      {
        id: 'task-c3',
        title: 'Design cross-training curriculum',
        status: 'pending'
      }
    ]
  }
};

// Reasoning blocks for simple responses
export const simpleReasoningBlocks = [
  {
    content: `To provide this overview, I:

1. **Queried the staffing database** for current FTE counts across all departments
2. **Calculated growth metrics** by comparing current quarter to previous quarter data
3. **Analyzed open requisition status** to identify active hiring needs
4. **Evaluated turnover rates** against industry benchmarks and internal targets
5. **Assessed contractor ratios** to ensure optimal workforce composition

The 8.2% growth rate indicates healthy expansion, while the Engineering team's acceleration aligns with your product roadmap priorities.`,
    duration: 2400
  },
  {
    content: `My forecasting approach involved:

1. **Historical pattern analysis**: Examined 12 months of hiring data to identify seasonal trends
2. **Department capacity modeling**: Calculated current team utilization and projected workload
3. **Budget constraint validation**: Cross-referenced recommendations against approved compensation budgets
4. **Time-to-fill estimation**: Factored in your average 45-day hiring cycle for realistic planning
5. **Role prioritization matrix**: Weighted positions by business impact and urgency

The 18-22 FTE range provides flexibility while maintaining budget discipline. Technical roles were prioritized due to longer lead times.`,
    duration: 3100
  },
  {
    content: `To summarize my capabilities, I evaluated:

1. **Available data sources**: Your staffing database, historical trends, and industry benchmarks
2. **Analysis functions**: Statistical modeling, forecasting algorithms, and comparison tools
3. **Output formats**: Reports, visualizations, and actionable recommendations
4. **Common use cases**: Based on frequent queries from similar organizations

Each capability is designed to help you make data-driven workforce decisions with minimal manual effort.`,
    duration: 2600
  }
];

export const demoScenarios = {
  simple: [mockWelcomeResponse],
  reasoning: [mockResponseWithReasoning],
  citations: [mockResponseWithCitations],
  tasks: [mockResponseWithTasks],
  complex: [mockComplexResponse]
};
