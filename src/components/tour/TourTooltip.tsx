import type { TooltipRenderProps } from 'react-joyride';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTourStore } from '@/stores/useTourStore';

export function TourTooltip({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size,
}: TooltipRenderProps) {
  const progress = ((index + 1) / size) * 100;
  const { setSkipMode } = useTourStore();

  // Section metadata from step.data
  const sectionName = (step as any).data?.sectionName;
  const sectionIndex = (step as any).data?.sectionIndex;
  const totalSections = (step as any).data?.totalSections;
  const nextSectionName = (step as any).data?.nextSectionName;
  const isLastSection = (step as any).data?.isLastSection;
  const hasSectionMeta = typeof sectionIndex === 'number' && totalSections;

  const isLastStep = index === size - 1;

  // Determine primary button label
  let primaryLabel = 'Next';
  if (isLastStep) {
    if (isLastSection || !nextSectionName) {
      primaryLabel = 'Complete Tour';
    } else {
      primaryLabel = `Continue to ${nextSectionName}`;
    }
  }

  const handleSkipSection = () => {
    setSkipMode('section');
    // Trigger Joyride's skip by calling the skip button's onClick
    skipProps.onClick(new MouseEvent('click') as any);
  };

  const handleSkipAll = () => {
    setSkipMode('all');
    skipProps.onClick(new MouseEvent('click') as any);
  };

  return (
    <div {...tooltipProps} className="z-[10000]">
      <Card className="max-w-[420px] w-auto min-w-[340px] shadow-2xl shadow-primary/5 border-primary/20 border-t-2 border-t-primary overflow-hidden">
        {/* Progress bar */}
        <div className="h-[3px] w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{step.title as string}</CardTitle>
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {index + 1}/{size}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-3 space-y-3">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </div>

          {/* Section badge */}
          {hasSectionMeta && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span>{sectionName}</span>
                <span className="text-primary/50">·</span>
                <span className="text-primary/70">{sectionIndex + 1} of {totalSections}</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-5 pb-4 flex items-center justify-between gap-2">
          {/* Left: Skip actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipAll}
              className="text-muted-foreground/60 text-xs hover:text-destructive transition-colors px-2"
            >
              Skip All
            </Button>
            {hasSectionMeta && !isLastSection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipSection}
                className="text-muted-foreground/80 text-xs hover:text-foreground transition-colors px-2"
              >
                Skip Section
              </Button>
            )}
          </div>

          {/* Right: Nav buttons */}
          <div className="flex items-center gap-2">
            {/* Step dots - hide when too many steps */}
            {size <= 10 && (
              <div className="flex items-center gap-1 mr-1">
                {Array.from({ length: size }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === index
                        ? 'w-4 bg-primary'
                        : i < index
                          ? 'w-1.5 bg-primary/40'
                          : 'w-1.5 bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
            )}
            {index > 0 && (
              <Button variant="outline" size="sm" {...backProps} className="shrink-0 transition-colors">
                Back
              </Button>
            )}
            {continuous && (
              <Button size="sm" {...primaryProps} className="shrink-0 transition-transform hover:scale-[1.02]">
                {primaryLabel}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
