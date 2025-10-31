import { Sparkles, TrendingUp, Users, FileBarChart } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AIWelcomeCardsProps {
  onCardClick: (action: string) => void;
}

const welcomeCards = [
  {
    icon: TrendingUp,
    title: 'Analyze Trends',
    description: 'Help me analyze staffing trends',
    action: 'Can you help me analyze current staffing trends and identify any patterns?',
  },
  {
    icon: Users,
    title: 'Team Insights',
    description: 'Show team performance metrics',
    action: 'What are the key performance metrics for my team this quarter?',
  },
  {
    icon: FileBarChart,
    title: 'Generate Report',
    description: 'Create a summary report',
    action: 'Can you generate a summary report of recent workforce changes?',
  },
  {
    icon: Sparkles,
    title: 'Ask Anything',
    description: 'Get help with any question',
    action: 'What can you help me with today?',
  },
];

export const AIWelcomeCards = ({ onCardClick }: AIWelcomeCardsProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold">How can I help you today?</h2>
          <p className="text-muted-foreground">
            Choose a quick action below or start a conversation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {welcomeCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="p-4 cursor-pointer hover:bg-accent hover:shadow-md transition-all group"
                onClick={() => onCardClick(card.action)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">{card.title}</h3>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
