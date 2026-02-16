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
  return (
    <div {...tooltipProps} className="z-[10000]">
      <Card className="w-[340px] shadow-xl border-primary/20">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{step.title as string}</CardTitle>
            <span className="text-xs text-muted-foreground font-medium">
              {index + 1} of {size}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.content as string}
          </p>
        </CardContent>
        <CardFooter className="px-5 pb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            {...skipProps}
            className="text-muted-foreground text-xs"
          >
            Skip
          </Button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" {...backProps}>
                Back
              </Button>
            )}
            {continuous && (
              <Button size="sm" {...primaryProps}>
                {index === size - 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
