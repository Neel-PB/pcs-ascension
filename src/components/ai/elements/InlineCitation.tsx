import { ExternalLink } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Citation } from '@/types/contentBlock';

interface InlineCitationProps {
  citation: Citation;
}

export const InlineCitation = ({ citation }: InlineCitationProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <sup className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary bg-primary/10 rounded cursor-help hover:bg-primary/20 transition-colors">
          {citation.number}
        </sup>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold leading-tight">{citation.title}</h4>
            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
          </div>
          {citation.description && (
            <p className="text-xs text-muted-foreground">{citation.description}</p>
          )}
          {citation.quote && (
            <blockquote className="border-l-2 border-primary/30 pl-3 text-xs italic text-muted-foreground mt-2">
              "{citation.quote}"
            </blockquote>
          )}
          {citation.url && citation.url !== '#' && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline block truncate"
            >
              {citation.url}
            </a>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
