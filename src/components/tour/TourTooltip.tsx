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
  const { setSkipMode, singleSection, isOnboarding } = useTourStore();

  // Section metadata from step.data
  const sectionName = (step as any).data?.sectionName;
  const sectionIndex = (step as any).data?.sectionIndex;
  const totalSections = (step as any).data?.totalSections;
  const nextSectionName = (step as any).data?.nextSectionName;
  const isLastSection = (step as any).data?.isLastSection;
  const hasSectionMeta = typeof sectionIndex === 'number' && totalSections;
  const isWide = (step as any).data?.wideTooltip;

  const isLastStep = index === size - 1;

  // Determine primary button label
  let primaryLabel = 'Next';
  if (isLastStep) {
    if (singleSection) {
      primaryLabel = 'Done';
    } else if (isLastSection || !nextSectionName) {
      primaryLabel = 'Complete Tour';
    } else {
      primaryLabel = `Continue to ${nextSectionName}`;
    }
  }

  const handleSkipSection = () => {
    setSkipMode('section');
    skipProps.onClick(new MouseEvent('click') as any);
  };

  const handleSkipAll = () => {
    setSkipMode('all');
    skipProps.onClick(new MouseEvent('click') as any);
  };

  return (
    <div {...tooltipProps} className="z-[10000]">
      <Card className={`${isWide ? 'max-w-[560px] min-w-[480px]' : 'max-w-[480px] min-w-[380px]'} w-auto backdrop-blur-sm bg-card/95 shadow-xl shadow-black/10 dark:shadow-black/30 border-primary/20 overflow-hidden animate-in fade-in-0 zoom-in-[0.98] duration-200`}>
        {/* Gradient progress bar */}
        <div className="h-[3px] w-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardHeader className="pb-1.5 pt-3 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{step.title as string}</CardTitle>
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums rounded-full bg-muted px-2 py-0.5">
              {index + 1}/{size}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-2 space-y-2">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </div>

          {/* Section badge */}
          {hasSectionMeta && !singleSection && (
            <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 border-l-2 border-primary pl-2 py-0.5 text-xs font-medium text-primary">
                <span>{sectionName}</span>
                <span className="text-primary/40">·</span>
                <span className="text-primary/60 tabular-nums">{sectionIndex + 1} of {totalSections}</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-5 pb-3 flex items-center justify-between gap-2 border-t border-border/30 pt-2.5">
          {/* Left: Skip actions */}
          <div className="flex items-center gap-1">
            {isOnboarding ? null : singleSection ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipAll}
                className="text-muted-foreground/60 text-xs hover:text-destructive hover:bg-muted transition-colors px-2 rounded-lg"
              >
                Skip
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipAll}
                  className="text-muted-foreground/60 text-xs hover:text-destructive hover:bg-muted transition-colors px-2 rounded-lg"
                >
                  Skip All
                </Button>
                {hasSectionMeta && !isLastSection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipSection}
                    className="text-muted-foreground/80 text-xs hover:text-foreground hover:bg-muted transition-colors px-2 rounded-lg"
                  >
                    Skip Section
                  </Button>
                )}
              </>
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
              <Button variant="outline" size="sm" {...backProps} className="shrink-0 transition-colors rounded-lg">
                Back
              </Button>
            )}
            {continuous && (
              <Button size="sm" {...primaryProps} className="shrink-0 transition-transform hover:scale-[1.02] rounded-lg shadow-sm">
                {primaryLabel}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
