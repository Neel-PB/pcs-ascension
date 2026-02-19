import type { TooltipRenderProps } from 'react-joyride';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  return (
    <div {...tooltipProps} className="z-[10000]">
      <Card className="max-w-[400px] w-auto min-w-[340px] shadow-2xl shadow-primary/5 border-primary/20 border-t-2 border-t-primary overflow-hidden">
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
        <CardContent className="px-5 pb-3">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </div>
        </CardContent>
        <CardFooter className="px-5 pb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            {...skipProps}
            className="text-muted-foreground/70 text-xs hover:text-foreground transition-colors"
          >
            Skip tour
          </Button>
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
                {index === size - 1 ? 'Finish Tour' : 'Next'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
